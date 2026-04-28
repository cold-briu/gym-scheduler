const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const outDir = path.join(__dirname, 'out');
const outFile = path.join(outDir, 'bundles.js');

function bundle() {
  // Create out directory if it doesn't exist
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  try {
    // Read all files from src directory
    const files = fs.readdirSync(srcDir);
    let bundledContent = '';
    let count = 0;

    for (const file of files) {
      if (path.extname(file) === '.js') {
        const filePath = path.join(srcDir, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        
        bundledContent += `// --- File: ${file} ---\n`;
        bundledContent += content;
        bundledContent += '\n\n';
        count++;
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
