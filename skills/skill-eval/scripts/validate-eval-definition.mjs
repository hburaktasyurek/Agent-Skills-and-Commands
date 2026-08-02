#!/usr/bin/env node

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const caseTypes = new Set(["primary", "edge", "scope_preservation"]);
const sources = new Set(["synthetic", "project_artifact", "observed_failure"]);

function nonEmpty(value) {
  return typeof value === "string" && value.trim().length > 0;
}

export function validateEvalDefinition(definition, { phase = "calibrate", baseDir = "." } = {}) {
  const errors = [];
  if (!definition || typeof definition !== "object" || Array.isArray(definition)) {
    return { valid: false, errors: ["Definition must be a JSON object."] };
  }
  if (!nonEmpty(definition.skill_name)) errors.push("skill_name must be a non-empty string.");
  if (!Array.isArray(definition.evals) || definition.evals.length < 3) {
    errors.push("evals must contain at least three cases.");
    return { valid: false, errors };
  }

  const ids = new Set();
  const observedTypes = new Set();
  let hasNonSyntheticSource = false;
  definition.evals.forEach((candidate, index) => {
    const prefix = `evals[${index}]`;
    if (!(typeof candidate.id === "string" || Number.isInteger(candidate.id))) {
      errors.push(`${prefix}.id must be a string or integer.`);
    } else if (ids.has(String(candidate.id))) {
      errors.push(`${prefix}.id must be unique.`);
    } else {
      ids.add(String(candidate.id));
    }
    if (!nonEmpty(candidate.prompt)) errors.push(`${prefix}.prompt must be non-empty.`);
    if (!nonEmpty(candidate.expected_output)) {
      errors.push(`${prefix}.expected_output must be non-empty.`);
    }
    if (!Array.isArray(candidate.files)) errors.push(`${prefix}.files must be an array.`);
    else {
      for (const file of candidate.files) {
        if (!nonEmpty(file)) errors.push(`${prefix}.files contains an invalid path.`);
        else {
          const absolute = path.resolve(baseDir, file);
          const relative = path.relative(path.resolve(baseDir), absolute);
          if (path.isAbsolute(file) || relative.startsWith("..") || path.isAbsolute(relative)) {
            errors.push(`${prefix}.files path escapes the skill package: ${file}`);
          } else if (!fs.existsSync(absolute)) {
            errors.push(`${prefix}.files path does not exist: ${file}`);
          } else if (fs.lstatSync(absolute).isSymbolicLink()) {
            errors.push(`${prefix}.files path may not be a symlink: ${file}`);
          } else if (!fs.realpathSync(absolute).startsWith(`${fs.realpathSync(baseDir)}${path.sep}`)) {
            errors.push(`${prefix}.files real path escapes the skill package: ${file}`);
          }
        }
      }
    }

    const metadata = candidate.metadata;
    if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
      errors.push(`${prefix}.metadata is required.`);
    } else {
      if (!caseTypes.has(metadata.case_type)) {
        errors.push(`${prefix}.metadata.case_type must be primary, edge, or scope_preservation.`);
      } else {
        observedTypes.add(metadata.case_type);
      }
      if (!sources.has(metadata.source)) {
        errors.push(`${prefix}.metadata.source must be synthetic, project_artifact, or observed_failure.`);
      } else if (metadata.source !== "synthetic") {
        hasNonSyntheticSource = true;
        const sourcePath = metadata?.source_evidence?.path;
        const sourceHash = metadata?.source_evidence?.sha256;
        const origin = metadata?.source_evidence?.origin;
        const absoluteSource = nonEmpty(sourcePath) ? path.resolve(baseDir, sourcePath) : null;
        const relativeSource = absoluteSource ? path.relative(path.resolve(baseDir), absoluteSource) : "..";
        if (
          !nonEmpty(sourcePath) ||
          !/^[a-f0-9]{64}$/.test(sourceHash ?? "") ||
          path.isAbsolute(sourcePath) ||
          relativeSource.startsWith("..") ||
          path.isAbsolute(relativeSource) ||
          !fs.existsSync(absoluteSource) ||
          !fs.statSync(absoluteSource).isFile() ||
          !candidate.files.includes(sourcePath)
        ) {
          errors.push(`${prefix}.metadata.source_evidence must name a replayed package-local case file and SHA-256.`);
        } else {
          const observedHash = crypto
            .createHash("sha256")
            .update(fs.readFileSync(absoluteSource))
            .digest("hex");
          if (observedHash !== sourceHash) {
            errors.push(`${prefix}.metadata.source_evidence hash mismatch.`);
          }
        }
        const allowedOriginTypes = metadata.source === "project_artifact"
          ? new Set(["external_attachment", "git_blob"])
          : new Set(["observed_failure_record", "external_attachment"]);
        if (
          !allowedOriginTypes.has(origin?.type) ||
          !nonEmpty(origin?.locator) ||
          !nonEmpty(origin?.captured_at)
        ) {
          errors.push(`${prefix}.metadata.source_evidence.origin is missing or incompatible with source.`);
        }
      }
    }

    if (phase === "verify") {
      if (!Array.isArray(candidate.assertions) || candidate.assertions.length === 0) {
        errors.push(`${prefix}.assertions must be non-empty in verify phase.`);
      } else if (candidate.assertions.some((assertion) => !nonEmpty(assertion))) {
        errors.push(`${prefix}.assertions must contain non-empty strings.`);
      }
    } else if (phase !== "calibrate") {
      errors.push(`Unsupported phase: ${phase}`);
    }
  });

  for (const requiredType of caseTypes) {
    if (!observedTypes.has(requiredType)) errors.push(`Missing required case type: ${requiredType}.`);
  }
  if (phase === "verify" && !hasNonSyntheticSource) {
    errors.push("verify phase requires at least one project_artifact or observed_failure case.");
  }
  return { valid: errors.length === 0, errors };
}

