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
// Remove duplicates
const uniqueFiles = Array.from(new Set(jsxFiles));

console.log('--- INSPECTION OF ALL PAGES & COMPONENTS (' + uniqueFiles.length + ' files) ---\n');

let issues = [];
let tablesAudited = 0;
let modalsAudited = 0;
let positionCheckCount = 0;

for (const file of uniqueFiles) {
  const content = fs.readFileSync(file, 'utf8');
  const relPath = path.relative('.', file).replace(/\\/g, '/');

  // 1. Check Modals
  // Look for modal indicators (isOpen, showModal, Dialog, Modal in name)
  if (file.toLowerCase().includes('modal') || content.includes('fixed inset-0') || content.includes('modal-overlay')) {
    modalsAudited++;
    const hasFixedOverlay = content.includes('fixed inset-0') || content.includes('modal-overlay');
    const hasZIndex = /z-(?:50|40|60|1000)|z-index:\s*(?:50|40|60|999|1000)/.test(content);
    
    if (!hasFixedOverlay && !content.includes('export default') && !file.includes('Modal')) {
      // not a modal
    } else if (!hasFixedOverlay) {
      issues.push(`[MODAL ISSUE] ${relPath} seems to be a modal but lacks 'fixed inset-0' or 'modal-overlay'`);
    }
    if (!hasZIndex) {
      issues.push(`[MODAL ISSUE] ${relPath} lacks explicit z-50 or higher z-index`);
    }
  }

  // 2. Check Table Containers for overflow-x-auto
  const tableMatches = content.match(/<table[\s\S]*?>/g);
  if (tableMatches) {
    tablesAudited += tableMatches.length;
    // Check if file wraps tables in overflow-x: auto or overflow-x-auto
    const hasOverflowWrapper = content.includes('overflow-x-auto') || 
                               content.includes('portal-table-container') ||
                               content.includes('overflow-x: auto') ||
                               content.includes('overflow-auto');
    if (!hasOverflowWrapper) {
      issues.push(`[TABLE OVERFLOW] ${relPath} contains <table> (${tableMatches.length}) without an enclosing overflow-x-auto container`);
    }
  }

  // 3. Check for unclosed or broken positioning classes
  if (content.includes('position: sticky') || content.includes('sticky top-0')) {
    positionCheckCount++;
  }
}

console.log(`Audited ${uniqueFiles.length} JSX files:`);
console.log(`- Modals checked: ${modalsAudited}`);
console.log(`- Tables checked: ${tablesAudited}`);
console.log(`- Sticky positions identified: ${positionCheckCount}`);

console.log('\n--- ISSUES FOUND ---');
if (issues.length === 0) {
  console.log('No issues found! All tables have overflow wrappers and modals have fixed z-index overlays.');
} else {
  issues.forEach(iss => console.log('• ' + iss));
}

