#!/usr/bin/env node

/**
 * log-deploy.js
 * Appends a timestamped entry to deployments.yaml after a successful clasp push.
 * Run automatically at the end of the deploy pipeline via `npm run deploy`.
 */

const fs   = require('fs');
const path = require('path');

const DEPLOYMENTS_FILE = path.resolve(__dirname, '..', 'deployments.yaml');

const timestamp = new Date().toISOString();

const entry = `
- date: "${timestamp}"
`;

fs.appendFileSync(DEPLOYMENTS_FILE, entry, 'utf8');
console.log(`Logged deployment at ${timestamp}`);