export function validateTriggerDefinition(definition) {
  const errors = [];
  if (!definition || typeof definition !== "object" || Array.isArray(definition)) {
    return { valid: false, errors: ["Trigger definition must be a JSON object."] };
  }
  if (!nonEmpty(definition.skill_name)) errors.push("trigger skill_name must be non-empty.");
  if (!new Set(["explicit_only", "implicit"]).has(definition.activation_mode)) {
    errors.push("activation_mode must be explicit_only or implicit.");
  }
  if (!Array.isArray(definition.queries) || definition.queries.length < 16) {
    errors.push("queries must contain at least sixteen cases.");
    return { valid: false, errors };
  }
  const byId = new Map();
  const coverage = new Set();
  for (const [index, candidate] of definition.queries.entries()) {
    const prefix = `queries[${index}]`;
    if (!nonEmpty(candidate.id) || byId.has(candidate.id)) {
      errors.push(`${prefix}.id must be non-empty and unique.`);
    } else byId.set(candidate.id, candidate);
    if (!new Set(["train", "validation"]).has(candidate.split)) {
      errors.push(`${prefix}.split must be train or validation.`);
    }
    if (!nonEmpty(candidate.query)) errors.push(`${prefix}.query must be non-empty.`);
    if (typeof candidate.should_trigger !== "boolean") {
      errors.push(`${prefix}.should_trigger must be boolean.`);
    } else {
      coverage.add(`${candidate.split}:${candidate.should_trigger ? "positive" : "negative"}`);
    }
    if (!nonEmpty(candidate.paired_with)) errors.push(`${prefix}.paired_with must be non-empty.`);
  }
  for (const candidate of definition.queries) {
    const pair = byId.get(candidate.paired_with);
    if (!pair) {
      errors.push(`${candidate.id}.paired_with does not resolve.`);
      continue;
    }
    if (
      pair.paired_with !== candidate.id ||
      pair.split !== candidate.split ||
      pair.should_trigger === candidate.should_trigger
    ) {
      errors.push(`${candidate.id} does not form a reciprocal opposite-label pair.`);
    }
  }
  if (coverage.size !== 4) errors.push("queries need train/validation positive and negative coverage.");
  return { valid: errors.length === 0, errors };
}

function main() {
  const file = process.argv[2];
  const phaseIndex = process.argv.indexOf("--phase");
  const phase = phaseIndex === -1 ? "calibrate" : process.argv[phaseIndex + 1];
  if (!file) {
    console.error("Usage: validate-eval-definition.mjs <evals.json> --phase calibrate|verify");
    process.exit(2);
  }
  try {
    const absolute = path.resolve(file);
    const definition = JSON.parse(fs.readFileSync(absolute, "utf8"));
    const evalResult = validateEvalDefinition(definition, {
      phase,
      baseDir: path.dirname(path.dirname(absolute)),
    });
    const triggerPath = path.join(path.dirname(absolute), "trigger_queries.json");
    const triggerResult = fs.existsSync(triggerPath)
      ? validateTriggerDefinition(JSON.parse(fs.readFileSync(triggerPath, "utf8")))
      : { valid: false, errors: ["Missing sibling evals/trigger_queries.json."] };
    const result = {
      valid: evalResult.valid && triggerResult.valid,
      errors: [...evalResult.errors, ...triggerResult.errors],
    };
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    if (!result.valid) process.exit(1);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
