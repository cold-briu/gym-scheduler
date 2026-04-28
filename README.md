# Gym Scheduler

Google Apps Script Gym Scheduler for member management, payments, and class scheduling.

## Project Overview
This repository contains the codebase and technical specifications for the Gym Schedule System, a backend management tool utilizing Google Apps Script, Google Sheets, and Google Forms. The project is designed with a modular architecture, enabling local development, automated testing, and a build process for deployment to Google Workspace.

## Project Status
The system is currently in active development.

- **Implemented**: New User Registration (Partial), New User Payment, Flexible Date Parsing.
- **Pending**: Initial Schedule Assignment, Class Attendance, Modify User Schedule.

For a detailed breakdown of feature implementation, see [Implementation Status](specs/implementation-status.md).

## Directory Structure
```text
.
├── agents/             # Agent instructions and changelogs
├── out/                # Bundled output for GAS deployment
├── scripts/            # Build and utility scripts
├── specs/              # Technical specifications and design docs
├── src/                # Modular source code
│   ├── config.js       # System configuration and mappings
│   ├── handlers.js     # Event handlers (Signup, Payment)
│   ├── routers.js      # Form submission routing
│   └── utils.js        # Shared utility functions
└── test/               # Jest test suite and GAS mocks
```

## Documentation & Specs

### [Design Specification](specs/design-spec.yaml)
Defines the system architecture, functional requirements, and data schemas for Google Workspace integration.

### [Form Fields Specification](specs/form-fields.yaml)
The source of truth for Google Sheets column names and Google Form question titles.

### [Gym Schedules Specification](specs/gym-schedules.yaml)
Defines all possible gym class schedules and instructor availability matrix for enrollment tracking.

### [Execution Workflow](specs/execution-workflow.yaml)
Maps the functional flow from form submission triggers through routing and handling.

### [Implementation Status](specs/implementation-status.md)
Tracks the progress of mapping specifications to implemented code.

## Development

### Building for Deployment
The project uses a custom build script to bundle modular JavaScript files into a format compatible with Google Apps Script.
```bash
npm run build
```
Output is generated in `out/bundle.js`.

### Testing
A comprehensive test suite is implemented using Jest, featuring mocks for Google Apps Script native objects (`CalendarApp`, `SpreadsheetApp`, etc.).
```bash
npm test
```
Tests are located in the `test/` directory, with isolated unit tests for core handlers.

## Changelog
Significant changes and agent modifications are tracked in [changelog.yaml](agents/changelog.yaml).
