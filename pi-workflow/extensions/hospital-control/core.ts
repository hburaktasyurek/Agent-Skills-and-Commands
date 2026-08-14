import * as path from "node:path";

export const HOSPITAL_STATE_VERSION = 3 as const;
export const HOSPITAL_LEDGER_LIMIT = 50;

export type HospitalStatus = "active" | "waiting" | "complete" | "blocked" | "stopped";
export type InvalidationPhase = "groundwork" | "evidence" | "to-spec" | "commit" | "review";
export type CorrectionStatus = "recorded" | "queued" | "delivered" | "acknowledged" | "verified" | "applied" | "failed";
export type DeliveryState = "scheduled" | "pending" | "delivered" | "partial" | "recovered" | "failed";

export interface ActiveRun {
	id: string;
	agents: string[];
	asyncDir?: string;
	startedAt: string;
}

export interface RunReceipt extends ActiveRun {
	completedAt?: string;
}

export interface AssumptionRecord {
	key: string;
	id: string;
	runId: string;
	childIndex: number;
	agent: string;
	phase: string;
	claim: string;
	verify: string;
	impact: string;
	status: "open" | "confirmed" | "rejected";
	evidence?: string[];
	invalidatesFrom?: InvalidationPhase;
	impactApplied: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface CorrectionRecord {
	id: string;
	text: string;
	runId: string;
	childIndex?: number;
	requestId?: string;
	deliveryState?: DeliveryState;
	deliveryStatus?: "delivered" | "queued";
	status: CorrectionStatus;
	outcome?: "confirmed" | "rejected";
	evidence?: string[];
	summary?: string;
	invalidatesFrom?: InvalidationPhase;
	createdAt: string;
	updatedAt: string;
}

export interface ReviewReceipt {
	verdict: "PASS" | "FAIL" | "READY" | "NOT READY";
	sha: string;
	recordedAt: string;
}

export interface ProtocolErrorRecord {
	id: string;
	runId?: string;
	childIndex?: number;
	message: string;
	resolved: boolean;
	createdAt: string;
	resolvedAt?: string;
	resolution?: string;
}

export interface HospitalState {
	version: 3;
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
	runLedger: RunReceipt[];
	assumptions: AssumptionRecord[];
	corrections: CorrectionRecord[];
	processedSignalIds: string[];
	signalCursor?: { timestamp: number; ids: string[] };
	protocolErrors: ProtocolErrorRecord[];
	reviews: {
		adversarial?: ReviewReceipt;
		readiness?: ReviewReceipt;
	};
	startedAt: string;
	updatedAt: string;
}

export interface RuntimeSteeringTarget {
	index: number;
	state: string;
	reason?: string;
}

export interface RuntimeSteeringRequest {
	id: string;
	requestedAt: number;
	source?: string;
	messagePreview: string;
	targets: RuntimeSteeringTarget[];
}

export interface RuntimeStatus {
	state?: string;
	turnCount?: number;
	toolCount?: number;
	currentTool?: string;
	currentPath?: string;
	steering?: { recent?: RuntimeSteeringRequest[] };
	steps?: Array<{
		agent?: string;
		model?: string;
		status?: string;
		turnCount?: number;
		toolCount?: number;
		currentTool?: string;
		currentToolArgs?: string;
		currentPath?: string;
		recentOutput?: string[];
		steering?: { recent?: RuntimeSteeringRequest[] };
	}>;
}

interface LegacyStateV2 {
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
	activeRuns?: ActiveRun[];
	startedAt: string;
	updatedAt: string;
}

interface SupervisorDetails {
	id?: unknown;
	reason?: unknown;
	runId?: unknown;
	agent?: unknown;
	childIndex?: unknown;
}

type HospitalSignal =
	| { v: 1; kind: "assumption_open"; id: string; claim: string; verify: string; impact: string }
	| { v: 1; kind: "assumption_resolved"; id: string; outcome: "confirmed" | "rejected"; evidence: string[]; invalidatesFrom?: InvalidationPhase }
	| { v: 1; kind: "correction_ack"; correctionId: string; summary: string }
	| { v: 1; kind: "correction_resolved"; correctionId: string; outcome: "confirmed" | "rejected"; evidence: string[]; summary: string; invalidatesFrom?: InvalidationPhase };

export interface SignalApplicationResult {
	changed: boolean;
	kind?: HospitalSignal["kind"];
	error?: string;
}

export interface SteeringReconciliationResult {
	changed: boolean;
	observed: CorrectionRecord[];
	errors: string[];
}

const INVALIDATION_PHASES = new Set<InvalidationPhase>(["groundwork", "evidence", "to-spec", "commit", "review"]);
function nowIso(now = Date.now()): string {
	return new Date(now).toISOString();
}

function bounded<T>(items: T[], limit = HOSPITAL_LEDGER_LIMIT): T[] {
	return items.slice(-limit);
}

function boundedLedger<T>(items: T[], unresolved: (item: T) => boolean): T[] {
	const open = items.filter(unresolved);
	const resolved = items.filter((item) => !unresolved(item));
	if (open.length >= HOSPITAL_LEDGER_LIMIT) return open.slice(-HOSPITAL_LEDGER_LIMIT);
	return [...resolved.slice(-(HOSPITAL_LEDGER_LIMIT - open.length)), ...open];
}

function nonEmpty(value: unknown): value is string {
	return typeof value === "string" && value.trim().length > 0;
}

function evidenceList(value: unknown): string[] | undefined {
	if (!Array.isArray(value)) return undefined;
	const evidence = value.filter(nonEmpty).map((item) => item.trim());
	return evidence.length > 0 ? evidence.slice(0, 5) : undefined;
}

function invalidationPhase(value: unknown): InvalidationPhase | undefined {
	return typeof value === "string" && INVALIDATION_PHASES.has(value as InvalidationPhase)
		? value as InvalidationPhase
		: undefined;
}

function normalizeState(state: HospitalState): HospitalState {
	state.activeRuns ??= [];
	state.runLedger ??= [];
	state.assumptions ??= [];
	state.corrections ??= [];
	state.processedSignalIds ??= [];
	state.protocolErrors ??= [];
	state.reviews ??= {};
	state.activeRuns = bounded(state.activeRuns);
	state.runLedger = bounded(state.runLedger);
	state.assumptions = boundedLedger(state.assumptions, (item) => item.status === "open" || (item.status === "rejected" && !item.impactApplied));
	state.corrections = boundedLedger(state.corrections, (item) => item.status !== "applied");
	state.processedSignalIds = bounded(state.processedSignalIds);
	state.protocolErrors = boundedLedger(state.protocolErrors, (item) => !item.resolved);
	return state;
}

export function migrateHospitalState(raw: unknown, cwd: string): HospitalState | undefined {
	if (!raw || typeof raw !== "object") return undefined;
	const candidate = raw as Record<string, unknown>;
	if (candidate.cwd !== path.resolve(cwd)) return undefined;
	if (candidate.version === HOSPITAL_STATE_VERSION) return normalizeState(candidate as unknown as HospitalState);
	if (candidate.version !== 2) return undefined;
	const legacy = candidate as unknown as LegacyStateV2;
	return normalizeState({
		...legacy,
		version: HOSPITAL_STATE_VERSION,
		activeRuns: legacy.activeRuns ?? [],
		runLedger: (legacy.activeRuns ?? []).map((run) => ({ ...run })),
		assumptions: [],
		corrections: [],
		processedSignalIds: [],
		protocolErrors: [],
		reviews: {},
	});
}

export function createHospitalState(input: Omit<HospitalState, "version" | "runLedger" | "assumptions" | "corrections" | "processedSignalIds" | "protocolErrors" | "reviews">): HospitalState {
	return normalizeState({
		...input,
		version: HOSPITAL_STATE_VERSION,
		runLedger: [],
		assumptions: [],
		corrections: [],
		processedSignalIds: [],
		protocolErrors: [],
		reviews: {},
	});
}

export function recordRunStarted(state: HospitalState, run: ActiveRun): void {
	state.activeRuns = bounded([...state.activeRuns.filter((item) => item.id !== run.id), run]);
	state.runLedger = bounded([...state.runLedger.filter((item) => item.id !== run.id), { ...run }]);
}

export function recordRunCompleted(state: HospitalState, runId: string, now = Date.now()): void {
	state.activeRuns = state.activeRuns.filter((run) => run.id !== runId);
	const receipt = state.runLedger.find((run) => run.id === runId);
	if (receipt) receipt.completedAt = nowIso(now);
}

function runIdentity(state: HospitalState, details: SupervisorDetails): { runId: string; agent: string; childIndex: number } | undefined {
	if (!nonEmpty(details.runId) || !nonEmpty(details.agent) || !Number.isInteger(details.childIndex) || Number(details.childIndex) < 0) return undefined;
	const runId = details.runId.trim();
	const agent = details.agent.trim();
	const childIndex = Number(details.childIndex);
	const run = [...state.activeRuns, ...state.runLedger].find((candidate) => candidate.id === runId);
	if (!run || run.agents[childIndex] !== agent) return undefined;
	return { runId, agent, childIndex };
}

function parseSignal(content: unknown): HospitalSignal | undefined {
	if (typeof content !== "string") return undefined;
	const marker = "HOSPITAL_SIGNAL";
	const markerAt = content.lastIndexOf(marker);
	if (markerAt < 0) return undefined;
	const json = content.slice(markerAt + marker.length).trim();
	let value: Record<string, unknown>;
	try {
		value = JSON.parse(json) as Record<string, unknown>;
	} catch {
		throw new Error("HOSPITAL_SIGNAL geçerli JSON değil.");
	}
	if (value.v !== 1 || !nonEmpty(value.kind)) throw new Error("HOSPITAL_SIGNAL v=1 ve desteklenen kind içermeli.");
	if (value.kind === "assumption_open") {
		if (![value.id, value.claim, value.verify, value.impact].every(nonEmpty)) throw new Error("assumption_open id, claim, verify ve impact gerektirir.");
		return { v: 1, kind: value.kind, id: value.id.trim(), claim: value.claim.trim(), verify: value.verify.trim(), impact: value.impact.trim() };
	}
	if (value.kind === "assumption_resolved") {
		const evidence = evidenceList(value.evidence);
		if (!nonEmpty(value.id) || (value.outcome !== "confirmed" && value.outcome !== "rejected") || !evidence) throw new Error("assumption_resolved id, outcome ve somut evidence gerektirir.");
		const invalidatesFrom = invalidationPhase(value.invalidatesFrom);
		if (value.outcome === "rejected" && !invalidatesFrom) throw new Error("Reddedilen varsayım invalidatesFrom gerektirir.");
		return { v: 1, kind: value.kind, id: value.id.trim(), outcome: value.outcome, evidence, ...(invalidatesFrom ? { invalidatesFrom } : {}) };
	}
	if (value.kind === "correction_ack") {
		if (!nonEmpty(value.correctionId) || !nonEmpty(value.summary)) throw new Error("correction_ack correctionId ve summary gerektirir.");
		return { v: 1, kind: value.kind, correctionId: value.correctionId.trim(), summary: value.summary.trim() };
	}
	if (value.kind === "correction_resolved") {
		const evidence = evidenceList(value.evidence);
		if (!nonEmpty(value.correctionId) || !nonEmpty(value.summary) || (value.outcome !== "confirmed" && value.outcome !== "rejected") || !evidence) {
			throw new Error("correction_resolved correctionId, outcome, evidence ve summary gerektirir.");
		}
		const invalidatesFrom = invalidationPhase(value.invalidatesFrom);
		if (value.outcome === "confirmed" && !invalidatesFrom) throw new Error("Doğrulanan kullanıcı düzeltmesi invalidatesFrom gerektirir.");
		return { v: 1, kind: value.kind, correctionId: value.correctionId.trim(), outcome: value.outcome, evidence, summary: value.summary.trim(), ...(invalidatesFrom ? { invalidatesFrom } : {}) };
	}
	throw new Error(`Desteklenmeyen HOSPITAL_SIGNAL kind: ${value.kind}`);
}

function protocolError(state: HospitalState, details: SupervisorDetails, message: string, now: number): SignalApplicationResult {
	const id = nonEmpty(details.id) ? details.id.trim() : `protocol-${now}`;
	if (!state.protocolErrors.some((item) => item.id === id) && state.protocolErrors.filter((item) => !item.resolved).length < HOSPITAL_LEDGER_LIMIT) {
		state.protocolErrors = boundedLedger([...state.protocolErrors, {
			id,
			...(nonEmpty(details.runId) ? { runId: details.runId.trim() } : {}),
			...(Number.isInteger(details.childIndex) ? { childIndex: Number(details.childIndex) } : {}),
			message,
			resolved: false,
			createdAt: nowIso(now),
		}], (item) => !item.resolved);
	}
	if (nonEmpty(details.id)) state.processedSignalIds = bounded([...new Set([...state.processedSignalIds, details.id.trim()])]);
	return { changed: true, error: message };
}

export function applySupervisorSignal(state: HospitalState, content: unknown, details: SupervisorDetails, phase: string, now = Date.now()): SignalApplicationResult {
	if (details.reason !== "progress_update" || typeof content !== "string" || !content.includes("HOSPITAL_SIGNAL")) return { changed: false };
	if (!nonEmpty(details.id)) return protocolError(state, details, "Supervisor signal kimliği eksik.", now);
	const messageId = details.id.trim();
	if (state.processedSignalIds.includes(messageId)) return { changed: false };
	const identity = runIdentity(state, details);
	if (!identity) return protocolError(state, details, "HOSPITAL_SIGNAL aktif veya bilinen Hospital run/child kimliğiyle eşleşmiyor.", now);
	let signal: HospitalSignal;
	try {
		const parsed = parseSignal(content);
		if (!parsed) return { changed: false };
		signal = parsed;
	} catch (error) {
		return protocolError(state, details, error instanceof Error ? error.message : String(error), now);
	}
	const timestamp = nowIso(now);
	if (signal.kind === "assumption_open") {
		const key = `${identity.runId}:${identity.childIndex}:${signal.id}`;
		if (state.assumptions.some((item) => item.key === key)) return protocolError(state, details, `Varsayım kimliği tekrar kullanıldı: ${signal.id}`, now);
		if (state.assumptions.filter((item) => item.status === "open" || (item.status === "rejected" && !item.impactApplied)).length >= HOSPITAL_LEDGER_LIMIT) {
			return protocolError(state, details, "Açık varsayım limiti dolu; mevcut varsayımlar çözülmeden yenisi açılamaz.", now);
		}
		state.assumptions = boundedLedger([...state.assumptions, {
			key,
			id: signal.id,
			runId: identity.runId,
			childIndex: identity.childIndex,
			agent: identity.agent,
			phase,
			claim: signal.claim,
			verify: signal.verify,
			impact: signal.impact,
			status: "open",
			impactApplied: false,
			createdAt: timestamp,
			updatedAt: timestamp,
		}], (item) => item.status === "open" || (item.status === "rejected" && !item.impactApplied));
	} else if (signal.kind === "assumption_resolved") {
		const key = `${identity.runId}:${identity.childIndex}:${signal.id}`;
		const assumption = state.assumptions.find((item) => item.key === key);
		if (!assumption || assumption.status !== "open") return protocolError(state, details, `Açık varsayım bulunamadı: ${signal.id}`, now);
		assumption.status = signal.outcome;
		assumption.evidence = signal.evidence;
		assumption.invalidatesFrom = signal.invalidatesFrom;
		assumption.impactApplied = signal.outcome === "confirmed";
		assumption.updatedAt = timestamp;
	} else if (signal.kind === "correction_ack") {
		const correction = state.corrections.find((item) => item.id === signal.correctionId);
		if (!correction || correction.runId !== identity.runId || (correction.childIndex !== undefined && correction.childIndex !== identity.childIndex)) {
			return protocolError(state, details, `Düzeltme hedefi eşleşmiyor: ${signal.correctionId}`, now);
		}
		if (["verified", "applied", "failed"].includes(correction.status)) return protocolError(state, details, `Düzeltme ACK için uygun durumda değil: ${correction.status}`, now);
		correction.status = "acknowledged";
		correction.summary = signal.summary;
		correction.updatedAt = timestamp;
	} else {
		const correction = state.corrections.find((item) => item.id === signal.correctionId);
		if (!correction || correction.runId !== identity.runId || (correction.childIndex !== undefined && correction.childIndex !== identity.childIndex)) {
			return protocolError(state, details, `Düzeltme hedefi eşleşmiyor: ${signal.correctionId}`, now);
		}
		if (correction.status !== "acknowledged") return protocolError(state, details, `Düzeltme resolution öncesi ACK gerektirir: ${signal.correctionId}`, now);
		correction.status = "verified";
		correction.outcome = signal.outcome;
		correction.evidence = signal.evidence;
		correction.summary = signal.summary;
		correction.invalidatesFrom = signal.invalidatesFrom;
		correction.updatedAt = timestamp;
	}
	state.processedSignalIds = bounded([...state.processedSignalIds, messageId]);
	return { changed: true, kind: signal.kind };
}

export function nextCorrectionId(state: HospitalState): string {
	const largest = state.corrections.reduce((max, correction) => {
		const match = correction.id.match(/^C-(\d+)$/);
		return match ? Math.max(max, Number(match[1])) : max;
	}, 0);
	return `C-${String(largest + 1).padStart(3, "0")}`;
}

export function recordCorrection(state: HospitalState, input: { text: string; runId: string; childIndex?: number; requestId?: string; status?: CorrectionStatus }, now = Date.now()): CorrectionRecord {
	if (!input.text.trim()) throw new Error("Düzeltme metni boş olamaz.");
	const run = state.activeRuns.find((item) => item.id === input.runId) ?? state.runLedger.find((item) => item.id === input.runId);
	if (!run) throw new Error(`Hospital run bulunamadı: ${input.runId}`);
	const childIndex = input.childIndex ?? (run.agents.length === 1 ? 0 : undefined);
	if (childIndex === undefined) throw new Error("Paralel Hospital run için exact childIndex gerekir; düzeltme yayınlanmadı.");
	if (!Number.isInteger(childIndex) || childIndex < 0 || childIndex >= run.agents.length) throw new Error(`Hospital childIndex geçersiz: ${childIndex}`);
	if (state.corrections.filter((item) => item.status !== "applied").length >= HOSPITAL_LEDGER_LIMIT) throw new Error("Açık düzeltme limiti dolu; mevcut düzeltmeler uygulanmadan yenisi kaydedilemez.");
	const timestamp = nowIso(now);
	const correction: CorrectionRecord = {
		id: nextCorrectionId(state),
		text: input.text.trim(),
		runId: input.runId,
		childIndex,
		...(input.requestId ? { requestId: input.requestId } : {}),
		status: input.status ?? "recorded",
		createdAt: timestamp,
		updatedAt: timestamp,
	};
	state.corrections = boundedLedger([...state.corrections, correction], (item) => item.status !== "applied");
	return correction;
}

export function updateCorrectionDelivery(state: HospitalState, input: { correctionId: string; requestId: string; deliveryState: DeliveryState; deliveryStatus: "delivered" | "queued" }, now = Date.now()): CorrectionRecord {
	const correction = state.corrections.find((item) => item.id === input.correctionId);
	if (!correction) throw new Error(`Düzeltme bulunamadı: ${input.correctionId}`);
	if (["acknowledged", "verified", "applied"].includes(correction.status)) throw new Error(`Düzeltme teslim durumu artık değiştirilemez: ${correction.status}`);
	correction.requestId = input.requestId;
	correction.deliveryState = input.deliveryState;
	correction.deliveryStatus = input.deliveryStatus;
	correction.status = input.deliveryState === "failed" || input.deliveryState === "partial"
		? "failed"
		: input.deliveryStatus === "delivered" || input.deliveryState === "recovered"
			? "delivered"
			: "queued";
	correction.updatedAt = nowIso(now);
	return correction;
}

export function applyInvalidation(state: HospitalState, phase: InvalidationPhase, now = Date.now()): void {
	state.phase = phase;
	state.commitSha = undefined;
	state.reviews = {};
	for (const assumption of state.assumptions) {
		if (assumption.status === "rejected" && assumption.invalidatesFrom === phase && !assumption.impactApplied) {
			assumption.impactApplied = true;
			assumption.updatedAt = nowIso(now);
		}
	}
}

export function applyCorrection(state: HospitalState, correctionId: string, now = Date.now()): CorrectionRecord {
	const correction = state.corrections.find((item) => item.id === correctionId);
	if (!correction) throw new Error(`Düzeltme bulunamadı: ${correctionId}`);
	if (correction.status !== "verified") throw new Error(`Düzeltme uygulanmadan önce kanıtla doğrulanmalı: ${correction.status}`);
	if (correction.outcome === "confirmed") {
		if (!correction.invalidatesFrom) throw new Error("Doğrulanan kullanıcı düzeltmesi invalidatesFrom gerektirir.");
		applyInvalidation(state, correction.invalidatesFrom, now);
	}
	correction.status = "applied";
	correction.updatedAt = nowIso(now);
	return correction;
}

function steeringDeliveryState(targets: RuntimeSteeringTarget[]): { state: DeliveryState; status: "delivered" | "queued" } {
	const states = targets.map((target) => target.state);
	if (states.length === 0) return { state: "pending", status: "queued" };
	if (states.every((state) => state === "delivered" || state === "recovered")) return { state: states.every((state) => state === "recovered") ? "recovered" : "delivered", status: "delivered" };
	if (states.some((state) => state === "failed" || state === "late") && states.some((state) => state !== "failed" && state !== "late")) return { state: "partial", status: "queued" };
	if (states.every((state) => state === "failed" || state === "late")) return { state: "failed", status: "queued" };
	if (states.every((state) => state === "scheduled")) return { state: "scheduled", status: "queued" };
	return { state: "pending", status: "queued" };
}

export function reconcileRuntimeSteering(state: HospitalState, run: ActiveRun, runtime: RuntimeStatus, now = Date.now()): SteeringReconciliationResult {
	const requests = [
		...(runtime.steering?.recent ?? []),
		...(runtime.steps ?? []).flatMap((step) => step.steering?.recent ?? []),
	];
	const unique = new Map(requests.map((request) => [request.id, request]));
	const observed: CorrectionRecord[] = [];
	const errors: string[] = [];
	let changed = false;
	for (const request of unique.values()) {
		const taggedId = request.messagePreview.match(/\[Hospital (C-\d+)\]/)?.[1];
		const existing = state.corrections.find((correction) => correction.requestId === request.id || (taggedId && correction.id === taggedId));
		const delivery = steeringDeliveryState(request.targets);
		if (existing) {
			if (["recorded", "queued", "delivered"].includes(existing.status)
				&& (existing.requestId !== request.id || existing.deliveryState !== delivery.state || existing.deliveryStatus !== delivery.status)) {
				existing.requestId = request.id;
				existing.deliveryState = delivery.state;
				existing.deliveryStatus = delivery.status;
				existing.status = delivery.state === "failed" || delivery.state === "partial" ? "failed" : delivery.status === "delivered" ? "delivered" : "queued";
				existing.updatedAt = nowIso(now);
				changed = true;
			}
			continue;
		}
		if (request.messagePreview.startsWith("[Hospital ")) {
			const message = `Hospital etiketi bilinmeyen düzeltmeye referans veriyor: ${request.id}`;
			protocolError(state, { id: `steering-${request.id}`, runId: run.id }, message, now);
			errors.push(message);
			changed = true;
			continue;
		}
		for (const target of request.targets) {
			try {
				const correction = recordCorrection(state, {
					text: request.messagePreview,
					runId: run.id,
					childIndex: target.index,
					requestId: request.id,
					status: delivery.state === "failed" || delivery.state === "partial" ? "failed" : delivery.status === "delivered" ? "delivered" : "queued",
				}, now);
				correction.deliveryState = delivery.state;
				correction.deliveryStatus = delivery.status;
				observed.push(correction);
			} catch (error) {
				const message = `Fleet steering ledger'a alınamadı (${request.id}#${target.index}): ${error instanceof Error ? error.message : String(error)}`;
				protocolError(state, { id: `steering-${request.id}-${target.index}`, runId: run.id, childIndex: target.index }, message, now);
				errors.push(message);
			}
		}
		changed = true;
	}
	return { changed, observed, errors };
}

export function resolveProtocolError(state: HospitalState, id: string, resolution: string, now = Date.now()): boolean {
	const error = state.protocolErrors.find((item) => item.id === id && !item.resolved);
	if (!error) return false;
	error.resolved = true;
	error.resolvedAt = nowIso(now);
	error.resolution = resolution.trim();
	return true;
}

export function gateBlockers(state: HospitalState): string[] {
	const blockers: string[] = [];
	const openAssumptions = state.assumptions.filter((item) => item.status === "open" || (item.status === "rejected" && !item.impactApplied));
	const openCorrections = state.corrections.filter((item) => item.status !== "applied");
	const protocolErrors = state.protocolErrors.filter((item) => !item.resolved);
	if (openAssumptions.length) blockers.push(`${openAssumptions.length} açık/uygulanmamış varsayım`);
	if (openCorrections.length) blockers.push(`${openCorrections.length} uygulanmamış düzeltme`);
	if (state.question || state.status === "waiting") blockers.push("bekleyen kullanıcı kararı");
	if (protocolErrors.length) blockers.push(`${protocolErrors.length} çözülmemiş protokol hatası`);
	return blockers;
}

export function terminalBlockers(state: HospitalState): string[] {
	const blockers = gateBlockers(state);
	if (state.activeRuns.length) blockers.push(`${state.activeRuns.length} aktif Hospital run`);
	if (!state.commitSha) blockers.push("güncel commit SHA yok");
	if (!state.reviews.adversarial || state.reviews.adversarial.sha !== state.commitSha || state.reviews.adversarial.verdict !== "PASS") blockers.push("güncel adversarial PASS yok");
	if (!state.reviews.readiness || state.reviews.readiness.sha !== state.commitSha || state.reviews.readiness.verdict !== "READY") blockers.push("güncel readiness READY yok");
	return blockers;
}

function shortText(value: string | undefined, length: number): string | undefined {
	if (!value) return undefined;
	const compact = value.replace(/\s+/g, " ").trim();
	return compact.length > length ? `${compact.slice(0, length - 1)}…` : compact;
}

function shortPath(value: string | undefined, length = 72): string | undefined {
	if (!value) return undefined;
	if (value.length <= length) return value;
	return `…${value.slice(-(length - 1))}`;
}

function elapsed(startedAt: string, now: number): string {
	const ms = Math.max(0, now - Date.parse(startedAt));
	const totalSeconds = Math.floor(ms / 1000);
	const minutes = Math.floor(totalSeconds / 60);
	const seconds = totalSeconds % 60;
	return minutes > 0 ? `${minutes}d ${seconds}s` : `${seconds}s`;
}

function phaseNumber(phase: string): string {
	if (phase.includes("groundwork")) return "1/5";
	if (phase.includes("evidence")) return "2/5";
	if (phase.includes("to-spec")) return "3/5";
	if (phase.includes("commit")) return "4/5";
	if (phase.includes("review") || phase.includes("adversarial") || phase.includes("readiness")) return "5/5";
	return "–/5";
}

function correctionLabel(status: CorrectionStatus): string {
	return ({ recorded: "kaydedildi", queued: "sırada", delivered: "teslim edildi", acknowledged: "anlaşıldı", verified: "doğrulandı", applied: "uygulandı", failed: "teslim başarısız" })[status];
}

export function buildWidgetLines(state: HospitalState, runtimes: Map<string, RuntimeStatus>, now = Date.now()): string[] {
	const lines = [`🏥 Hospital Spec · ${phaseNumber(state.phase)} ${state.phase} · ${state.status}`];
	if (state.activeRuns.length === 0) lines.push("Supervisor ana ekranda sonraki aşamayı değerlendiriyor.");
	for (const run of state.activeRuns) {
		const runtime = runtimes.get(run.id);
		const steps = runtime?.steps?.length ? runtime.steps : [{ agent: run.agents.join(" + "), status: runtime?.state, currentTool: runtime?.currentTool, currentPath: runtime?.currentPath, turnCount: runtime?.turnCount, toolCount: runtime?.toolCount }];
		for (const step of steps) {
			const target = step.currentPath ?? step.currentToolArgs;
			const activity = step.currentTool ? `${step.currentTool}${target ? ` · ${shortPath(String(target))}` : ""}` : "kanıtı değerlendiriyor";
			lines.push(`${step.agent ?? "child"}${step.model ? ` · ${step.model}` : ""} · ${elapsed(run.startedAt, now)} · ${step.status ?? runtime?.state ?? "running"}`);
			lines.push(`  ↳ ${activity} · ${step.turnCount ?? runtime?.turnCount ?? "?"} turn/${step.toolCount ?? runtime?.toolCount ?? "?"} tool`);
			const latest = shortText(step.recentOutput?.at(-1), 150);
			if (latest) lines.push(`  ↳ son: ${latest}`);
		}
	}
	const openAssumption = state.assumptions.findLast((item) => item.status === "open" || (item.status === "rejected" && !item.impactApplied));
	if (openAssumption) lines.push(`⚠ varsayım ${openAssumption.id}: ${shortText(openAssumption.claim, 110)} → doğrula: ${shortText(openAssumption.verify, 90)}`);
	else {
		const resolvedAssumption = state.assumptions.at(-1);
		if (resolvedAssumption?.evidence?.length) lines.push(`✓ varsayım ${resolvedAssumption.id} ${resolvedAssumption.status}: ${shortText(resolvedAssumption.evidence.at(-1), 130)}`);
	}
	const correction = state.corrections.findLast((item) => item.status !== "applied") ?? state.corrections.at(-1);
	if (correction) lines.push(`↪ ${correction.id}: ${correctionLabel(correction.status)} · ${shortText(correction.text, 120)}`);
	const error = state.protocolErrors.findLast((item) => !item.resolved);
	if (error) lines.push(`⛔ protokol: ${shortText(error.message, 150)}`);
	lines.push("Ctrl+Alt+F transcript · s doğrudan steer · D durdur · main'e doğal dille müdahale edin");
	return lines;
}
