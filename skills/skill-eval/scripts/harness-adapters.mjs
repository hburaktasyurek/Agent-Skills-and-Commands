import path from "node:path";

function integer(value) {
  return Number.isInteger(value) && value >= 0 ? value : null;
}

function tokenUsage(input, output, cached = 0, reasoning = 0) {
  const normalized = {
    input: integer(input),
    cached_input: integer(cached) ?? 0,
    output: integer(output),
    reasoning_output: integer(reasoning) ?? 0,
  };
  if (normalized.input === null || normalized.output === null) {
    return { status: "unavailable" };
  }
  return { status: "observed", ...normalized, total: normalized.input + normalized.output };
}

function jsonLines(raw) {
  const events = [];
  const errors = [];
  for (const [index, line] of raw.split(/\r?\n/).entries()) {
    if (!line.trim()) continue;
    try {
      const event = JSON.parse(line);
      if (!event || typeof event !== "object" || Array.isArray(event)) {
        errors.push(`line ${index + 1} is not a JSON object`);
      } else {
        events.push(event);
      }
    } catch (error) {
      errors.push(`line ${index + 1} is invalid JSON: ${error.message}`);
    }
  }
  return { events, errors };
}

function textParts(value, output = []) {
  if (typeof value === "string") output.push(value);
  if (Array.isArray(value)) value.forEach((item) => textParts(item, output));
  if (value && typeof value === "object") {
    for (const [key, item] of Object.entries(value)) {
      if (["text", "content", "result"].includes(key)) textParts(item, output);
    }
  }
  return output.filter((item) => item.trim());
}

function parsedResult(events, errors, finalMessage, usage, sessionId = null) {
  if (!finalMessage?.trim()) errors.push("final message is missing");
  return {
    valid: errors.length === 0,
    errors,
    events,
    event_count: events.length,
    final_message: finalMessage?.trimEnd() ?? "",
    usage,
    session_id: sessionId,
  };
}

export function parseCodex(raw) {
  const { events, errors } = jsonLines(raw);
  const completed = events.filter((event) => event.type === "turn.completed");
  const failed = events.filter((event) => ["turn.failed", "error"].includes(event.type));
  if (completed.length !== 1) errors.push(`expected one turn.completed event, observed ${completed.length}`);
  if (failed.length) errors.push("run contains a failed event");
  const messages = events
    .filter((event) => event.type === "item.completed" && event.item?.type === "agent_message")
    .map((event) => event.item?.text)
    .filter((value) => typeof value === "string");
  const observed = completed[0]?.usage ?? {};
  return parsedResult(
    events,
    errors,
    messages.at(-1),
    tokenUsage(
      observed.input_tokens,
      observed.output_tokens,
      observed.cached_input_tokens,
      observed.reasoning_output_tokens,
    ),
    events.find((event) => event.type === "thread.started")?.thread_id ?? null,
  );
}

export function parseClaudeCode(raw) {
  const { events, errors } = jsonLines(raw);
  const results = events.filter((event) => event.type === "result");
  if (results.length !== 1) errors.push(`expected one result event, observed ${results.length}`);
  if (results[0]?.is_error === true || events.some((event) => event.type === "error")) {
    errors.push("run reports an error");
  }
  const result = results[0] ?? {};
  const observed = result.usage ?? {};
  const cached = (integer(observed.cache_read_input_tokens) ?? 0) +
    (integer(observed.cache_creation_input_tokens) ?? 0);
  return parsedResult(
    events,
    errors,
    typeof result.result === "string" ? result.result : textParts(result.result).at(-1),
    tokenUsage(
      integer(observed.input_tokens) === null ? null : observed.input_tokens + cached,
      observed.output_tokens,
      cached,
    ),
    result.session_id ?? events.find((event) => event.type === "system")?.session_id ?? null,
  );
}

export function parseCursor(raw) {
  const { events, errors } = jsonLines(raw);
  const results = events.filter((event) => event.type === "result");
  if (results.length !== 1) errors.push(`expected one result event, observed ${results.length}`);
  const result = results[0] ?? {};
  if (result.is_error === true || result.subtype === "error" || events.some((event) => event.type === "error")) {
    errors.push("run reports an error");
  }
  return parsedResult(
    events,
    errors,
    typeof result.result === "string" ? result.result : textParts(result.result).at(-1),
    { status: "unavailable" },
    result.session_id ?? events.find((event) => event.type === "system")?.session_id ?? null,
  );
}

export function parseOpenCode(raw, { processCompleted = false } = {}) {
  const { events, errors } = jsonLines(raw);
  if (!processCompleted) errors.push("process completion is required");
  if (events.some((event) => event.type === "error" || event.error)) errors.push("run reports an error");
  const messages = events.flatMap((event) => textParts(event.part ?? event.message ?? event));
  const usageEvent = [...events].reverse().find((event) => event.usage || event.tokens);
  const observed = usageEvent?.usage ?? usageEvent?.tokens ?? {};
  return parsedResult(
    events,
    errors,
    messages.at(-1),
    tokenUsage(
      observed.input_tokens ?? observed.input,
      observed.output_tokens ?? observed.output,
      observed.cached_input_tokens ?? observed.cache_read ?? 0,
      observed.reasoning_output_tokens ?? observed.reasoning ?? 0,
    ),
    events.find((event) => event.session_id || event.sessionID)?.session_id ??
      events.find((event) => event.session_id || event.sessionID)?.sessionID ?? null,
  );
}

