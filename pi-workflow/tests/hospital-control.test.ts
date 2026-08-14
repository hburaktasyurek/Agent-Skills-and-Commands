import assert from "node:assert/strict";
import * as fs from "node:fs";
import * as path from "node:path";
import { test } from "node:test";
import {
	applyCorrection,
	applyInvalidation,
	applySupervisorSignal,
	buildWidgetLines,
	createHospitalState,
	gateBlockers,
	migrateHospitalState,
	reconcileRuntimeSteering,
	recordCorrection,
	recordRunStarted,
	terminalBlockers,
	updateCorrectionDelivery,
	type HospitalState,
} from "../extensions/hospital-control/core.ts";

const cwd = path.resolve("/tmp/hospital-control-test-repo");
const run = {
	id: "run-1234567890",
	agents: ["workflow-groundwork"],
	asyncDir: "/tmp/run-123",
	startedAt: "2026-08-14T10:00:00.000Z",
};

function state(): HospitalState {
	const value = createHospitalState({
		cwd,
		repoRoot: cwd,
		task: "Ground this task",
		status: "active",
		phase: "groundwork",
		parentApproved: true,
		activeRuns: [],
		startedAt: "2026-08-14T10:00:00.000Z",
		updatedAt: "2026-08-14T10:00:00.000Z",
	});
	recordRunStarted(value, run);
	return value;
}

function details(id: string) {
	return { id, reason: "progress_update", runId: run.id, agent: run.agents[0], childIndex: 0 };
}

function signal(value: Record<string, unknown>): string {
	return `Subagent progress update.\nRun: ${run.id}\n\nHOSPITAL_SIGNAL ${JSON.stringify(value)}`;
}

test("migrates v2 state without losing active run or task authority", () => {
	const migrated = migrateHospitalState({
		version: 2,
		cwd,
		repoRoot: cwd,
		task: "old task",
		status: "active",
		phase: "evidence",
		parentApproved: true,
		activeRuns: [run],
		startedAt: "2026-08-14T10:00:00.000Z",
		updatedAt: "2026-08-14T10:00:00.000Z",
	}, cwd);

	assert.equal(migrated?.version, 3);
	assert.equal(migrated?.task, "old task");
	assert.deepEqual(migrated?.activeRuns, [run]);
	assert.equal(migrated?.runLedger[0]?.id, run.id);
	assert.deepEqual(migrated?.corrections, []);
	assert.equal(migrateHospitalState({ version: 2, cwd: "/wrong" }, cwd), undefined);
});

test("records and resolves an assumption once, with exact run identity", () => {
	const value = state();
	const opened = applySupervisorSignal(value, signal({
		v: 1,
		kind: "assumption_open",
		id: "A1",
		claim: "The owner is booking-form.php",
		verify: "Trace the registered callback",
		impact: "Groundwork owner lock",
	}), details("msg-open"), value.phase, Date.parse("2026-08-14T10:01:00.000Z"));

	assert.equal(opened.kind, "assumption_open");
	assert.equal(value.assumptions[0]?.status, "open");
	assert.match(gateBlockers(value).join(" "), /varsayım/);
	assert.equal(applySupervisorSignal(value, "HOSPITAL_SIGNAL {}", details("msg-open"), value.phase).changed, false);

	const resolved = applySupervisorSignal(value, signal({
		v: 1,
		kind: "assumption_resolved",
		id: "A1",
		outcome: "confirmed",
		evidence: ["booking-form.php:42 registers the callback"],
	}), details("msg-resolved"), value.phase);
	assert.equal(resolved.kind, "assumption_resolved");
	assert.equal(value.assumptions[0]?.status, "confirmed");
	assert.equal(gateBlockers(value).length, 0);

	const wrongRun = applySupervisorSignal(value, signal({
		v: 1,
		kind: "assumption_open",
		id: "A2",
		claim: "wrong",
		verify: "wrong",
		impact: "wrong",
	}), { ...details("msg-wrong"), runId: "foreign-run" }, value.phase);
	assert.match(wrongRun.error ?? "", /eşleşmiyor/);
	assert.equal(value.protocolErrors.at(-1)?.resolved, false);
});

