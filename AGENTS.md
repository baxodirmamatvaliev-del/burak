# Agent Instructions

## Before Making Changes
- Read these instructions and similar existing files first.
- Inspect Git status and preserve existing local changes.
- If a merge or rebase is in progress, report it before editing.

## Code Standards
- Follow the existing architecture, naming, formatting, types, validation, and error handling.
- Backend: follow the existing router → controller → service → model structure.
- Frontend: follow the existing component, service, state, and styling conventions.
- Reuse existing methods and components before creating new ones.
- Do not copy existing bugs or insecure behavior.
- Add a short Uzbek comment above each API route and its controller and service methods. Explain what that specific layer does. For models/schemas, briefly explain what data they store. Avoid repeating identical comments.

## Scope
- Implement only the requested step.
- Do not add unnecessary integrations, dependencies, abstractions, or duplicate logic.
- Avoid unrelated refactoring, file renaming, and formatting changes.
- Preserve working features unless the task explicitly replaces them.

## Review and Verification
- Keep changes focused and easy to review.
- Review your own diff and remove unnecessary additions.
- Run checks appropriate to the changed functionality.
- Clearly state anything that could not be verified.

## Final Report
- List changed files with a brief explanation.
- Report verification results and remaining issues.
- Suggest a short English commit message based on actual changes.

## Git and Secrets
- Do not commit or push. The user handles Git commits.
- Do not reset, discard changes, or force checkout.
- Do not continue, skip, or abort a rebase without user instruction.
- Never expose credentials, tokens, or .env contents.
- Never stage or commit .env files.

Update the comment rule in both AGENTS.md files:

"Add a short Uzbek comment above each API route and its controller and service methods. Explain what that specific layer does. For models/schemas, briefly explain what data they store. Avoid repeating identical comments."

Apply this rule to the treatment code already created. Change comments only; preserve behavior.

Do not commit or push. Suggest a short English commit message.