#!/usr/bin/env node

/**
 * Permanent Build Guard: Date Library Enforcement
 *
 * Scans all source files under `src/` to prevent reintroducing any banned date patterns.
 * Fails the build (exit code 1) if any banned pattern is found outside `src/lib/dates.ts`.
 */

const fs = require('fs');
const path = require('path');

const ROOT_SRC = path.resolve(__dirname, '..', 'src');
const ALLOWED_FILES = [
  path.resolve(ROOT_SRC, 'lib', 'dates.ts'),
];

const BANNED_RULES = [
  {
    id: 'BANNED_ISO_SLICE',
    description: 'Avoid .toISOString().split("T")[0] or .slice(0, 10). Use toDateInputString() or fromDbDate() from @/lib/dates.',
    test: (line) => /\.toISOString\(\)\s*\.\s*(?:split\(['"]T['"]\)\[0\]|slice\(0,\s*10\)|substring\(0,\s*10\))/.test(line),
  },
  {
    id: 'BANNED_MS_DAY_MATH',
    description: 'Avoid raw millisecond day math (86400000 / 1000*60*60*24). Use calendarDayDiff() or dueState() from @/lib/dates.',
    test: (line) => /(?:86400000|1000\s*\*\s*60\s*\*\s*60\s*\*\s*24)/.test(line),
  },
  {
    id: 'BANNED_APPROX_MONTH_MATH',
    description: 'Avoid approximating months with 30-day blocks (* 30 * 24 * 60 * 60 * 1000). Use addCalendarMonths() or addCalendarDays() from @/lib/dates.',
    test: (line) => /(?:30(?:\.5)?|365)\s*\*\s*24\s*\*\s*60\s*\*\s*60\s*\*\s*1000/.test(line),
  },
  {
    id: 'BANNED_NEW_DATE_LITERAL',
    description: "new Date('YYYY-MM-DD') parses as UTC midnight and causes timezone off-by-one errors. Use parseCalendarDate() or toDbDate() from @/lib/dates.",
    test: (line) => /new\s+Date\s*\(\s*['"]\d{4}-\d{2}-\d{2}['"]\s*\)/.test(line),
  },
  {
    id: 'BANNED_MANUAL_DATE_STRING_BUILD',
    description: 'Manual YYYY-MM-DD string building using getFullYear/getMonth/getDate. Use toDateInputString() from @/lib/dates.',
    test: (line) => /\$\{[^}]*getFullYear\(\)[^}]*\}\s*-\s*\$\{[^}]*getMonth\(\)[^}]*\}\s*-\s*\$\{[^}]*getDate\(\)/.test(line),
  },
  {
    id: 'BANNED_LOCAL_DATE_HELPERS',
    description: 'Local duplicate copy of date helpers. Import addCalendarMonths / addCalendarDays from @/lib/dates.',
    test: (line) => /function\s+(?:addMonthsToDateString|addDaysToTodayString)\b/.test(line),
  },
];

function walk(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.resolve(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      results = results.concat(walk(fullPath));
    } else if (/\.(ts|tsx|js|jsx)$/.test(file)) {
      results.push(fullPath);
    }
  }
  return results;
}

const files = walk(ROOT_SRC);
const violations = [];

for (const file of files) {
  if (ALLOWED_FILES.includes(file)) continue;

  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    // Skip empty lines or pure single-line comments
    if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) {
      return;
    }

    for (const rule of BANNED_RULES) {
      if (rule.test(trimmed)) {
        violations.push({
          file: path.relative(path.resolve(__dirname, '..'), file).replace(/\\/g, '/'),
          line: index + 1,
          code: trimmed,
          rule: rule.id,
          message: rule.description,
        });
      }
    }
  });
}

if (violations.length > 0) {
  console.error('\n🚨 DATE GUARD VIOLATION: Banned date patterns detected in source code!');
  console.error('All date math, calendar parsing, and date input formatting must use @/lib/dates.\n');
  console.error(`Total violations: ${violations.length}\n`);

  violations.forEach((v, i) => {
    console.error(`[${i + 1}] ${v.file}:${v.line} (${v.rule})`);
    console.error(`    Code:    ${v.code}`);
    console.error(`    Fix:     ${v.message}\n`);
  });

  console.error('Build aborted by scripts/check-dates.js (exit 1).\n');
  process.exit(1);
} else {
  console.log('✅ Date guard passed: 0 banned date patterns in src/ (all dates use @/lib/dates).');
  process.exit(0);
}