test("keeps delivery, acknowledgment, verification, and application distinct", () => {
	const value = state();
	value.commitSha = "a".repeat(40);
	value.reviews = {
		adversarial: { verdict: "PASS", sha: value.commitSha, recordedAt: value.updatedAt },
		readiness: { verdict: "READY", sha: value.commitSha, recordedAt: value.updatedAt },
	};
	const correction = recordCorrection(value, { text: "Owner is elsewhere", runId: run.id, childIndex: 0 });
	updateCorrectionDelivery(value, {
		correctionId: correction.id,
		requestId: "steer-1",
		deliveryState: "delivered",
		deliveryStatus: "delivered",
	});
	assert.equal(correction.status, "delivered");
	assert.match(gateBlockers(value).join(" "), /düzeltme/);
	assert.throws(() => applyCorrection(value, correction.id), /kanıtla doğrulanmalı/);

	applySupervisorSignal(value, signal({
		v: 1,
		kind: "correction_ack",
		correctionId: correction.id,
		summary: "Verify the callback owner before continuing",
	}), details("msg-ack"), value.phase);
	assert.equal(correction.status, "acknowledged");

	applySupervisorSignal(value, signal({
		v: 1,
		kind: "correction_resolved",
		correctionId: correction.id,
		outcome: "confirmed",
		evidence: ["routes.php:18 points to the actual owner"],
		summary: "The original owner lock was wrong",
		invalidatesFrom: "groundwork",
	}), details("msg-resolution"), value.phase);
	assert.equal(correction.status, "verified");
	assert.equal(value.commitSha, "a".repeat(40));

	applyCorrection(value, correction.id);
	assert.equal(correction.status, "applied");
	assert.equal(value.phase, "groundwork");
	assert.equal(value.commitSha, undefined);
	assert.deepEqual(value.reviews, {});
	assert.equal(gateBlockers(value).length, 0);
});

test("rejects correction resolution without an ACK", () => {
	const value = state();
	const correction = recordCorrection(value, { text: "Check this", runId: run.id, childIndex: 0 });
	const result = applySupervisorSignal(value, signal({
		v: 1,
		kind: "correction_resolved",
		correctionId: correction.id,
		outcome: "rejected",
		evidence: ["source confirms the original claim"],
		summary: "No change",
	}), details("msg-no-ack"), value.phase);
	assert.match(result.error ?? "", /ACK/);
	assert.equal(correction.status, "recorded");
});

test("keeps failed delivery blocked but allows retrying the same correction", () => {
	const value = state();
	const correction = recordCorrection(value, { text: "Retry this", runId: run.id });
	updateCorrectionDelivery(value, {
		correctionId: correction.id,
		requestId: "failed-request",
		deliveryState: "failed",
		deliveryStatus: "queued",
	});
	assert.equal(correction.status, "failed");
	assert.match(gateBlockers(value).join(" "), /düzeltme/);
	updateCorrectionDelivery(value, {
		correctionId: correction.id,
		requestId: "retry-request",
		deliveryState: "delivered",
		deliveryStatus: "delivered",
	});
	assert.equal(correction.status, "delivered");
});

test("blocks a rejected assumption until its invalidation is applied", () => {
	const value = state();
	applySupervisorSignal(value, signal({
		v: 1,
		kind: "assumption_open",
		id: "A-rewind",
		claim: "The first owner is authoritative",
		verify: "Trace registration",
		impact: "Groundwork lock",
	}), details("rewind-open"), value.phase);
	applySupervisorSignal(value, signal({
		v: 1,
		kind: "assumption_resolved",
		id: "A-rewind",
		outcome: "rejected",
		evidence: ["Registration points elsewhere"],
		invalidatesFrom: "groundwork",
	}), details("rewind-resolved"), value.phase);
	assert.match(gateBlockers(value).join(" "), /varsayım/);
	applyInvalidation(value, "groundwork");
	assert.equal(gateBlockers(value).length, 0);
});

