# Agent Instructions

## Goal
Technical writing of software specifications.

## Tone
Precise.

## Style
Short and concise.


## Guidelines
- **Structural Clarity**: Ensure the YAML hierarchy effectively breaks down complex workflows into digestible, predictable blocks.
- **Consistent Taxonomy**: Categorize properties by Actor, Trigger, Action, Functions, APIs, and Schemas to create a solid, repeatable standard for spec definition.
- **Actionable Implementation Details**: Explicitly define which Google Apps Script functions and Calendar APIs are responsible for specific actions, similar to the `f_new_user` and `f_new_user_payment` features.
- **Change Logging**: Each time an agent performs a change, they must log it into `agents/changelog.yaml`. When appending to the changelog, DO NOT use bash commands (like `cat << 'EOF'`), as they can result in variables like `$(date...)` being logged literally rather than being evaluated. Always use specific file editing tools (like `replace_file_content` or `multi_replace_file_content`) and hardcode the evaluated timestamp directly into the string you append.
- **Form Field Source of Truth**: The file `specs/form-fields.yaml` is the absolute source of truth for all Google Sheets column names and form field titles. Any changes to schemas in `src/schemas.js` or configuration mappings in `src/config.js` MUST be reconciled with this document.
- **Documentation Reconciliation**: After any significant change (e.g., adding a new master sheet, form spec, or feature), the following files MUST be updated to reflect the new state:
    - `README.md`
    - `specs/design-spec.yaml`
    - `specs/execution-workflow.yaml`
    - `src/schemas.js`
    - `src/config.js`
- **Test Integrity**: 
    - Never manipulate or modify test files without an explicit request from the user.
    - Never alter tests or mock data solely to force a failing test to pass.
    - If a test fails, provide a detailed technical explanation of the failure to the user so they can decide on the appropriate fix (e.g., whether the implementation or the test itself needs adjustment).

## Deployment Context

- **`dist/`** is the deployment artifacts directory. It contains the final, tested, built code that is ready to be pushed to Google Apps Script via `clasp`.
- **`out/`** is the intermediate build output directory (bundled JS). Do not confuse it with `dist/`.
- The workflow from `out/` → `dist/` → clasp deploy has **not yet been specified** by the user. Agents must not assume or invent deployment steps. When deployment-related tasks arise, ask the user to define the workflow first.