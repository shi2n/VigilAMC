const fs = require('fs');
const path = require('path');

const dirs = ['src/app/dashboard', 'src/components/admin'];
const keywords = [
  'QR', 'scanner', 'scan', 'tag', 'Delhi', 'NCR', 'Rule 33',
  'Fleet', 'Telemetry', 'Radar', 'Statutory', 'Admin OS',
  'Executive Overview', 'Dispatch', 'Premises Roster', 'Plan',
  'Upgrade', 'Subscription', 'Renews'
];

function getAllFiles(dirPath, arrayOfFiles = []) {
  if (!fs.existsSync(dirPath)) return arrayOfFiles;
  const files = fs.readdirSync(dirPath);
  files.forEach(function(file) {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
    } else {
      arrayOfFiles.push(fullPath);
    }
  });
  return arrayOfFiles;
}

const allFiles = dirs.flatMap(d => getAllFiles(d));

console.log('--- DASHBOARD FILES & COMPONENTS AUDIT ---');
allFiles.forEach(f => console.log('FILE:', f.replace(/\\/g, '/')));

const results = {};
keywords.forEach(k => results[k] = []);

allFiles.forEach(file => {
  const normFile = file.replace(/\\/g, '/');
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    keywords.forEach(kw => {
      // Use case-insensitive boundary search
      const pattern = new RegExp('(^|[^a-zA-Z0-9_])' + kw.replace(/ /g, '\\s+') + '([^a-zA-Z0-9_]|$)', 'i');
      if (pattern.test(line)) {
        results[kw].push({
          file: normFile,
          lineNum: idx + 1,
          line: line.trim()
        });
      }
    });
  });
});

console.log('\n--- KEYWORD OCCURRENCES ---');
for (const [kw, matches] of Object.entries(results)) {
  console.log(`\n=== KEYWORD: "${kw}" (Found ${matches.length} times) ===`);
  matches.forEach(m => {
    console.log(`  [${m.file}:${m.lineNum}] ${m.line}`);
  });
}