test("reconciles direct Fleet steering and never marks it applied", () => {
	const value = state();
	const result = reconcileRuntimeSteering(value, run, {
		state: "running",
		steering: {
			recent: [{
				id: "fleet-request",
				requestedAt: Date.parse("2026-08-14T10:02:00.000Z"),
				messagePreview: "Şu varsayımı önce doğrula",
				targets: [{ index: 0, state: "delivered" }],
			}],
		},
	});

	assert.equal(result.observed.length, 1);
	assert.equal(result.observed[0]?.status, "delivered");
	assert.notEqual(result.observed[0]?.status, "applied");
	assert.match(gateBlockers(value).join(" "), /düzeltme/);
});

test("fails closed when tagged steering bypasses correction_record", () => {
	const value = state();
	const result = reconcileRuntimeSteering(value, run, {
		steering: {
			recent: [{
				id: "orphan-tag",
				requestedAt: Date.parse("2026-08-14T10:02:00.000Z"),
				messagePreview: "[Hospital C-999] bypassed",
				targets: [{ index: 0, state: "delivered" }],
			}],
		},
	});
	assert.equal(result.observed.length, 0);
	assert.equal(result.errors.length, 1);
	assert.match(gateBlockers(value).join(" "), /protokol hatası/);
});

test("requires an exact child for parallel review corrections", () => {
	const value = state();
	const parallel = {
		id: "parallel-review",
		agents: ["workflow-adversarial-spec", "workflow-spec-readiness"],
		startedAt: "2026-08-14T10:03:00.000Z",
	};
	recordRunStarted(value, parallel);
	assert.throws(
		() => recordCorrection(value, { text: "Check the reviewer assumption", runId: parallel.id }),
		/exact childIndex/,
	);
	assert.equal(value.corrections.length, 0);
});

test("widget projects live activity and control risks without a transcript clone", () => {
	const value = state();
	recordCorrection(value, { text: "Verify the owner", runId: run.id, childIndex: 0 });
	const lines = buildWidgetLines(value, new Map([[run.id, {
		state: "running",
		steps: [{
			agent: "workflow-groundwork",
			model: "opencode-go/deepseek-v4-pro",
			status: "running",
			currentTool: "read",
			currentPath: "/a/very/long/path/booking-form.php",
			turnCount: 3,
			toolCount: 8,
			recentOutput: ["Tracing the registered callback owner"],
		}],
	}]]), Date.parse("2026-08-14T10:02:05.000Z"));

	assert.match(lines.join("\n"), /1\/5 groundwork/);
	assert.match(lines.join("\n"), /deepseek-v4-pro/);
	assert.match(lines.join("\n"), /booking-form\.php/);
	assert.match(lines.join("\n"), /C-001: kaydedildi/);
	assert.match(lines.at(-1) ?? "", /Ctrl\+Alt\+F/);
});

test("terminal completion requires current PASS and READY receipts", () => {
	const value = state();
	value.activeRuns = [];
	value.commitSha = "b".repeat(40);
	assert.match(terminalBlockers(value).join(" "), /adversarial PASS/);
	value.reviews = {
		adversarial: { verdict: "PASS", sha: value.commitSha, recordedAt: value.updatedAt },
		readiness: { verdict: "READY", sha: value.commitSha, recordedAt: value.updatedAt },
	};
	assert.deepEqual(terminalBlockers(value), []);
});

test("all six spec agents carry the Hospital signal contract", () => {
	const root = path.resolve(import.meta.dirname, "..", "agents");
	for (const name of [
		"workflow-groundwork.md",
		"workflow-evidence.md",
		"workflow-to-spec.md",
		"workflow-commit.md",
		"workflow-adversarial-spec.md",
		"workflow-spec-readiness.md",
	]) {
		const text = fs.readFileSync(path.join(root, name), "utf8");
		assert.match(text, /Hospital control protocol/);
		assert.match(text, /HOSPITAL_SIGNAL/);
		assert.match(text, /Delivery is not compliance/);
	}
});
