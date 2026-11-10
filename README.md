# VigilAMC

Next.js App Router + TypeScript + Tailwind CSS + Prisma + PostgreSQL + Cloudflare R2 platform for fire safety AMC compliance and operations.

## Development & Build Guards

### Permanent Date Guard (`scripts/check-dates.js`)
All date math, calendar parsing, and date input formatting must use the centralized date library:
```ts
import {
  parseCalendarDate,
  toDateInputString,
  addCalendarMonths,
  addCalendarDays,
  calendarDayDiff,
  formatDisplay,
  dueState,
  toDbDate,
  fromDbDate,
} from '@/lib/dates';
```

The build is protected by an automated prebuild guard:
- `npm run check-dates`: Scans `src/` to ensure no ad-hoc millisecond math (`86400000`), no 30-day month approximations (`* 30 * 24 * 60 * 60 * 1000`), no `.toISOString().split('T')[0]`, and no literal `new Date('YYYY-MM-DD')` parsing exist outside `src/lib/dates.ts`.
- `npm run build`: Automatically executes `prebuild` (`node scripts/check-dates.js`) before compilation and aborts if any banned pattern is reintroduced.

---
UI 'unslop' pass method by Damir Sokolovsky (@heydamir) — github.com/heydamir/unslop (CC BY 4.0)
