const fs = require('fs');

const content = fs.readFileSync('frontend/src/components/AdminDashboard.jsx', 'utf8');
const lines = content.split('\n');

console.log('Total lines in AdminDashboard.jsx: ' + lines.length);

// Find each activeTab block and its start/end line
const tabs = [];
lines.forEach((line, idx) => {
  const m = line.match(/activeTab === ["']([^"']+)["']\s*&&/);
  if (m && line.includes('(')) {
    tabs.push({ tab: m[1], line: idx + 1 });
  }
});

console.log('\n--- TABS IN AdminDashboard.jsx ---');
tabs.forEach((t, i) => {
  const nextLine = (i + 1 < tabs.length) ? tabs[i + 1].line : lines.length;
  console.log(`Tab: "${t.tab}" (lines ${t.line} to ${nextLine})`);
});

