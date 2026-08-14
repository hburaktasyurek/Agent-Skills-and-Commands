import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import type { ExtensionAPI, ExtensionCommandContext, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";

const EXTENSION_ID = "hospital-spec";
const STATE_ROOT = path.join(os.homedir(), ".pi", "agent", "state", EXTENSION_ID);
const HEARTBEAT_MS = 45_000;
const PARENT = { provider: "opencode-go", model: "deepseek-v4-pro", thinking: "high" } as const;

const STAFF = {
	"workflow-groundwork": "opencode-go/deepseek-v4-pro",
	"workflow-evidence": "opencode-go/deepseek-v4-flash",
	"workflow-to-spec": "openai-codex/gpt-5.6-sol",
	"workflow-commit": "openai-codex/gpt-5.6-luna",
	"workflow-adversarial-spec": "openai-codex/gpt-5.6-sol",
	"workflow-spec-readiness": "openai-codex/gpt-5.6-terra",
} as const;

const PHASE_BY_AGENT: Record<string, string> = {
	"workflow-groundwork": "groundwork",
	"workflow-evidence": "evidence",
	"workflow-to-spec": "to-spec",
	"workflow-commit": "commit",
	"workflow-adversarial-spec": "adversarial review",
	"workflow-spec-readiness": "readiness review",
};

type HospitalStatus = "active" | "waiting" | "complete" | "blocked" | "stopped";

interface ActiveRun {
	id: string;
	agents: string[];
	asyncDir?: string;
	startedAt: string;
}

interface HospitalState {
	version: 2;
	cwd: string;
	repoRoot: string;
	task: string;
	status: HospitalStatus;
	phase: string;
	summary?: string;
	question?: string;
	specRoot?: string;
	commitSha?: string;
	missionId?: string;
	parentApproved: boolean;
	activeRuns: ActiveRun[];
	startedAt: string;
	updatedAt: string;
}

interface AsyncStartedPayload {
	id?: string;
	cwd?: string;
	agent?: string;
	agents?: string[];
	asyncDir?: string;
}

interface AsyncCompletePayload {
	runId?: string;
	id?: string;
}

interface RuntimeStatus {
	state?: string;
	turnCount?: number;
	toolCount?: number;
	currentTool?: string;
	currentPath?: string;
	steps?: Array<{
		agent?: string;
		status?: string;
		turnCount?: number;
		toolCount?: number;
		currentTool?: string;
		currentToolArgs?: string;
		currentPath?: string;
		recentOutput?: string[];
	}>;
}

const CONTROL_PARAMETERS = Type.Object({
	action: Type.Union([
		Type.Literal("checkpoint"),
		Type.Literal("waiting"),
		Type.Literal("complete"),
		Type.Literal("blocked"),
		Type.Literal("stopped"),
		Type.Literal("status"),
	]),
	phase: Type.Optional(Type.String()),
	summary: Type.Optional(Type.String()),
	question: Type.Optional(Type.String()),
	specRoot: Type.Optional(Type.String()),
	commitSha: Type.Optional(Type.String()),
	missionId: Type.Optional(Type.String()),
});

const GATE_PARAMETERS = Type.Object({
	adversarial: Type.Union([Type.Literal("PASS"), Type.Literal("FAIL")]),
	readiness: Type.Union([Type.Literal("READY"), Type.Literal("NOT READY")]),
	expectedSha: Type.String(),
	adversarialSha: Type.String(),
	readinessSha: Type.String(),
});

function projectKey(cwd: string): string {
	return createHash("sha256").update(path.resolve(cwd)).digest("hex").slice(0, 20);
}

function statePath(cwd: string): string {
	return path.join(STATE_ROOT, `${projectKey(cwd)}.json`);
}

function readState(cwd: string): HospitalState | undefined {
	try {
		const state = JSON.parse(fs.readFileSync(statePath(cwd), "utf8")) as HospitalState;
		if (state.version !== 2 || state.cwd !== path.resolve(cwd)) return undefined;
		state.activeRuns ??= [];
		return state;
	} catch {
		return undefined;
	}
}

function writeState(state: HospitalState): void {
	fs.mkdirSync(STATE_ROOT, { recursive: true, mode: 0o700 });
	state.updatedAt = new Date().toISOString();
	const target = statePath(state.cwd);
	const temporary = `${target}.${process.pid}.tmp`;
	fs.writeFileSync(temporary, `${JSON.stringify(state, null, 2)}\n`, { mode: 0o600 });
	fs.renameSync(temporary, target);
}

function repoRoot(cwd: string): string {
	try {
		return execFileSync("git", ["rev-parse", "--show-toplevel"], { cwd, encoding: "utf8" }).trim();
	} catch {
		throw new Error("Hospital Spec yalnız bir Git repository içinde başlatılabilir.");
	}
}

function frontmatter(text: string): Record<string, string> {
	const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
	if (!match) return {};
	const result: Record<string, string> = {};
	for (const line of match[1].split(/\r?\n/)) {
		const separator = line.indexOf(":");
		if (separator > 0) result[line.slice(0, separator).trim()] = line.slice(separator + 1).trim();
	}
	return result;
}

function verifyStaff(): void {
	for (const [agent, model] of Object.entries(STAFF)) {
		const file = path.join(os.homedir(), ".pi", "agent", "agents", `${agent}.md`);
		let values: Record<string, string>;
		try {
			values = frontmatter(fs.readFileSync(file, "utf8"));
		} catch {
			throw new Error(`Zorunlu ajan kurulu değil: ${agent}`);
		}
		if (values.name !== agent || values.model !== model || values.thinking !== "high" || values.fallbackModels !== "[]") {
			throw new Error(`Ajan sözleşmesi eşleşmiyor: ${agent}`);
		}
	}
}

async function ensureParent(pi: ExtensionAPI, ctx: ExtensionContext, approved: boolean): Promise<boolean> {
	const exact = ctx.model?.provider === PARENT.provider && ctx.model?.id === PARENT.model && ctx.thinkingLevel === PARENT.thinking;
	if (exact) return true;
	if (!approved) {
		if (!ctx.hasUI) return false;
		const consent = await ctx.ui.confirm(
			"Hospital Supervisor",
			"Main model DeepSeek V4 Pro / high olarak değiştirilsin mi?",
		);
		if (!consent) return false;
	}
	const model = ctx.modelRegistry.find(PARENT.provider, PARENT.model);
	if (!model) throw new Error(`Zorunlu parent modeli bulunamadı: ${PARENT.provider}/${PARENT.model}`);
	if (!await pi.setModel(model)) throw new Error(`Zorunlu parent modeli için giriş kullanılamıyor: ${PARENT.provider}/${PARENT.model}`);
	pi.setThinkingLevel(PARENT.thinking);
	return true;
}

function activeRunText(state: HospitalState): string {
	if (state.activeRuns.length === 0) return "none";
	return state.activeRuns.map((run) => `${run.id} (${run.agents.join(" + ") || "unknown"})`).join(", ");
}

function supervisorPrompt(state: HospitalState): string {
	return `
HOSPITAL SPEC SUPERVISOR — ACTIVE

You are the visible DeepSeek V4 Pro/high parent. The user talks to you in main; children never own the user relationship.

Authority:
- Repository: ${state.repoRoot}
- Task: ${state.task}
- Durable phase: ${state.phase}
- Durable status: ${state.status}
- Active async run(s): ${activeRunText(state)}
- Mission: ${state.missionId ?? "not recorded"}

Operator contract:
- If the user comments on a running child's mistake, focus, path, or interpretation, inspect that exact run with subagent status/transcript when useful, then call subagent action=steer on its exact id. For a parallel review run, include the matching child index. Report the delivery receipt in plain language. Do not make the user remember a slash command.
- If the user asks what is happening, inspect the active run and summarize its current evidence, direction, and any risk—not merely “still running”.
- If the user asks to stop, call subagent action=stop on every active Hospital run, then mark hospital_supervisor stopped.
- A child question must surface in main. Mark hospital_supervisor waiting with the exact question, ask the user there, preserve the complete answer, and reply through subagent_supervisor. Never guess an owner decision.
- Never launch a replacement while a matching run is still queued or running. After compaction/restart, recover with subagent status and mission.list/mission.show before acting.

Execution contract:
- Launch every child with the model-facing subagent tool, workflowScript, async:true, context:"fresh", cwd:${JSON.stringify(state.repoRoot)}. End your turn after launch so main remains usable. Use no hidden prompt-template event or foreground child.
- Use exactly these agents in order: workflow-groundwork → workflow-evidence → workflow-to-spec → workflow-commit → workflow-adversarial-spec + workflow-spec-readiness in parallel.
- The two reviewers must examine the same committed SHA. Pass their exact verdicts and SHAs to hospital_spec_gate. STOP is legal only for PASS + READY on that SHA. ROOT_COMPLETE_REWRITE returns both complete reports to one fresh workflow-to-spec root-complete rewrite, then fresh commit and fresh parallel reviews. INVALID reruns only the malformed role once; a second malformed result blocks. There is no substantive rewrite-round limit.
- Call hospital_supervisor checkpoint before each launch and after each completed stage. Record the enclosing mission id as soon as the first async launch returns it. Use that same mission for later launches and durable recovery.
- Only workflow-to-spec writes the four spec files. Only workflow-commit stages/commits those exact files. Never push. Reviewers remain read-only. Missing required model/role blocks; no fallback.
- Do not run model evals, synthetic quality cases, baselines, or forward tests.
- When a terminal state is reached, call hospital_supervisor complete/blocked. Include spec root and commit SHA when known.

Stage handoff:
- Groundwork receives the exact task and returns the complete grounded brief, lock, and decision-bearing evidence.
- Evidence receives the task plus complete groundwork output and scans only direct load-bearing dependencies.
- To-spec receives the task, complete groundwork, complete evidence, and—on rewrite—both complete review reports. It chooses and preserves the four-file spec root.
- Commit receives only the exact four paths returned by to-spec and must preserve unrelated work/index entries.
- Both reviewers receive the same exact commit SHA, task, grounded authority, evidence, and spec root. Run them together with runs.all.

Treat ordinary unrelated user requests normally. Apply this supervisor routing when the user refers to Hospital Spec, its active child, its progress, a correction, a question, or stopping it.
`;
}

function kickoffPrompt(state: HospitalState): string {
	return `Start Hospital Spec for the exact repository and task recorded in your supervisor instructions.

First call hospital_supervisor checkpoint with phase=groundwork. Then launch only workflow-groundwork as one top-level async workflow with fresh context. Record the returned mission id with hospital_supervisor, report the run id, and end this turn. Keep main available for my messages. Do not wait or poll in this turn.`;
}

function statusText(state: HospitalState): string {
	const lines = [
		`Hospital Spec: ${state.status}`,
		`Phase: ${state.phase}`,
		`Repository: ${state.repoRoot}`,
		`Task: ${state.task}`,
		`Active run: ${activeRunText(state)}`,
	];
	if (state.summary) lines.push(`Summary: ${state.summary}`);
	if (state.question) lines.push(`Question: ${state.question}`);
	if (state.specRoot) lines.push(`Spec: ${state.specRoot}`);
	if (state.commitSha) lines.push(`Commit: ${state.commitSha}`);
	return lines.join("\n");
}

function render(ctx: ExtensionContext, state?: HospitalState): void {
	if (!ctx.hasUI) return;
	if (!state || ["complete", "blocked", "stopped"].includes(state.status)) {
		ctx.ui.setStatus(EXTENSION_ID, undefined);
		ctx.ui.setWidget(EXTENSION_ID, undefined);
		return;
	}
	const run = state.activeRuns[0];
	ctx.ui.setStatus(EXTENSION_ID, `🏥 ${state.phase} · ${run ? run.id.slice(0, 8) : state.status}`);
	ctx.ui.setWidget(EXTENSION_ID, [
		`🏥 Hospital Spec · ${state.phase} · ${state.status}`,
		run ? `Child: ${run.agents.join(" + ")} · ${run.id}` : "Supervisor is deciding the next stage in main.",
		"Main'e doğal dille durum sorabilir, düzeltme yazabilir veya durdur diyebilirsiniz.",
	], { placement: "belowEditor" });
}

function readRuntimeStatus(run: ActiveRun): RuntimeStatus | undefined {
	if (!run.asyncDir) return undefined;
	try {
		return JSON.parse(fs.readFileSync(path.join(run.asyncDir, "status.json"), "utf8")) as RuntimeStatus;
	} catch {
		return undefined;
	}
}

function heartbeatText(state: HospitalState): string | undefined {
	if (state.activeRuns.length === 0) return undefined;
	const parts = state.activeRuns.map((run) => {
		const status = readRuntimeStatus(run);
		const activeStep = status?.steps?.find((step) => step.status === "running") ?? status?.steps?.[0];
		const agent = activeStep?.agent ?? run.agents.join(" + ") ?? "child";
		const tool = activeStep?.currentTool ?? status?.currentTool;
		const target = activeStep?.currentPath ?? status?.currentPath ?? activeStep?.currentToolArgs;
		const turns = activeStep?.turnCount ?? status?.turnCount;
		const tools = activeStep?.toolCount ?? status?.toolCount;
		const latest = activeStep?.recentOutput?.at(-1)?.replace(/\s+/g, " ").trim();
		return [
			`${agent} ${status?.state ?? "running"}`,
			tool ? `şu an: ${tool}${target ? ` · ${String(target).slice(0, 140)}` : ""}` : "model repo kanıtını değerlendiriyor",
			latest ? `son not: ${latest.slice(0, 220)}` : undefined,
			`aktivite: ${turns ?? "?"} turn · ${tools ?? "?"} tool`,
		].filter(Boolean).join(" — ");
	});
	return `Hospital Supervisor · ${state.phase}\n${parts.join("\n")}\nMain'e gördüğünüz bir hatayı normal cümleyle yazın; aktif child'a yönlendireceğim.`;
}

function belongsToHospital(data: AsyncStartedPayload, state: HospitalState): boolean {
	if (!data.id || !data.cwd || path.resolve(data.cwd) !== path.resolve(state.repoRoot)) return false;
	const agents = data.agents?.length ? data.agents : data.agent ? [data.agent] : [];
	return agents.length > 0 && agents.every((agent) => agent in STAFF);
}

async function startCommand(pi: ExtensionAPI, args: string, ctx: ExtensionCommandContext): Promise<void> {
	const input = args.trim();
	if (input === "self-test") {
		verifyStaff();
		const tools = new Set(pi.getAllTools().map((tool) => tool.name));
		for (const required of ["subagent", "subagent_supervisor", "hospital_supervisor", "hospital_spec_gate"]) {
			if (!tools.has(required)) throw new Error(`Zorunlu tool yüklenmedi: ${required}`);
		}
		ctx.ui.notify("hospital-spec self-test: PASS", "info");
		return;
	}

	const existing = readState(ctx.cwd);
	if (!input && existing) {
		render(ctx, existing);
		pi.sendMessage({ customType: EXTENSION_ID, content: statusText(existing), display: true }, { triggerTurn: false });
		return;
	}

	let task = input;
	if (!task && ctx.hasUI) task = (await ctx.ui.input("Hospital Spec görevi", "Spec'e dönüştürülecek görevi yazın"))?.trim() ?? "";
	if (!task) {
		ctx.ui.notify("Kullanım: /hospital-spec <görev>", "warning");
		return;
	}
	if (!ctx.hasUI) throw new Error("Hospital Spec başlangıcı repository ve task onayı için TUI gerektirir.");
	if (existing?.status === "active" || existing?.status === "waiting") {
		ctx.ui.notify("Bu repository'de aktif Hospital Spec var. Main'e durdurmasını söylemeden yenisini başlatmayın.", "warning");
		return;
	}

	verifyStaff();
	const root = repoRoot(ctx.cwd);
	const confirmed = await ctx.ui.confirm(
		"Hospital Spec başlangıcı",
		`Repository:\n${root}\n\nTask:\n${task}\n\nBu exact hedefte başlatılsın mı?`,
	);
	if (!confirmed) return;
	if (!await ensureParent(pi, ctx, false)) {
		ctx.ui.notify("Parent model değişikliği onaylanmadı; workflow başlatılmadı.", "warning");
		return;
	}

	const now = new Date().toISOString();
	const state: HospitalState = {
		version: 2,
		cwd: path.resolve(ctx.cwd),
		repoRoot: root,
		task,
		status: "active",
		phase: "starting",
		parentApproved: true,
		activeRuns: [],
		startedAt: now,
		updatedAt: now,
	};
	writeState(state);
	render(ctx, state);
	pi.sendUserMessage(kickoffPrompt(state), { expandPromptTemplates: false });
}

export default function hospitalSpec(pi: ExtensionAPI): void {
	let lastContext: ExtensionContext | undefined;
	let heartbeat: ReturnType<typeof setInterval> | undefined;

	const refreshHeartbeat = (ctx: ExtensionContext): void => {
		if (heartbeat) clearInterval(heartbeat);
		heartbeat = setInterval(() => {
			const state = readState(ctx.cwd);
			if (!state || state.status !== "active" || state.activeRuns.length === 0) return;
			const text = heartbeatText(state);
			if (text) pi.sendMessage({ customType: `${EXTENSION_ID}-heartbeat`, content: text, display: true }, { triggerTurn: false });
			render(ctx, state);
		}, HEARTBEAT_MS);
		heartbeat.unref?.();
	};

	pi.registerTool({
		name: "hospital_supervisor",
		label: "Hospital Supervisor",
		description: "Read or durably update the active Hospital Spec supervisor checkpoint. Use only for the current repository's Hospital workflow.",
		promptSnippet: "Track the visible Hospital Spec phase, owner wait, and terminal result.",
		parameters: CONTROL_PARAMETERS,
		async execute(_toolCallId, params, _signal, _onUpdate, ctx) {
			const state = readState(ctx.cwd);
			if (!state) return { content: [{ type: "text", text: "No Hospital Spec state exists for this repository." }], details: {} };
			if (params.action !== "status") {
				if (params.phase?.trim()) state.phase = params.phase.trim();
				if (params.summary?.trim()) state.summary = params.summary.trim();
				if (params.question?.trim()) state.question = params.question.trim();
				if (params.specRoot?.trim()) state.specRoot = params.specRoot.trim();
				if (params.commitSha?.trim()) state.commitSha = params.commitSha.trim();
				if (params.missionId?.trim()) state.missionId = params.missionId.trim();
				state.status = params.action === "checkpoint" ? "active" : params.action;
				if (params.action !== "waiting") state.question = undefined;
				if (["complete", "blocked", "stopped"].includes(params.action)) state.activeRuns = [];
				writeState(state);
			}
			render(ctx, state);
			return { content: [{ type: "text", text: statusText(state) }], details: { status: state.status, phase: state.phase } };
		},
	});

	pi.registerTool({
		name: "hospital_spec_gate",
		label: "Hospital Spec Gate",
		description: "Mechanically combine the two Hospital Spec reviewer verdicts on one exact committed SHA.",
		promptSnippet: "Gate Hospital Spec only after both fresh reviewer reports return.",
		parameters: GATE_PARAMETERS,
		async execute(_toolCallId, params) {
			const validSha = (value: string): boolean => /^[0-9a-f]{40}(?:[0-9a-f]{24})?$/.test(value);
			if (![params.expectedSha, params.adversarialSha, params.readinessSha].every(validSha)) {
				return { content: [{ type: "text", text: "INVALID: malformed commit SHA" }], details: { state: "INVALID" } };
			}
			if (params.adversarialSha !== params.expectedSha || params.readinessSha !== params.expectedSha) {
				return { content: [{ type: "text", text: "INVALID: reviewer commit SHA mismatch" }], details: { state: "INVALID" } };
			}
			const state = params.adversarial === "PASS" && params.readiness === "READY" ? "STOP" : "ROOT_COMPLETE_REWRITE";
			return { content: [{ type: "text", text: state }], details: { state } };
		},
	});

	pi.registerCommand("hospital-spec", {
		description: "Start or inspect the visible, steerable Hospital Spec supervisor",
		handler: async (args, ctx) => startCommand(pi, args, ctx),
	});

	pi.on("before_agent_start", (event, ctx) => {
		const state = readState(ctx.cwd);
		if (!state || (state.status !== "active" && state.status !== "waiting")) return undefined;
		return { systemPrompt: `${event.systemPrompt}\n\n${supervisorPrompt(state)}` };
	});

	pi.events.on("subagent:async-started", (payload) => {
		if (!lastContext) return;
		const state = readState(lastContext.cwd);
		const data = payload as AsyncStartedPayload;
		if (!state || state.status !== "active" || !belongsToHospital(data, state)) return;
		const agents = data.agents?.length ? data.agents : data.agent ? [data.agent] : [];
		state.activeRuns = state.activeRuns.filter((run) => run.id !== data.id);
		state.activeRuns.push({ id: data.id!, agents, asyncDir: data.asyncDir, startedAt: new Date().toISOString() });
		state.phase = agents.map((agent) => PHASE_BY_AGENT[agent] ?? agent).join(" + ");
		writeState(state);
		render(lastContext, state);
		pi.sendMessage({
			customType: `${EXTENSION_ID}-started`,
			content: `Hospital Supervisor · ${state.phase} başladı\nRun: ${data.id}\nMain açık; düzeltmenizi doğal dille yazabilirsiniz.`,
			display: true,
		}, { triggerTurn: false });
	});

	pi.events.on("subagent:async-complete", (payload) => {
		if (!lastContext) return;
		const state = readState(lastContext.cwd);
		const data = payload as AsyncCompletePayload;
		const runId = data.runId ?? data.id;
		if (!state || !runId || !state.activeRuns.some((run) => run.id === runId)) return;
		state.activeRuns = state.activeRuns.filter((run) => run.id !== runId);
		state.summary = `${runId} tamamlandı; supervisor sonucu değerlendiriyor.`;
		writeState(state);
		render(lastContext, state);
	});

	pi.on("session_start", (event, ctx) => {
		lastContext = ctx;
		const state = readState(ctx.cwd);
		render(ctx, state);
		refreshHeartbeat(ctx);
		if (!state || (state.status !== "active" && state.status !== "waiting")) return;
		setTimeout(() => {
			void (async () => {
				try {
					if (!await ensureParent(pi, ctx, state.parentApproved)) return;
					pi.sendUserMessage(
						`Resume the active Hospital Spec from durable state after ${event.reason}. Inspect exact active run status and mission state first; do not duplicate a running child. Continue automatically or surface the pending owner question in main.`,
						{ expandPromptTemplates: false },
					);
				} catch (error) {
					ctx.ui.notify(error instanceof Error ? error.message : String(error), "error");
				}
			})();
		}, 1_200);
	});

	pi.on("session_shutdown", (_event, ctx) => {
		if (heartbeat) clearInterval(heartbeat);
		heartbeat = undefined;
		lastContext = undefined;
		if (ctx.hasUI) {
			ctx.ui.setStatus(EXTENSION_ID, undefined);
			ctx.ui.setWidget(EXTENSION_ID, undefined);
		}
	});
}
