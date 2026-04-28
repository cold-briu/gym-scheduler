const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'src');
const outDir = path.join(__dirname, '..', 'out');
const outFile = path.join(outDir, 'bundles.js');

function bundle() {
  // Create out directory if it doesn't exist
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  try {
    // 4. functions are presented in order of execution based on execution-workflow.yaml
    // Note: src/index.js is excluded from this list.
    const fileOrder = [
      'config.js',
      'schemas.js',
      'routers.js',     // masterFormRouter
      'handlers.js',    // onPaymentSubmit, onMemberSignup
      'utils.js',       // getFieldValue
      'functions.js'    // updateMemberDropdown
    ];

    let bundledContent = '';
    let count = 0;

    for (const file of fileOrder) {
      const filePath = path.join(srcDir, file);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf-8');
        
        bundledContent += `// --- File: ${file} ---\n`;
        bundledContent += content;
        bundledContent += '\n\n';
        count++;
      } else {
        console.warn(`Warning: ${file} not found in src directory.`);
      }
    }

    // Write bundled content to out/bundles.js
    fs.writeFileSync(outFile, bundledContent, 'utf-8');
    console.log(`Successfully bundled ${count} files into ${outFile}`);

  } catch (error) {
    console.error('Error bundling files:', error);
    process.exit(1);
  }
}

bundle();
