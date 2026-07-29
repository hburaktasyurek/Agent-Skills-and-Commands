#!/usr/bin/env node

import fs from "node:fs";
import { checkCompositionRules } from "./composition-rules-core.mjs";

const indexPath = new URL("../../INDEX.md", import.meta.url);
const indexContent = fs.readFileSync(indexPath, "utf8");
const catalog = [...indexContent.matchAll(/\[([a-z0-9-]+)\]\(/g)].map((m) => m[1]);

const results = [];
const check = (name, condition, evidence) => {
  if (!condition) throw new Error(`${name} failed: ${evidence}`);
  results.push({ name, passed: true, evidence });
};

// S1 — skill-path-selector → composition_ok
const s1 = checkCompositionRules({
  subject_name: "skill-path-selector",
  invokes: ["skill-brief", "methodology-selector"],
  forbids: [],
  requires: [],
  catalog,
});
check("S1 skill-path-selector → composition_ok", s1.verdict === "composition_ok", s1.verdict);

// S2 — skill-creator → composition_ok
const s2 = checkCompositionRules({
  subject_name: "skill-creator",
  invokes: ["methodology-skill-creator", "loop-orchestrator"],
  forbids: ["skill-path-selector", "skill-review"],
  requires: [],
  catalog,
});
check("S2 skill-creator → composition_ok", s2.verdict === "composition_ok", s2.verdict);

// S3 — missing input → blocked
const s3 = checkCompositionRules({
  subject_name: "",
  invokes: [],
  forbids: [],
  requires: [],
  catalog,
});
check("S3 missing subject → blocked", s3.verdict === "blocked", s3.verdict);

// S4 — bad fixture → composition_fail (rule 1)
const s4 = checkCompositionRules({
  subject_name: "bad-fixture",
  invokes: ["not-a-real-skill-xyz"],
  forbids: [],
  requires: [],
  catalog,
});
check(
  "S4 non-catalog invoke → composition_fail rule 1",
  s4.verdict === "composition_fail" && s4.findings[0].rule === 1,
  `${s4.verdict}; ${s4.findings[0].id} rule ${s4.findings[0].rule}`,
);

// Extra: invoke ∩ forbid → fail rule 2
const r2 = checkCompositionRules({
  subject_name: "test-overlap",
  invokes: ["grill-me"],
  forbids: ["grill-me"],
  requires: [],
  catalog,
});
check(
  "invoke ∩ forbid → composition_fail rule 2",
  r2.verdict === "composition_fail" && r2.findings.some((f) => f.rule === 2),
  `${r2.verdict}; rule 2 found`,
);

// Extra: self-invoke (any subject) → fail rule 3
const r3 = checkCompositionRules({
  subject_name: "skill-router",
  invokes: ["skill-router"],
  forbids: [],
  requires: [],
  catalog,
});
check(
  "self-invoke → composition_fail rule 3",
  r3.verdict === "composition_fail" && r3.findings.some((f) => f.rule === 3),
  `${r3.verdict}; rule 3 found`,
);

// Extra: all edges valid → composition_ok
const clean = checkCompositionRules({
  subject_name: "test-clean",
  invokes: ["grill-me"],
  forbids: ["tdd"],
  requires: ["task-groundwork"],
  catalog,
});
check("all valid edges → composition_ok", clean.verdict === "composition_ok", clean.verdict);

// Extra: missing catalog → blocked
const noCat = checkCompositionRules({
  subject_name: "test",
  invokes: [],
  forbids: [],
  requires: [],
  catalog: [],
});
check("empty catalog → blocked", noCat.verdict === "blocked", noCat.verdict);

process.stdout.write(
  `${JSON.stringify({ passed: results.length, results }, null, 2)}\n`,
);
