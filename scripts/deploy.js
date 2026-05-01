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

// 2. Increment version in package.json
// TODO: Future implementation will add flags for major releases and fixes (patches).
// For now, default to minor bump.
const pkgPath = path.join(ROOT, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
const oldVersion = pkg.version;
const versionParts = oldVersion.split('.');
versionParts[1] = parseInt(versionParts[1]) + 1;
versionParts[2] = 0; // Reset patch on minor bump
const newVersion = versionParts.join('.');
pkg.version = newVersion;
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
console.log(`\nVersion bumped: ${oldVersion} → ${newVersion}`);


// 3. Copy bundle into dist/ and prepend version comment
// dist/ is provisioned by `clasp clone` and must already exist — do NOT create it
// programmatically, as doing so would bypass clasp's project metadata setup (.clasp.json,
// appsscript.json) and result in a broken or orphaned push target.
const DIST_DIR = path.dirname(DEST);
if (!fs.existsSync(DIST_DIR)) {
    console.error(`\nError: dist/ directory not found at ${DIST_DIR}`);
    console.error('Run `clasp clone <scriptId>` inside dist/ to initialize it before deploying.');
    process.exit(1);
}

const bundleContent = fs.readFileSync(SRC, 'utf8');
const versionedContent = `// Release: ${newVersion}\n${bundleContent}`;
fs.writeFileSync(DEST, versionedContent);
console.log(`\nCopied ${SRC} → ${DEST} (with version comment)`);

// 4. Push to Google Apps Script via clasp
// clasp push must run from dist/ where .clasp.json lives (provisioned by `clasp clone`)
execSync('clasp push', { cwd: DIST_DIR, stdio: 'inherit' });

console.log('\nDeploy complete.');

