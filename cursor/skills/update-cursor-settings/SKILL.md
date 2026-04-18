---
name: update-cursor-settings
description: >-
  Modify Cursor/VSCode user settings in settings.json. Use when you want to
  change editor settings, preferences, configuration, themes, font size, tab
  size, format on save, auto save, keybindings, or any settings.json values.
---
# Updating Cursor Settings

Modify Cursor/VSCode user settings in `settings.json`.

## Settings File Location

| OS | Path |
|----|------|
| macOS | `~/Library/Application Support/Cursor/User/settings.json` |
| Linux | `~/.config/Cursor/User/settings.json` |
| Windows | `%APPDATA%\Cursor\User\settings.json` |

## How to Modify

1. **Read the existing settings file**
2. **Preserve existing settings** — only add/modify what was requested
3. **Validate JSON syntax** before writing

## Common Setting Categories

- **Editor**: `editor.fontSize`, `editor.tabSize`, `editor.wordWrap`, `editor.formatOnSave`
- **Workbench**: `workbench.colorTheme`, `workbench.iconTheme`, `workbench.sideBar.location`
- **Files**: `files.autoSave`, `files.exclude`, `files.associations`
- **Terminal**: `terminal.integrated.fontSize`

## Common Requests → Settings

| User Request | Setting |
|--------------|---------|
| "bigger/smaller font" | `editor.fontSize` |
| "change tab size" | `editor.tabSize` |
| "format on save" | `editor.formatOnSave` |
| "word wrap" | `editor.wordWrap` |
| "change theme" | `workbench.colorTheme` |
| "hide minimap" | `editor.minimap.enabled` |
| "auto save" | `files.autoSave` |

## Important Notes

- settings.json supports JSON with comments (`//` and `/* */`)
- Some settings require reloading the window — inform the user
- **Workspace vs User**: User settings (this skill) apply globally; workspace settings (`.vscode/settings.json`) apply per-project
- **Commit attribution**: For CLI agent attribution, modify `~/.cursor/cli-config.json`, not settings.json. For IDE agent attribution, use Cursor Settings > Agent > Attribution in the UI.

## Workflow

1. Read `~/Library/Application Support/Cursor/User/settings.json`
2. Add/modify the requested setting(s)
3. Write the updated JSON back
4. Inform the user whether a reload is needed
