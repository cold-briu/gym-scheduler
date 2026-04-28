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
- **Change Logging**: Each time an agent performs a change, they must log it into `agents/changelog.yaml`.
- **Test Integrity**: 
    - Never manipulate or modify test files without an explicit request from the user.
    - Never alter tests or mock data solely to force a failing test to pass.
    - If a test fails, provide a detailed technical explanation of the failure to the user so they can decide on the appropriate fix (e.g., whether the implementation or the test itself needs adjustment).