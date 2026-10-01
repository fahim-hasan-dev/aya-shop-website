---
trigger: always_on
description: Rule to strictly enforce dedicated tools (view_file, replace_file_content, write_to_file, grep_search, list_dir) over raw shell commands for file reading and editing.
---

# Prefer Dedicated Tools for File & Code Operations

1. **Always Use Dedicated File Tools**:
   - **For Reading Files**: ALWAYS use `view_file`. NEVER use shell commands like `cat`, `Get-Content`, `head`, `tail`, `type`, or bash/powershell commands to view file contents.
   - **For Editing Files**: ALWAYS use `replace_file_content`, `multi_replace_file_content`, or `write_to_file`. NEVER use shell commands (like PowerShell script string replacements, `sed`, or file overwrites via terminal) to update file contents.
   - **For Searching Code**: ALWAYS use `grep_search`.
   - **For Directory Listing**: ALWAYS use `list_dir`.

2. **When Shell Commands (`run_command`) Are Allowed**:
   - `run_command` SHOULD ONLY be used for executing build scripts (`npm run build`, `yarn dev`), package installation (`npm i`, `yarn add`), test runners (`npx tsc`, `npm test`), git operations, or running local dev servers.

3. **Human-Readable Summaries**:
   - ALWAYS provide clear, descriptive, human-readable `toolAction` and `toolSummary` text (e.g., `toolAction: "Reading file content"`, `toolAction: "Updating user route"`) so the user can easily understand what each tool action does in the UI permission dialogs.