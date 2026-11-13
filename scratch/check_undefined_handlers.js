const fs = require('fs');
const path = require('path');

function getFiles(dir, ext) {
  let files = [];
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, item.name);
    if (item.isDirectory()) {
      files = files.concat(getFiles(full, ext));
    } else if (item.name.endsWith(ext)) {
      files.push(full);
    }
  }
  return files;
}

const jsxFiles = [
  'frontend/src/App.jsx',
  'frontend/src/components/AdminDashboard.jsx',
  'frontend/src/components/EmployeeDashboard.jsx',
  ...getFiles('frontend/src/components', '.jsx'),
  ...getFiles('frontend/src/pages', '.jsx')
];

const uniqueFiles = Array.from(new Set(jsxFiles));
console.log('Auditing event handlers across ' + uniqueFiles.length + ' files...\n');

let missingHandlers = [];

for (const file of uniqueFiles) {
  const content = fs.readFileSync(file, 'utf8');
  const rel = path.relative('.', file).replace(/\\/g, '/');

  // Match simple handler references like onClick={handleSomething} or onSubmit={handleSomething}
  const handlerRegex = /(?:onClick|onSubmit|onChange|onSelect|onClose|onOpen)\s*=\s*\{\s*([a-zA-Z0-9_]+)\s*\}/g;
  let match;
  while ((match = handlerRegex.exec(content)) !== null) {
    const fnName = match[1];
    // Skip common keywords / boolean / inline
    if (['true', 'false', 'null', 'undefined'].includes(fnName)) continue;

    // Check if fnName is defined, declared, imported, or in props
    // We check:
    // 1. const fnName = 
    // 2. let fnName = 
    // 3. function fnName
    // 4. import ... fnName ... from
    // 5. passed in props (e.g. ({ fnName, ... }))
    // 6. fnName:
    const isDeclared = 
      new RegExp(`(?:const|let|var|function)\\s+${fnName}\\b`).test(content) ||
      new RegExp(`import\\s+[^;]*\\b${fnName}\\b[^;]*from`).test(content) ||
      new RegExp(`\\(\\s*\\{[^}]*\\b${fnName}\\b[^}]*\\}\\s*\\)`).test(content) || // props destructure
      new RegExp(`props\\.${fnName}\\b`).test(content) ||
      new RegExp(`export\\s+(?:const|function)\\s+${fnName}\\b`).test(content) ||
      new RegExp(`\\b${fnName}\\s*=\\s*\\(`).test(content);

    if (!isDeclared) {
      missingHandlers.push({ file: rel, fnName });
    }
  }
}

if (missingHandlers.length === 0) {
  console.log('✅ No undefined direct event handlers found!');
} else {
  console.log(`❌ Found ${missingHandlers.length} potentially undefined event handlers:`);
  missingHandlers.forEach(h => console.log(`• ${h.file} -> ${h.fnName}`));
}

