const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'src');
const outDir = path.join(__dirname, '..', 'out');
const outFile = path.join(outDir, 'bundles.js');

// ---------------------------------------------------------------------------
// GAS Compliance: sanitize a source file's content so the bundle artifact
// is compatible with the Google Apps Script (V8) runtime.
//
// Restrictions applied (see agents/build-restrictions.agent.md):
//   1. ES6 `import` statements are not supported — strip all import lines.
//   2. ES6 `export` keyword is not supported — strip the `export` prefix from
//      function / const / let / var declarations, keeping the declaration itself.
//   3. `export default` expressions — strip the `export default` prefix.
//   4. Named re-export blocks `export { ... }` — remove the entire block.
//   5. CommonJS `module.exports` and `require()` — not applicable here since
//      source files use ES module syntax, but flagged as a warning if found.
// ---------------------------------------------------------------------------
function sanitizeForGAS(content, filename) {
  let out = content;

  // 1. Strip `import ...` lines (single-line or multi-line with line continuation)
  out = out.replace(/^import\s[^;]+;?\s*$/gm, '');

  // 2. Strip named re-export blocks: export { foo, bar } or export { foo } from '...'
  out = out.replace(/^export\s*\{[^}]*\}(\s*from\s*['"][^'"]+['"])?\s*;?\s*$/gm, '');

  // 3. Strip `export default` prefix — keep the value/expression after it
  out = out.replace(/^export\s+default\s+/gm, '');

  // 4. Strip `export` prefix from declarations (function, const, let, var, class, async function)
  out = out.replace(/^export\s+((?:async\s+)?(?:function|const|let|var|class)\s)/gm, '$1');

  // 5. Warn if CommonJS patterns survive (they would break GAS too)
  if (/\brequire\s*\(/.test(out) || /\bmodule\.exports\b/.test(out)) {
    console.warn(`Warning [${filename}]: CommonJS syntax detected in output — this will fail in GAS.`);
  }

  return out;
}

function bundle() {
  // Create out directory if it doesn't exist
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  try {
    // Functions are presented in order of execution based on execution-workflow.yaml.
    // Note: src/index.js is excluded — it contains only import/export declarations
    // used for local development and is not needed in the flat GAS bundle.
    const fileOrder = [
      'config.js',
      'schemas.js',
      'routers.js',     // masterFormRouter
      'handlers.js',    // onMemberSignup, onPaymentSubmit
      'utils.js',       // getFieldValue
      'functions.js'    // updateMemberDropdown
    ];

    let bundledContent = '';
    let count = 0;

    for (const file of fileOrder) {
      const filePath = path.join(srcDir, file);
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, 'utf-8');
        const sanitized = sanitizeForGAS(raw, file);

        bundledContent += `// --- File: ${file} ---\n`;
        bundledContent += sanitized;
        bundledContent += '\n\n';
        count++;
      } else {
        console.warn(`Warning: ${file} not found in src directory.`);
      }
    }

    // Write GAS-compliant bundle to out/bundles.js
    fs.writeFileSync(outFile, bundledContent, 'utf-8');
    console.log(`Successfully bundled ${count} files into ${outFile}`);

  } catch (error) {
    console.error('Error bundling files:', error);
    process.exit(1);
  }
}

bundle();
