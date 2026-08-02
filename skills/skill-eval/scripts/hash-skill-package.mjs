#!/usr/bin/env node

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const ignoredDirectories = new Set([
  ".git",
  "__pycache__",
  "node_modules",
]);

const ignoredFiles = new Set([
  ".DS_Store",
]);

function isIgnoredFile(name) {
  return (
    ignoredFiles.has(name) ||
    name.endsWith(".pyc") ||
    name.endsWith(".pyo")
  );
}

function collectFiles(root, current = root) {
  const files = [];
  const entries = fs.readdirSync(current, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isSymbolicLink()) {
      throw new Error(`Symbolic links are not allowed in a skill package: ${entry.name}`);
    }
    if (entry.isDirectory() && ignoredDirectories.has(entry.name)) continue;
    if (entry.isFile() && isIgnoredFile(entry.name)) continue;

    const absolute = path.join(current, entry.name);
    if (entry.isDirectory()) files.push(...collectFiles(root, absolute));
    if (entry.isFile()) files.push(path.relative(root, absolute).split(path.sep).join("/"));
  }
  return files.sort((left, right) => left.localeCompare(right));
}

export function hashSkillPackage(subjectPath) {
  const root = path.resolve(subjectPath);
  const stat = fs.statSync(root);
  if (!stat.isDirectory()) throw new Error(`Subject is not a directory: ${root}`);
  if (!fs.existsSync(path.join(root, "SKILL.md"))) {
    throw new Error(`Subject has no SKILL.md: ${root}`);
  }

  const files = collectFiles(root);
  const hash = crypto.createHash("sha256");
  for (const relative of files) {
    const body = fs.readFileSync(path.join(root, relative));
    hash.update(relative, "utf8");
    hash.update("\0");
    hash.update(String(body.length), "utf8");
    hash.update("\0");
    hash.update(body);
    hash.update("\0");
  }

  return {
    path: root,
    content_sha256: hash.digest("hex"),
    files,
  };
}

function main() {
  const subjectPath = process.argv[2];
  if (!subjectPath) {
    console.error("Usage: hash-skill-package.mjs <skill-package-path>");
    process.exit(2);
  }
  try {
    process.stdout.write(`${JSON.stringify(hashSkillPackage(subjectPath), null, 2)}\n`);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
