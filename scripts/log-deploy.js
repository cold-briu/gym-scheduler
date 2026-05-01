#!/usr/bin/env node

/**
 * log-deploy.js
 * Appends a timestamped entry to deployments.yaml after a successful clasp push.
 * Run automatically at the end of the deploy pipeline via `npm run deploy`.
 */

const fs   = require('fs');
const path = require('path');

const DEPLOYMENTS_FILE = path.resolve(__dirname, '..', 'deployments.yaml');

const pkgPath = path.resolve(__dirname, '..', 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
const version = pkg.version;

const timestamp = new Date().toISOString();

const entry = `
- date: "${timestamp}"
  version: "${version}"
`;

fs.appendFileSync(DEPLOYMENTS_FILE, entry, 'utf8');
console.log(`Logged deployment at ${timestamp}`);
