#!/usr/bin/env node

import fs from "node:fs";

const manifest = JSON.parse(
  fs.readFileSync(
    new URL("../references/manifest.json", import.meta.url),
    "utf8",
  ),
).methods;
const fixture = JSON.parse(
  fs.readFileSync(
    new URL("../evals/routing-cases.json", import.meta.url),
    "utf8",
  ),
);
const coldRouting = JSON.parse(
  fs.readFileSync(
    new URL("../evals/cold-routing-results.json", import.meta.url),
    "utf8",
  ),
);
const slugs = new Set(manifest.map(({ slug }) => slug));
const allowedSelections = new Set([...slugs, "none"]);
const requiredInputFields = [
  "task",
  "audience",
  "context",
  "output_format",
  "validation",
  "human_review_stop",
];
const results = [];

const check = (name, condition, evidence) => {
  if (!condition) {
    throw new Error(`${name} failed: ${evidence}`);
  }
  results.push({ name, passed: true, evidence });
};

check(
  "manifest contains exactly twelve unique methods",
  manifest.length === 12 && slugs.size === 12,
  `${manifest.length} entries/${slugs.size} unique slugs`,
);

const ids = new Set();
for (const candidate of fixture.cases) {
  check(
    `${candidate.id} has a unique id`,
    typeof candidate.id === "string" &&
      candidate.id.length > 0 &&
      !ids.has(candidate.id),
    candidate.id,
  );
  ids.add(candidate.id);
  check(
    `${candidate.id} preserves selector input fields`,
    requiredInputFields.every((field) =>
      Object.hasOwn(candidate.input || {}, field),
    ),
    requiredInputFields.join(", "),
  );
  check(
    `${candidate.id} expects an exact manifest slug or none`,
    allowedSelections.has(candidate.expected_methodology),
    candidate.expected_methodology,
  );
  check(
    `${candidate.id} has valid must-not choices`,
    Array.isArray(candidate.must_not_select) &&
      candidate.must_not_select.length > 0 &&
      candidate.must_not_select.every((slug) => slugs.has(slug)) &&
      !candidate.must_not_select.includes(candidate.expected_methodology),
    candidate.must_not_select?.join(", ") || "missing",
  );
  if (Object.hasOwn(candidate, "expected_deferred_method")) {
    check(
      `${candidate.id} has a distinct valid deferred method`,
      slugs.has(candidate.expected_deferred_method) &&
        candidate.expected_deferred_method !==
          candidate.expected_methodology,
      candidate.expected_deferred_method,
    );
  }
}

for (const { slug } of manifest) {
  const positive = fixture.cases.filter(
    (candidate) =>
      candidate.kind === "positive" &&
      candidate.expected_methodology === slug,
  );
  const negative = fixture.cases.filter(
    (candidate) =>
      candidate.kind === "negative-fit" &&
      candidate.must_not_select.includes(slug),
  );
  check(
    `${slug} has positive and negative-fit coverage`,
    positive.length >= 1 && negative.length >= 1,
    `positive=${positive.length}, negative-fit=${negative.length}`,
  );
}

for (const method of manifest) {
  const source = fs.readFileSync(
    new URL(`../${method.method_ref}`, import.meta.url),
    "utf8",
  );
  const stop = source.match(/## Stop\s+([\s\S]+)$/)?.[1] || "";
  const normalizedStop = stop.replace(/\s+/g, " ");
  check(
    `${method.slug} preserves canonical sections and safety stop`,
    [
      "## Definition",
      "## Fit",
      "## Principles",
      "## Steps",
      "## Quality questions",
      "## Stop",
    ].every((heading) => source.includes(heading)) &&
      normalizedStop.includes(`task does not fit ${method.name}`) &&
      normalizedStop.includes("required context is missing") &&
      normalizedStop.includes(
        "validation cannot be satisfied without guessing",
      ),
    method.method_ref,
  );
}

const overlaps = fixture.cases.filter(
  (candidate) => candidate.kind === "overlap",
);
check(
  "overlap cases exercise deferred methods",
  overlaps.length >= 2 &&
    overlaps.every((candidate) =>
      Object.hasOwn(candidate, "expected_deferred_method"),
    ),
  `${overlaps.length} overlap cases`,
);

const fixturesById = new Map(
  fixture.cases.map((candidate) => [candidate.id, candidate]),
);
check(
  "independent cold-routing matrix covers every fixture once",
  coldRouting.decision_checkpoint_before_expectations === true &&
    coldRouting.cases.length === fixture.cases.length &&
    new Set(coldRouting.cases.map(({ id }) => id)).size ===
      fixture.cases.length,
  `${coldRouting.cases.length}/${fixture.cases.length} cases`,
);

for (const observed of coldRouting.cases) {
  const expected = fixturesById.get(observed.id);
  const expectedDeferred = expected?.expected_deferred_method || "none";
  const violations = expected
    ? expected.must_not_select.filter(
        (slug) =>
          slug === observed.observed_methodology ||
          slug === observed.observed_deferred_method,
      )
    : ["missing-fixture"];
  check(
    `${observed.id} persisted cold result matches fixture after reveal`,
    expected !== undefined &&
      observed.expected_methodology === expected.expected_methodology &&
      observed.observed_methodology === expected.expected_methodology &&
      observed.expected_deferred_method === expectedDeferred &&
      observed.observed_deferred_method === expectedDeferred &&
      Array.isArray(observed.must_not_violations) &&
      observed.must_not_violations.length === 0 &&
      violations.length === 0 &&
      observed.passed === true,
    `observed=${observed.observed_methodology}/${observed.observed_deferred_method}, expected=${expected?.expected_methodology}/${expectedDeferred}, violations=${violations.join(",") || "none"}`,
  );
}

check(
  "independent cold-routing summary is internally consistent",
  coldRouting.summary.primary_passed === fixture.cases.length &&
    coldRouting.summary.primary_total === fixture.cases.length &&
    coldRouting.summary.asserted_deferred_passed === overlaps.length &&
    coldRouting.summary.asserted_deferred_total === overlaps.length &&
    coldRouting.summary.must_not_violations === 0 &&
    coldRouting.summary.methods_with_positive_and_negative_fit ===
      manifest.length &&
    coldRouting.summary.verdict === "PASS" &&
    Array.isArray(coldRouting.summary.open_findings) &&
    coldRouting.summary.open_findings.length === 0,
  JSON.stringify(coldRouting.summary),
);

process.stdout.write(
  `${JSON.stringify(
    {
      passed: results.length,
      cases: fixture.cases.length,
      methods: manifest.length,
      independent_cold_routing: coldRouting.summary,
      results,
    },
    null,
    2,
  )}\n`,
);
