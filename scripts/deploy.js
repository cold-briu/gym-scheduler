#!/usr/bin/env node

/**
 * deploy.js
 * Runs the full build → copy → clasp push pipeline.
 * Deployment logging is handled separately by scripts/log-deploy.js.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SRC  = path.join(ROOT, 'out', 'bundles.js');
const DEST = path.join(ROOT, 'dist', 'main.js');

function run(cmd) {
    console.log(`\n> ${cmd}`);
    execSync(cmd, { cwd: ROOT, stdio: 'inherit' });
}

// 1. Build
run('npm run build');

// 2. Copy bundle into dist/
// dist/ is provisioned by `clasp clone` and must already exist — do NOT create it
// programmatically, as doing so would bypass clasp's project metadata setup (.clasp.json,
// appsscript.json) and result in a broken or orphaned push target.
const DIST_DIR = path.dirname(DEST);
if (!fs.existsSync(DIST_DIR)) {
    console.error(`\nError: dist/ directory not found at ${DIST_DIR}`);
    console.error('Run `clasp clone <scriptId>` inside dist/ to initialize it before deploying.');
    process.exit(1);
}
fs.copyFileSync(SRC, DEST);
console.log(`\nCopied ${SRC} → ${DEST}`);

// 3. Push to Google Apps Script via clasp
// clasp push must run from dist/ where .clasp.json lives (provisioned by `clasp clone`)
execSync('clasp push', { cwd: DIST_DIR, stdio: 'inherit' });

console.log('\nDeploy complete.');