export function parseCline(raw, { processCompleted = false } = {}) {
  const { events, errors } = jsonLines(raw);
  if (!processCompleted) errors.push("process completion is required");
  const messages = events
    .filter((event) => event.type === "say" && event.partial !== true && typeof event.text === "string")
    .map((event) => event.text);
  if (events.some((event) => event.type === "ask" && /error|failed/i.test(event.ask ?? ""))) {
    errors.push("run reports an error");
  }
  return parsedResult(events, errors, messages.at(-1), { status: "unavailable" });
}

const adapters = {
  codex: {
    executable: "codex",
    parser: parseCodex,
    projection: "native",
    canDisableNamesakes: true,
    safePermissions: new Set(["read-only", "workspace-write"]),
    skillDirectory: null,
    buildArgs({ model, workspace, permission, skillFile, disabledSkillFiles = [] }) {
      const args = ["exec", "--ephemeral", "--json", "--ignore-user-config", "--ignore-rules", "-C", workspace, "--sandbox", permission, "--config", 'web_search="disabled"'];
      if (model) args.push("--model", model);
      const skillConfig = [
        ...(skillFile ? [{ path: skillFile, enabled: true }] : []),
        ...disabledSkillFiles.map((file) => ({ path: file, enabled: false })),
      ];
      if (skillConfig.length) {
        const entries = skillConfig
          .map((item) => `{ path = ${JSON.stringify(item.path)}, enabled = ${item.enabled} }`)
          .join(", ");
        args.push("--config", `skills.config=[${entries}]`);
      }
      args.push("-");
      return args;
    },
    promptOnStdin: true,
  },
  "claude-code": {
    executable: "claude",
    parser: parseClaudeCode,
    projection: "native",
    safePermissions: new Set(["read-only"]),
    skillDirectory: ".claude/skills",
    buildArgs({ model, permission }) {
      const args = ["-p", "--output-format", "stream-json", "--verbose", "--no-session-persistence", "--strict-mcp-config", "--no-chrome"];
      args.push("--permission-mode", permission === "workspace-write" ? "acceptEdits" : "plan");
      args.push("--tools", permission === "workspace-write" ? "Bash,Edit,Read,Glob,Grep" : "Read,Glob,Grep");
      if (model) args.push("--model", model);
      return args;
    },
    promptOnStdin: true,
  },
  cursor: {
    executable: "cursor-agent",
    parser: parseCursor,
    projection: "prompt_context",
    safePermissions: new Set(["read-only", "workspace-write"]),
    skillDirectory: null,
    buildArgs({ model, permission, prompt }) {
      const args = ["-p", "--output-format", "stream-json", "--sandbox", "enabled"];
      if (model) args.push("--model", model);
      if (permission === "workspace-write") args.push("--force");
      args.push(prompt);
      return args;
    },
    promptOnStdin: false,
  },
  opencode: {
    executable: "opencode",
    parser: parseOpenCode,
    projection: "native",
    safePermissions: new Set(["read-only"]),
    skillDirectory: ".opencode/skills",
    buildArgs({ model, workspace, prompt }) {
      const args = ["--pure", "run", "--format", "json", "--dir", workspace, "--auto"];
      if (model) args.push("--model", model);
      args.push(prompt);
      return args;
    },
    buildEnv({ permission }) {
      const allowed = permission === "workspace-write"
        ? { "*": "deny", read: "allow", glob: "allow", grep: "allow", list: "allow", skill: "allow", edit: "allow", bash: "allow", lsp: "allow" }
        : { "*": "deny", read: "allow", glob: "allow", grep: "allow", list: "allow", skill: "allow" };
      return {
        OPENCODE_PERMISSION: JSON.stringify(allowed),
        OPENCODE_DISABLE_DEFAULT_PLUGINS: "true",
        OPENCODE_DISABLE_AUTOUPDATE: "true",
        OPENCODE_AUTO_SHARE: "false",
      };
    },
    promptOnStdin: false,
  },
  cline: {
    executable: "cline",
    parser: parseCline,
    projection: "native",
    safePermissions: new Set(["read-only"]),
    skillDirectory: ".cline/skills",
    buildArgs({ model, workspace, permission, prompt, traceDir }) {
      const args = ["--json", "--cwd", workspace, "--data-dir", path.join(traceDir, "cline-state")];
      args.push("--auto-approve", permission === "workspace-write" ? "true" : "false");
      if (permission === "read-only") args.push("--plan");
      if (model) args.push("--model", model);
      args.push(prompt);
      return args;
    },
    promptOnStdin: false,
  },
};

export function listAdapters() {
  return Object.entries(adapters).map(([id, adapter]) => ({
    id,
    executable: adapter.executable,
    projection: adapter.projection,
    can_disable_namesakes: Boolean(adapter.canDisableNamesakes),
    safe_permissions: [...adapter.safePermissions],
  }));
}

export function getAdapter(id) {
  const adapter = adapters[id];
  if (!adapter) throw new Error(`Unknown adapter: ${id}. Expected one of: ${Object.keys(adapters).join(", ")}`);
  return { id, ...adapter };
}

export function parseAdapterOutput(id, raw, options) {
  return getAdapter(id).parser(raw, options);
}
