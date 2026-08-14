import { createHash, randomUUID } from "node:crypto";
import { execFileSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import type { ExtensionAPI, ExtensionCommandContext, ExtensionContext } from "@earendil-works/pi-coding-agent";

const SUBAGENT_DELEGATION_REQUEST_EVENT = "prompt-template:subagent:request";
const SUBAGENT_DELEGATION_RESPONSE_EVENT = "prompt-template:subagent:response";
const SUBAGENT_DELEGATION_UPDATE_EVENT = "prompt-template:subagent:update";

interface SubagentDelegationRequest {
	requestId: string;
	ownerRunId: string;
	nodeId: string;
	agent: string;
	task: string;
	context: "fresh";
	cwd: string;
	thinking: "high";
	timeoutMs: number;
	artifacts: false;
	result: { kind: "structured"; schema: Record<string, unknown> };
}

interface SubagentDelegationResponse {
	requestId: string;
	ownerRunId?: string;
	nodeId?: string;
	status: string;
	error?: string;
	agent?: string;
	model?: string;
	thinking?: string;
	result?: { kind: "text"; text: string } | { kind: "structured"; value: unknown };
}

const EXTENSION_ID = "hospital-spec";
const STATE_ROOT = path.join(os.homedir(), ".pi", "agent", "state", EXTENSION_ID);
const WORKTREE_ROOT = path.join(STATE_ROOT, "worktrees");
const PARENT = { provider: "opencode-go", model: "deepseek-v4-pro", thinking: "high" } as const;
const STAGE_TIMEOUT_MS = 60 * 60 * 1000;

const STAFF = {
	groundwork: { agent: "workflow-groundwork", model: "opencode-go/deepseek-v4-pro", thinking: "high" },
	evidence: { agent: "workflow-evidence", model: "opencode-go/deepseek-v4-flash", thinking: "high" },
	toSpec: { agent: "workflow-to-spec", model: "openai-codex/gpt-5.6-sol", thinking: "high" },
	commit: { agent: "workflow-commit", model: "openai-codex/gpt-5.6-luna", thinking: "high" },
	adversarial: { agent: "workflow-adversarial-spec", model: "openai-codex/gpt-5.6-sol", thinking: "high" },
	readiness: { agent: "workflow-spec-readiness", model: "openai-codex/gpt-5.6-terra", thinking: "high" },
} as const;

type Phase = "groundwork" | "evidence" | "to-spec" | "commit" | "review";
type WorkflowStatus = "running" | "waiting" | "blocked" | "complete";

interface OwnerAnswer {
	question: string;
	answer: string;
}

interface ReviewRecord {
	adversarial: string;
	readiness: string;
	commitSha: string;
}

interface HospitalState {
	version: 1;
	projectKey: string;
	cwd: string;
	repoRoot: string;
	task: string;
	phase: Phase;
	status: WorkflowStatus;
	parentApproved: boolean;
	attempt: number;
	updatedAt: string;
	activeStage?: string;
	question?: string;
	lastError?: string;
	answers: OwnerAnswer[];
	groundwork?: string;
	evidence?: string;
	specRoot?: string;
	specFiles?: string[];
	preCommitHead?: string;
	commitSha?: string;
	review?: ReviewRecord;
	worktree?: string;
}

interface StageResult {
	status: "complete" | "question" | "blocked";
	summary: string;
	payload: string;
	question: string;
}

interface SpecResult extends StageResult {
	specRoot: string;
	specFiles: string[];
}

interface CommitResult extends StageResult {
	commitSha: string;
	committedPaths: string[];
}

interface ReviewResult extends StageResult {
	verdict: "PASS" | "FAIL" | "READY" | "NOT READY";
	next: "review-stage gate" | "to-spec" | "wait for answer";
	report: string;
}

const stageSchema = {
	type: "object",
	additionalProperties: false,
	required: ["status", "summary", "payload", "question"],
	properties: {
		status: { enum: ["complete", "question", "blocked"] },
		summary: { type: "string" },
		payload: { type: "string" },
		question: { type: "string" },
	},
};

const specSchema = {
	...stageSchema,
	required: [...stageSchema.required, "specRoot", "specFiles"],
	properties: {
		...stageSchema.properties,
		specRoot: { type: "string" },
		specFiles: { type: "array", items: { type: "string" }, minItems: 0, maxItems: 4 },
	},
};

const commitSchema = {
	...stageSchema,
	required: [...stageSchema.required, "commitSha", "committedPaths"],
	properties: {
		...stageSchema.properties,
		commitSha: { type: "string" },
		committedPaths: { type: "array", items: { type: "string" }, maxItems: 4 },
	},
};

const reviewSchema = {
	...stageSchema,
	required: [...stageSchema.required, "verdict", "next", "report"],
	properties: {
		...stageSchema.properties,
		verdict: { enum: ["PASS", "FAIL", "READY", "NOT READY"] },
		next: { enum: ["review-stage gate", "to-spec", "wait for answer"] },
		report: { type: "string" },
	},
};

const runningProjects = new Set<string>();

function projectKey(cwd: string): string {
	return createHash("sha256").update(path.resolve(cwd)).digest("hex").slice(0, 20);
}

function statePath(cwd: string): string {
	return path.join(STATE_ROOT, `${projectKey(cwd)}.json`);
}

function readState(cwd: string): HospitalState | undefined {
	try {
		const parsed = JSON.parse(fs.readFileSync(statePath(cwd), "utf8")) as HospitalState;
		return parsed.version === 1 && parsed.cwd === path.resolve(cwd) ? parsed : undefined;
	} catch {
		return undefined;
	}
}

function writeState(state: HospitalState): void {
	fs.mkdirSync(STATE_ROOT, { recursive: true });
	state.updatedAt = new Date().toISOString();
	const target = statePath(state.cwd);
	const temporary = `${target}.${process.pid}.${randomUUID()}.tmp`;
	fs.writeFileSync(temporary, `${JSON.stringify(state, null, 2)}\n`, { mode: 0o600 });
	fs.renameSync(temporary, target);
}

function git(cwd: string, args: string[]): string {
	return execFileSync("git", args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
}

function repoRoot(cwd: string): string {
	return path.resolve(git(cwd, ["rev-parse", "--show-toplevel"]));
}

function relativeRepoPath(root: string, candidate: string): string {
	const absolute = path.resolve(root, candidate);
	const relative = path.relative(root, absolute).split(path.sep).join("/");
	if (!relative || relative.startsWith("../") || path.isAbsolute(relative)) {
		throw new Error(`Spec path repository boundary dışında: ${candidate}`);
	}
	return relative;
}

function exactLines(values: string[]): string {
	return values.map((value) => `- ${value}`).join("\n") || "- none";
}

function answersText(state: HospitalState): string {
	if (state.answers.length === 0) return "Owner answers: none";
	return ["Owner answers (verbatim):", ...state.answers.flatMap((item) => [`Question: ${item.question}`, `Answer: ${item.answer}`])].join("\n");
}

function stageInstructions(): string {
	return [
		"This is a hospital-spec structured invocation.",
		"Do not call contact_supervisor in this invocation.",
		"If a material owner decision is missing, call structured_output with status=question, one plain question, and all evidence in payload.",
		"If the stage cannot safely proceed for a non-question reason, use status=blocked and explain it in summary/payload.",
		"Otherwise complete the assigned stage and call structured_output exactly once with status=complete.",
		"Do not create progress, checkpoint, receipt, or report files unless the task explicitly authorizes them.",
	].join("\n");
}

async function ensureParent(pi: ExtensionAPI, ctx: ExtensionContext, state?: HospitalState): Promise<boolean> {
	const exact = ctx.model?.provider === PARENT.provider && ctx.model?.id === PARENT.model && ctx.thinkingLevel === PARENT.thinking;
	if (exact) return true;
	let approved = state?.parentApproved === true;
	if (!approved) {
		if (!ctx.hasUI) return false;
		approved = await ctx.ui.confirm(
			"Hospital parent",
			"Bu workflow için parent modeli DeepSeek V4 Pro / high olarak değiştirilsin mi?",
		);
	}
	if (!approved) return false;
	const model = ctx.modelRegistry.find(PARENT.provider, PARENT.model);
	if (!model) throw new Error(`Zorunlu parent modeli bulunamadı: ${PARENT.provider}/${PARENT.model}`);
	const switched = await pi.setModel(model);
	if (!switched) throw new Error(`Zorunlu parent modeli için giriş/anahtar kullanılamıyor: ${PARENT.provider}/${PARENT.model}`);
	pi.setThinkingLevel(PARENT.thinking);
	return true;
}

function frontmatter(text: string): Record<string, string> {
	const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
	if (!match) return {};
	const values: Record<string, string> = {};
	for (const line of match[1].split(/\r?\n/)) {
		const separator = line.indexOf(":");
		if (separator < 1) continue;
		values[line.slice(0, separator).trim()] = line.slice(separator + 1).trim();
	}
	return values;
}

async function preflight(ctx: ExtensionContext, staff: keyof typeof STAFF, _task: string, _cwd: string): Promise<void> {
	const expected = STAFF[staff];
	const agentPath = path.join(os.homedir(), ".pi", "agent", "agents", `${expected.agent}.md`);
	let values: Record<string, string>;
	try {
		values = frontmatter(fs.readFileSync(agentPath, "utf8"));
	} catch {
		throw new Error(`Zorunlu ajan bulunamadı: ${expected.agent}`);
	}
	if (values.name !== expected.agent || values.model !== expected.model || values.thinking !== expected.thinking || values.fallbackModels !== "[]") {
		throw new Error(`${expected.agent} sabit model/fallback sözleşmesi eşleşmiyor.`);
	}
	const [provider, ...modelParts] = expected.model.split("/");
	if (!ctx.modelRegistry.find(provider, modelParts.join("/"))) {
		throw new Error(`Zorunlu model katalogda yok: ${expected.model}`);
	}
}

function delegate<T>(
	pi: ExtensionAPI,
	ctx: ExtensionContext,
	state: HospitalState,
	staff: keyof typeof STAFF,
	task: string,
	schema: Record<string, unknown>,
	cwd = state.repoRoot,
): Promise<T> {
	const expected = STAFF[staff];
	state.attempt += 1;
	state.activeStage = staff;
	state.status = "running";
	writeState(state);
	const requestId = randomUUID();
	const ownerRunId = `hospital-${state.projectKey}`;
	const nodeId = `${staff}-${state.attempt}`;
	const startedAt = Date.now();
	let lastProgress = "starting";
	let updateUnsubscribe: (() => void) | undefined;
	let responseUnsubscribe: (() => void) | undefined;
	const interval = setInterval(() => {
		if (ctx.hasUI) {
			const minutes = Math.max(1, Math.floor((Date.now() - startedAt) / 60000));
			ctx.ui.setStatus(EXTENSION_ID, `hospital-spec · ${staff} · ${minutes}m · ${lastProgress}`);
		}
	}, 15000);
	return new Promise<T>((resolve, reject) => {
		const finish = () => {
			clearInterval(interval);
			updateUnsubscribe?.();
			responseUnsubscribe?.();
		};
		updateUnsubscribe = pi.events.on(SUBAGENT_DELEGATION_UPDATE_EVENT, (payload: unknown) => {
			const update = payload as { requestId?: string; ownerRunId?: string; nodeId?: string; currentTool?: string; durationMs?: number };
			if (update.requestId !== requestId || update.ownerRunId !== ownerRunId || update.nodeId !== nodeId) return;
			lastProgress = update.currentTool ? `tool:${update.currentTool}` : "reasoning";
		});
		responseUnsubscribe = pi.events.on(SUBAGENT_DELEGATION_RESPONSE_EVENT, (payload: unknown) => {
			const response = payload as SubagentDelegationResponse;
			if (response.requestId !== requestId || response.ownerRunId !== ownerRunId || response.nodeId !== nodeId) return;
			finish();
			if (response.status !== "completed") {
				reject(new Error(`${expected.agent} ${response.status}: ${response.error ?? "terminal response missing"}`));
				return;
			}
			if (response.agent !== expected.agent || response.model?.replace(/:(off|minimal|low|medium|high|xhigh|max)$/, "") !== expected.model || response.thinking !== expected.thinking) {
				reject(new Error(`${expected.agent} runtime model kanıtı eşleşmedi: ${response.model ?? "none"}/${response.thinking ?? "none"}`));
				return;
			}
			if (response.result?.kind !== "structured") {
				reject(new Error(`${expected.agent} structured sonuç döndürmedi.`));
				return;
			}
			resolve(response.result.value as T);
		});
		const request: SubagentDelegationRequest = {
			requestId,
			ownerRunId,
			nodeId,
			agent: expected.agent,
			task,
			context: "fresh",
			cwd,
			thinking: expected.thinking,
			timeoutMs: STAGE_TIMEOUT_MS,
			artifacts: false,
			result: { kind: "structured", schema },
		};
		pi.events.emit(SUBAGENT_DELEGATION_REQUEST_EVENT, request);
	});
}

function handleStageResult(state: HospitalState, result: StageResult): "complete" | "waiting" {
	if (result.status === "blocked") throw new Error(result.summary || result.payload || "Stage BLOCKED");
	if (result.status === "question") {
		const question = result.question.trim();
		if (!question) throw new Error("Question state boş soru döndürdü.");
		state.status = "waiting";
		state.question = question;
		state.lastError = result.payload.trim() || undefined;
		state.activeStage = undefined;
		writeState(state);
		return "waiting";
	}
	if (!result.payload.trim()) throw new Error("Complete stage boş payload döndürdü.");
	return "complete";
}

async function askPendingQuestion(ctx: ExtensionContext, state: HospitalState): Promise<boolean> {
	if (!state.question) throw new Error("WAIT_FOR_OWNER state soru içermiyor.");
	if (!ctx.hasUI) return false;
	const answer = await ctx.ui.input("Hospital workflow owner question", state.question);
	if (!answer?.trim()) return false;
	state.answers.push({ question: state.question, answer });
	state.question = undefined;
	state.lastError = undefined;
	state.groundwork = undefined;
	state.evidence = undefined;
	state.specRoot = undefined;
	state.specFiles = undefined;
	state.preCommitHead = undefined;
	state.commitSha = undefined;
	state.review = undefined;
	cleanupWorktree(state);
	state.phase = "groundwork";
	state.status = "running";
	writeState(state);
	return true;
}

function validateSpecFiles(state: HospitalState, result: SpecResult): void {
	if (result.specFiles.length !== 4) throw new Error(`to-spec tam dört dosya döndürmedi: ${result.specFiles.length}`);
	const files = [...new Set(result.specFiles.map((item) => relativeRepoPath(state.repoRoot, item)))];
	if (files.length !== 4) throw new Error("to-spec dosya listesinde tekrar var.");
	for (const file of files) {
		if (!fs.statSync(path.join(state.repoRoot, file)).isFile()) throw new Error(`Spec dosyası bulunamadı: ${file}`);
	}
	const root = path.resolve(state.repoRoot, result.specRoot);
	for (const file of files) {
		if (!path.resolve(state.repoRoot, file).startsWith(`${root}${path.sep}`)) throw new Error(`Spec dosyası çıktı kökü dışında: ${file}`);
	}
	state.specRoot = relativeRepoPath(state.repoRoot, result.specRoot);
	state.specFiles = files.sort();
}

function commitPaths(root: string, sha: string): string[] {
	return git(root, ["diff-tree", "--root", "--no-commit-id", "--name-only", "-r", sha]).split("\n").filter(Boolean).sort();
}

function validateCommit(state: HospitalState, result: CommitResult): void {
	const sha = result.commitSha.trim().toLowerCase();
	if (!/^[0-9a-f]{40}$/.test(sha)) throw new Error(`Commit SHA malformed: ${result.commitSha}`);
	if (git(state.repoRoot, ["rev-parse", "HEAD"]) !== sha) throw new Error("Commit ajanının SHA'sı current HEAD değil.");
	const actual = commitPaths(state.repoRoot, sha);
	const expected = [...(state.specFiles ?? [])].sort();
	if (JSON.stringify(actual) !== JSON.stringify(expected)) {
		throw new Error(`Commit yalnız dört spec dosyasını içermiyor. actual=${actual.join(",")}`);
	}
	if (state.preCommitHead) {
		const parent = git(state.repoRoot, ["rev-parse", `${sha}^`]);
		if (parent !== state.preCommitHead) throw new Error("Commit beklenen başlangıç HEAD'ine bağlı değil.");
	}
	state.commitSha = sha;
}

function adoptInterruptedCommit(state: HospitalState): boolean {
	if (!state.preCommitHead || !state.specFiles) return false;
	const head = git(state.repoRoot, ["rev-parse", "HEAD"]);
	if (head === state.preCommitHead) return false;
	try {
		const parent = git(state.repoRoot, ["rev-parse", `${head}^`]);
		if (parent !== state.preCommitHead) return false;
		if (JSON.stringify(commitPaths(state.repoRoot, head)) !== JSON.stringify([...state.specFiles].sort())) return false;
		state.commitSha = head;
		return true;
	} catch {
		return false;
	}
}

function createWorktree(state: HospitalState): string {
	cleanupWorktree(state);
	fs.mkdirSync(WORKTREE_ROOT, { recursive: true });
	const target = path.join(WORKTREE_ROOT, `${state.projectKey}-${randomUUID()}`);
	git(state.repoRoot, ["worktree", "add", "--detach", target, state.commitSha!]);
	state.worktree = target;
	writeState(state);
	return target;
}

function cleanupWorktree(state: HospitalState): void {
	if (!state.worktree) return;
	const target = path.resolve(state.worktree);
	const boundary = `${path.resolve(WORKTREE_ROOT)}${path.sep}`;
	if (!target.startsWith(boundary)) throw new Error(`Refusing unexpected worktree cleanup: ${target}`);
	try {
		git(state.repoRoot, ["worktree", "remove", "--force", target]);
	} catch {
		// A process restart may leave only the directory; prune below is scoped to our own root.
	}
	if (fs.existsSync(target)) fs.rmSync(target, { recursive: true, force: true });
	state.worktree = undefined;
}

function validateReview(role: "adversarial" | "readiness", result: ReviewResult): void {
	if (result.status === "blocked") throw new Error(`${role} reviewer BLOCKED: ${result.summary || result.payload}`);
	if (result.status === "question") {
		if (!result.question.trim() || result.next !== "wait for answer") throw new Error(`${role} question/Next malformed.`);
		return;
	}
	const report = result.report.trim();
	if (!report) throw new Error(`${role} boş rapor döndürdü.`);
	const first = report.split(/\r?\n/, 1)[0].trim();
	const last = report.split(/\r?\n/).filter((line) => line.trim()).at(-1)?.trim();
	if (role === "adversarial") {
		if (!(["PASS", "FAIL"].includes(result.verdict)) || first !== result.verdict) throw new Error("Adversarial verdict/report malformed.");
		if (result.verdict === "PASS" && (result.next !== "review-stage gate" || last !== "Next: review-stage gate")) throw new Error("PASS/Next malformed.");
		if (result.verdict === "FAIL" && result.next !== "to-spec") throw new Error("FAIL/Next malformed.");
	} else {
		if (!(["READY", "NOT READY"].includes(result.verdict)) || first !== result.verdict) throw new Error("Readiness verdict/report malformed.");
		if (result.verdict === "READY" && (result.next !== "review-stage gate" || last !== "Next: review-stage gate")) throw new Error("READY/Next malformed.");
		if (result.verdict === "NOT READY" && result.next !== "to-spec") throw new Error("NOT READY/Next malformed.");
	}
}

async function reviewWithRetry(
	pi: ExtensionAPI,
	ctx: ExtensionContext,
	state: HospitalState,
	role: "adversarial" | "readiness",
	task: string,
	cwd: string,
): Promise<ReviewResult> {
	const staff = role === "adversarial" ? "adversarial" : "readiness";
	for (let attempt = 0; attempt < 2; attempt += 1) {
		try {
			await preflight(ctx, staff, task, cwd);
			const result = await delegate<ReviewResult>(pi, ctx, state, staff, task, reviewSchema, cwd);
			validateReview(role, result);
			return result;
		} catch (error) {
			if (attempt === 1) throw error;
		}
	}
	throw new Error(`${role} reviewer retry exhausted.`);
}

async function continueWorkflow(pi: ExtensionAPI, ctx: ExtensionContext, state: HospitalState): Promise<void> {
	if (runningProjects.has(state.projectKey)) return;
	runningProjects.add(state.projectKey);
	try {
		if (!(await ensureParent(pi, ctx, state))) {
			state.status = "blocked";
			state.lastError = "DeepSeek V4 Pro/high parent onayı verilmedi.";
			writeState(state);
			return;
		}
		state.parentApproved = true;
		writeState(state);
		if (state.status === "waiting" && !(await askPendingQuestion(ctx, state))) {
			if (ctx.hasUI) ctx.ui.notify(`Owner cevabı bekleniyor: ${state.question}`, "warning");
			return;
		}

		while (state.status === "running") {
			if (state.phase === "groundwork") {
				const task = [
					stageInstructions(),
					"Ground the following task from repository evidence. Do not write files.",
					"Return payload containing the exact four-field outcome lock, positive-fit brief, and decision-bearing evidence paths/hashes.",
					`Task:\n${state.task}`,
					answersText(state),
				].join("\n\n");
				await preflight(ctx, "groundwork", task, state.repoRoot);
				const result = await delegate<StageResult>(pi, ctx, state, "groundwork", task, stageSchema);
				if (handleStageResult(state, result) === "waiting") {
					if (await askPendingQuestion(ctx, state)) continue;
					return;
				}
				state.groundwork = result.payload;
				state.phase = "evidence";
				state.activeStage = undefined;
				writeState(state);
				continue;
			}

			if (state.phase === "evidence") {
				const task = [
					stageInstructions(),
					"Scan only direct load-bearing dependencies from the grounded owner/path and producer/consumer symbols. Do not review or propose a solution. Do not write files.",
					"Return payload as a concise path + role + Git blob/dirty state + reason inventory.",
					`Task:\n${state.task}`,
					`Groundwork authority:\n${state.groundwork}`,
					answersText(state),
				].join("\n\n");
				await preflight(ctx, "evidence", task, state.repoRoot);
				const result = await delegate<StageResult>(pi, ctx, state, "evidence", task, stageSchema);
				if (handleStageResult(state, result) === "waiting") {
					if (await askPendingQuestion(ctx, state)) continue;
					return;
				}
				state.evidence = result.payload;
				state.phase = "to-spec";
				state.activeStage = undefined;
				writeState(state);
				continue;
			}

			if (state.phase === "to-spec") {
				const rewrite = state.review
					? `Root-completely rewrite the same spec identity from both complete reports.\nAdversarial report:\n${state.review.adversarial}\n\nReadiness report:\n${state.review.readiness}`
					: "Create the initial specification.";
				const task = [
					stageInstructions(),
					"Follow the to-spec skill. Write exactly the four specification files and no workflow/checkpoint/receipt/progress files.",
					state.specRoot ? `Reuse this exact spec output root: ${state.specRoot}` : "Choose the output root using the to-spec skill; the owner does not need to supply it.",
					rewrite,
					`Task:\n${state.task}`,
					`Frozen groundwork:\n${state.groundwork}`,
					`Evidence inventory:\n${state.evidence}`,
					answersText(state),
					"On success, specRoot must be the repository-relative folder and specFiles must contain exactly four repository-relative file paths.",
				].join("\n\n");
				await preflight(ctx, "toSpec", task, state.repoRoot);
				const result = await delegate<SpecResult>(pi, ctx, state, "toSpec", task, specSchema);
				if (handleStageResult(state, result) === "waiting") {
					if (await askPendingQuestion(ctx, state)) continue;
					return;
				}
				validateSpecFiles(state, result);
				state.review = undefined;
				state.commitSha = undefined;
				state.preCommitHead = undefined;
				state.phase = "commit";
				state.activeStage = undefined;
				writeState(state);
				continue;
			}

			if (state.phase === "commit") {
				if (adoptInterruptedCommit(state)) {
					state.phase = "review";
					state.activeStage = undefined;
					writeState(state);
					continue;
				}
				state.preCommitHead = git(state.repoRoot, ["rev-parse", "HEAD"]);
				writeState(state);
				const task = [
					stageInstructions(),
					"Follow commit-work. Stage and commit exactly the authorized four spec files below. Do not edit, push, merge, or include unrelated staged changes.",
					"Authorized paths:",
					exactLines(state.specFiles ?? []),
					"Use a Conventional Commit message. Return the full 40-character SHA and exact committedPaths.",
				].join("\n\n");
				await preflight(ctx, "commit", task, state.repoRoot);
				const result = await delegate<CommitResult>(pi, ctx, state, "commit", task, commitSchema);
				if (handleStageResult(state, result) === "waiting") {
					if (await askPendingQuestion(ctx, state)) continue;
					return;
				}
				validateCommit(state, result);
				state.phase = "review";
				state.activeStage = undefined;
				writeState(state);
				continue;
			}

			if (state.phase === "review") {
				const detached = createWorktree(state);
				const common = [
					stageInstructions(),
					"Remain read-only. Review the exact detached commit basis; do not write report files.",
					`Detached commit SHA: ${state.commitSha}`,
					`Specification files:\n${exactLines(state.specFiles ?? [])}`,
					`Task:\n${state.task}`,
					`Frozen groundwork:\n${state.groundwork}`,
					`Evidence inventory:\n${state.evidence}`,
					answersText(state),
					"Put the complete skill-format report in report. Echo its exact verdict and Next state in verdict/next.",
				].join("\n\n");
				const adversarialTask = `${common}\n\nRun the adversarial specification review.`;
				const readinessTask = `${common}\n\nRun the implementation-readiness review.`;
				const [adversarial, readiness] = await Promise.all([
					reviewWithRetry(pi, ctx, state, "adversarial", adversarialTask, detached),
					reviewWithRetry(pi, ctx, state, "readiness", readinessTask, detached),
				]);
				cleanupWorktree(state);
				if (adversarial.status === "question" || readiness.status === "question") {
					const questions = [adversarial, readiness].filter((result) => result.status === "question").map((result) => result.question.trim());
					state.question = questions.join("\n\n");
					state.status = "waiting";
					state.activeStage = undefined;
					writeState(state);
					if (await askPendingQuestion(ctx, state)) continue;
					return;
				}
				if (adversarial.verdict === "PASS" && readiness.verdict === "READY") {
					state.review = { adversarial: adversarial.report, readiness: readiness.report, commitSha: state.commitSha! };
					state.status = "complete";
					state.activeStage = undefined;
					writeState(state);
					if (ctx.hasUI) ctx.ui.notify(`Hospital spec STOP: PASS + READY @ ${state.commitSha}`, "info");
					pi.sendMessage({
						customType: EXTENSION_ID,
						content: `Hospital spec tamamlandı. Spec: ${state.specRoot}\nCommit: ${state.commitSha}\nGate: PASS + READY`,
						display: true,
					}, { triggerTurn: false });
					return;
				}
				state.review = { adversarial: adversarial.report, readiness: readiness.report, commitSha: state.commitSha! };
				state.phase = "to-spec";
				state.activeStage = undefined;
				writeState(state);
			}
		}
	} catch (error) {
		cleanupWorktree(state);
		state.status = "blocked";
		state.activeStage = undefined;
		state.lastError = error instanceof Error ? error.message : String(error);
		writeState(state);
		if (ctx.hasUI) ctx.ui.notify(`Hospital spec BLOCKED: ${state.lastError}`, "error");
		pi.sendMessage({ customType: EXTENSION_ID, content: `Hospital spec BLOCKED: ${state.lastError}`, display: true }, { triggerTurn: false });
	} finally {
		runningProjects.delete(state.projectKey);
		if (ctx.hasUI) ctx.ui.setStatus(EXTENSION_ID, undefined);
	}
}

function statusText(state: HospitalState): string {
	const lines = [
		`status: ${state.status}`,
		`phase: ${state.phase}`,
		`task: ${state.task}`,
		`updated: ${state.updatedAt}`,
	];
	if (state.activeStage) lines.push(`active: ${state.activeStage}`);
	if (state.question) lines.push(`question: ${state.question}`);
	if (state.lastError) lines.push(`error: ${state.lastError}`);
	if (state.specRoot) lines.push(`spec: ${state.specRoot}`);
	if (state.commitSha) lines.push(`commit: ${state.commitSha}`);
	return lines.join("\n");
}

async function command(pi: ExtensionAPI, args: string, ctx: ExtensionCommandContext): Promise<void> {
	const input = args.trim();
	let state = readState(ctx.cwd);
	if (input === "self-test") {
		for (const staff of Object.keys(STAFF) as Array<keyof typeof STAFF>) {
			await preflight(ctx, staff, "self-test", ctx.cwd);
		}
		validateReview("adversarial", {
			status: "complete", summary: "ok", payload: "ok", question: "", verdict: "PASS", next: "review-stage gate",
			report: "PASS\nBasis: self-test\nNext: review-stage gate",
		});
		validateReview("readiness", {
			status: "complete", summary: "ok", payload: "ok", question: "", verdict: "READY", next: "review-stage gate",
			report: "READY\nBasis: self-test\nNext: review-stage gate",
		});
		ctx.ui.notify("hospital-spec self-test: PASS", "info");
		return;
	}
	if (input === "status") {
		ctx.ui.notify(state ? statusText(state) : "Bu proje için hospital-spec state yok.", "info");
		return;
	}
	if (input.startsWith("answer ")) {
		if (!state || state.status !== "waiting" || !state.question) {
			ctx.ui.notify("Cevap bekleyen hospital-spec yok.", "warning");
			return;
		}
		state.answers.push({ question: state.question, answer: input.slice(7).trim() });
		state.question = undefined;
		state.lastError = undefined;
		state.phase = "groundwork";
		state.status = "running";
		state.groundwork = undefined;
		state.evidence = undefined;
		state.specRoot = undefined;
		state.specFiles = undefined;
		state.preCommitHead = undefined;
		state.commitSha = undefined;
		state.review = undefined;
		writeState(state);
		void continueWorkflow(pi, ctx, state);
		return;
	}
	if (!input && state) {
		if (state.status === "complete" || state.status === "blocked") {
			ctx.ui.notify(statusText(state), state.status === "complete" ? "info" : "error");
			return;
		}
		void continueWorkflow(pi, ctx, state);
		return;
	}
	let task = input;
	if (!task && ctx.hasUI) task = (await ctx.ui.input("Hospital spec task", "Spec'e dönüştürülecek görevi yazın"))?.trim() ?? "";
	if (!task) {
		ctx.ui.notify("Kullanım: /hospital-spec <task>", "warning");
		return;
	}
	if (state && state.status !== "complete" && state.task !== task) {
		const replace = ctx.hasUI && await ctx.ui.confirm("Aktif workflow", "Bu projedeki aktif hospital-spec yeni görevle değiştirilsin mi?");
		if (!replace) return;
		cleanupWorktree(state);
	}
	const root = repoRoot(ctx.cwd);
	state = {
		version: 1,
		projectKey: projectKey(ctx.cwd),
		cwd: path.resolve(ctx.cwd),
		repoRoot: root,
		task,
		phase: "groundwork",
		status: "running",
		parentApproved: false,
		attempt: 0,
		updatedAt: new Date().toISOString(),
		answers: [],
	};
	writeState(state);
	void continueWorkflow(pi, ctx, state);
}

export default function hospitalSpec(pi: ExtensionAPI): void {
	pi.registerCommand("hospital-spec", {
		description: "Ground a task, write/commit a four-file spec, and loop until PASS + READY",
		handler: async (args, ctx) => command(pi, args, ctx),
	});

	pi.on("session_start", (_event, ctx) => {
		const state = readState(ctx.cwd);
		if (!state || state.status === "complete" || state.status === "blocked") return;
		setTimeout(() => {
			void continueWorkflow(pi, ctx, state);
		}, 1200);
	});

	pi.on("session_shutdown", (_event, ctx) => {
		if (ctx.hasUI) ctx.ui.setStatus(EXTENSION_ID, undefined);
	});
}
