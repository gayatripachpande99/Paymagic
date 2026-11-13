const fs = require('fs');

const content = fs.readFileSync('frontend/src/components/AdminDashboard.jsx', 'utf8');
const lines = content.split('\n');

const inlineStyles = [];
lines.forEach((line, idx) => {
  const m = line.match(/style=\{\{([^}]+)\}\}/);
  if (m) {
    const text = m[1].trim();
    if (text.includes('display:') || text.includes('width:') || text.includes('grid') || text.includes('flex')) {
      inlineStyles.push({ line: idx + 1, style: text, full: line.trim() });
    }
  }
});

console.log('Found ' + inlineStyles.length + ' inline layout styles:');
inlineStyles.slice(0, 30).forEach(s => {
  console.log(`L${s.line}: ${s.full}`);
});
if (inlineStyles.length > 30) {
  console.log(`... and ${inlineStyles.length - 30} more`);
}

