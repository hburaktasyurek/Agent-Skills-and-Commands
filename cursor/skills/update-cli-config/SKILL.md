---
name: update-cli-config
description: >-
  View and modify Cursor CLI configuration settings in
  ~/.cursor/cli-config.json. Use when the user wants to change CLI settings,
  configure permissions, switch approval mode, enable vim mode, toggle display
  options, configure sandbox, or manage any CLI preferences.
---
# Cursor CLI Configuration

Settings are stored in `~/.cursor/cli-config.json`. Projects can layer overrides via `.cursor/cli.json` (deeper files take precedence, not written back to home config).

## How to Modify

Read `~/.cursor/cli-config.json`, apply changes, write it back. Changes take effect after restarting the CLI.

## Available Settings

### `permissions` (required)
- `allow`: string[] — patterns for allowed tool calls (e.g. `"Shell(**)"`, `"Mcp(server-name, tool-name)"`)
- `deny`: string[] — patterns for denied tool calls

### `editor`
- `vimMode`: boolean — enable vim keybindings
- `defaultBehavior`: `"ide"` | `"agent"`

### `display` (optional)
- `showLineNumbers`: boolean (default: false)
- `showThinkingBlocks`: boolean (default: false)
- `showStatusIndicators`: boolean (default: false)

### `approvalMode` (optional)
- `"allowlist"` (default) — require approval for tools not in allow list
- `"unrestricted"` — auto-approve all tool calls (yolo mode)

### `maxMode` (optional)
boolean (default: false)

### `sandbox` (optional)
- `mode`: `"disabled"` | `"enabled"`
- `networkAccess`: `"user_config_only"` | `"user_config_with_defaults"` | `"allow_all"`
- `networkAllowlist`: string[]

### `webFetchDomainAllowlist` (optional)
string[] — domains the web fetch tool may access

### `attribution` (optional)
- `attributeCommitsToAgent`: boolean (default: true)
- `attributePRsToAgent`: boolean (default: true)

## Fields You Should NOT Modify

Internal/cached state — do not edit manually:
- `version`, `model`, `selectedModel`, `modelParameters`, `hasChangedDefaultModel`
- `privacyCache`, `authInfo`, `showSandboxIntro`
