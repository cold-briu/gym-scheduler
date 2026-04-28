# gym-scheduler
Google Apps Script Gym Scheduler

## Project Overview
This repository contains the codebase and technical specifications for the Gym Schedule System, a backend management tool utilizing Google Apps Script, Google Sheets, and Google Forms.

## Core Files Documentation

### `package.json`
The configuration file for this Node.js project. It defines the project metadata, entry point (`src/index.js`), and available npm scripts. The primary script provided is `npm run build`, which triggers the custom build process.

### `design-spec.yaml`
The central Software Design Document (SDD) defining the system's architecture, functional requirements, and implementation details. It outlines how different Google Workspace services interact and specifies workflows for features such as:
- New User Registration
- New User Payment
- Initial Schedule Assignment
- Class Attendance
- User Schedule Modification
- Flexible Date Parsing

### `build.js`
A custom Node.js build script designed to prepare the modular codebase for Google Apps Script deployment. When executed, it scans the `src` directory and concatenates all `.js` files into a single, consolidated `bundles.js` file within the `out` directory.

### `src/index.js`
The primary entry module for the source code. It gathers and exports core components from the modular files—including `CONFIG`, utilities (`getFieldValue`), functions (`updateMemberDropdown`), routing logic (`masterFormRouter`), and event handlers (`onPaymentSubmit`, `onMemberSignup`). This establishes a unified interface for the application.
