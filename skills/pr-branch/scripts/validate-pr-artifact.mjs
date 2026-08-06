#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";

const REQUIRED_HEADINGS = [
  "## What This PR Does",
  "### The Problem",
  "### The Solution",
  "## What Changes for the Team",
  "## Technical Summary",
  "## Test Plan",
];

const FORBIDDEN_REPLACEMENT_HEADINGS = [
  "## Business impact",
  "### Business impact",
  "## Summary",
  "### Technical details and validation",
  "## Technical detail and validation",
];

const NONTECHNICAL_MECHANISMS = [
  /`/,
  /\bendpoint\b/i,
  /\bmiddleware\b/i,
  /\brace condition\b/i,
  /\bcache\b/i,
  /\bmigration\b/i,
  /\bidempoten\w*\b/i,
  /\bfenc\w*\b/i,
  /\bclaim token\b/i,
  /\begress\b/i,
  /\ballowlist\b/i,
];

function countExactLine(lines, expected) {
  return lines.filter((line) => line.trim() === expected).length;
}

function tableValue(lines, label) {
  const row = lines.find((line) => line.trim().startsWith(`| ${label} |`));
  if (!row) return null;
  return row.split("|")[2]?.trim() ?? "";
}

export function validateArtifact(title, body) {
  const errors = [];
  const lines = body.split(/\r?\n/);

  if (!title.trim()) errors.push("Title is empty.");
  if (/`/.test(title)) errors.push("Title contains a code identifier.");
  if (/\b(egress|allowlist)\b/i.test(title)) {
    errors.push("Title leads with an internal mechanism instead of an audience-visible outcome.");
  }

  let previousIndex = -1;
  for (const heading of REQUIRED_HEADINGS) {
    const count = countExactLine(lines, heading);
    if (count !== 1) {
      errors.push(`Expected exactly one '${heading}' heading; found ${count}.`);
      continue;
    }
    const index = lines.findIndex((line) => line.trim() === heading);
    if (index <= previousIndex) errors.push(`Heading '${heading}' is out of order.`);
    previousIndex = index;
  }

  for (const heading of FORBIDDEN_REPLACEMENT_HEADINGS) {
    if (countExactLine(lines, heading) > 0) {
      errors.push(`Forbidden replacement heading '${heading}' collapses the two-block format.`);
    }
  }

  const teamIndex = lines.findIndex((line) => line.trim() === "## What Changes for the Team");
  const technicalIndex = lines.findIndex((line) => line.trim() === "## Technical Summary");
  const separatorIndex = lines.findIndex(
    (line, index) => line.trim() === "---" && index > teamIndex && index < technicalIndex,
  );
  if (separatorIndex === -1) errors.push("Missing '---' separator between audience blocks.");

  const nontechnicalEnd = separatorIndex === -1 ? technicalIndex : separatorIndex;
  if (nontechnicalEnd > 0) {
    const candidateLines = lines.slice(0, nontechnicalEnd);
    const developerLine = candidateLines.findIndex(
      (line) => /^\s*-\s*\*\*For developers:\*\*/i.test(line),
    );
    const nontechnicalLines = developerLine === -1
      ? candidateLines
      : candidateLines.slice(0, developerLine);
    const nontechnical = nontechnicalLines.join("\n");
    for (const pattern of NONTECHNICAL_MECHANISMS) {
      if (pattern.test(nontechnical)) {
        errors.push(`Non-technical block contains mechanism language matching ${pattern}.`);
      }
    }
  }

  const solutionIndex = lines.findIndex((line) => line.trim() === "### The Solution");
  if (solutionIndex !== -1 && teamIndex > solutionIndex) {
    const solution = lines.slice(solutionIndex + 1, teamIndex).join("\n");
    if (!/\d/.test(solution)) errors.push("Solution section has no verified scale statement.");
  }

  for (const label of ["Commits", "Files changed", "Lines changed"]) {
    const value = tableValue(lines, label);
    if (value === null) errors.push(`Technical metric table is missing '${label}'.`);
    else if (!/\d/.test(value)) errors.push(`Technical metric '${label}' has no exact number.`);
  }

  const testPlanIndex = lines.findIndex((line) => line.trim() === "## Test Plan");
  if (testPlanIndex !== -1) {
    const testPlan = lines.slice(testPlanIndex + 1).join("\n");
    if (!/^- \[[ x]\] /m.test(testPlan)) errors.push("Test Plan has no concrete checkbox evidence or action.");
  }

  return errors;
}

function parseArgs(argv) {
  const args = new Map();
  for (let index = 0; index < argv.length; index += 2) {
    args.set(argv[index], argv[index + 1]);
  }
  return args;
}

const isEntrypoint = process.argv[1]
  && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isEntrypoint) {
  const args = parseArgs(process.argv.slice(2));
  const titlePath = args.get("--title-file");
  const bodyPath = args.get("--body-file");
  if (!titlePath || !bodyPath) {
    console.error("Usage: validate-pr-artifact.mjs --title-file <path> --body-file <path>");
    process.exit(2);
  }

  const errors = validateArtifact(
    fs.readFileSync(titlePath, "utf8"),
    fs.readFileSync(bodyPath, "utf8"),
  );
  if (errors.length) {
    for (const error of errors) console.error(`- ${error}`);
    process.exit(1);
  }
  console.log("PR artifact validation: PASS");
}
