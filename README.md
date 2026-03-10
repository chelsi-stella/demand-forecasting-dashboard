# Demand Forecasting Dashboard

A prototype demand forecasting review and approval interface built with the HelloFresh Enterprise Design System. Designed for demand planners to review weekly box forecasts, investigate risk signals, apply overrides, and approve runs for downstream processing.

---

## Overview

This dashboard supports the weekly forecast review workflow for HelloFresh demand planners. It provides a single-page interface for monitoring forecast health, comparing runs, managing overrides, and tracking approvals across a configurable weekout horizon.

**Key capabilities:**

- Multi-dimension forecast review (Box, Recipe, SKU, Add-ons)
- Run comparison with configurable comparator (Monday, Tuesday, Wednesday)
- Inline override management with reason codes and audit trail
- Risk classification (High / Medium) with box-volume impact
- Alert center with Blocking, Warning, and Version Delta categorisation
- Bulk approval workflow with comment capture
- Full audit log of all system and user actions

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Components | shadcn/ui + Radix UI |
| Charts | Recharts |
| Icons | lucide-react |
| Forms | react-hook-form + Zod |
| Design System | HelloFresh Enterprise Design System |

---

## Getting Started

**Prerequisites:** Node.js 18+, pnpm

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

---

## Project Structure

```
demand-forecasting-dashboard/
├── app/
│   ├── page.tsx              # Main dashboard page + state management
│   ├── layout.tsx            # Root layout
│   └── globals.css           # HelloFresh design tokens (--hf- variables)
├── components/
│   ├── forecast/             # Domain-specific components
│   │   ├── approval-dialog.tsx
│   │   ├── audit-log.tsx
│   │   ├── edit-forecast-panel.tsx
│   │   ├── explain-change-dialog.tsx
│   │   ├── forecast-chart.tsx
│   │   ├── forecast-context-bar.tsx
│   │   ├── forecast-table.tsx
│   │   ├── kpi-cards.tsx
│   │   ├── recipe-override-sheet.tsx
│   │   ├── risk-summary.tsx
│   │   ├── sku-override-sheet.tsx
│   │   └── validation-panel.tsx
│   └── ui/                   # shadcn/ui components with HF tokens
├── hooks/                    # Custom React hooks
├── lib/
│   ├── forecast-data.ts      # Type definitions + mock data
│   └── utils.ts              # Shared utilities
├── styles/                   # Additional stylesheets
├── CLAUDE.md                 # AI assistant instructions (see below)
└── DESIGN_TOKENS.md          # HelloFresh design token reference
```

---

## Design System

This project uses the **HelloFresh Enterprise Design System**. All 140+ design tokens are defined in `app/globals.css` with the `--hf-` prefix and were extracted directly from Figma using the Variables API.

**Quick token reference:**

| Token | Value | Use |
|---|---|---|
| `--hf-foreground-positive-positive-dark` | #067a46 | Primary actions, success |
| `--hf-foreground-negative-negative-dark` | #b30000 | Errors, destructive |
| `--hf-foreground-warning-warning-mid` | #ef670a | Warnings, caution |
| `--hf-foreground-information-information-dark` | #001db2 | Info, links |
| `--hf-foreground-dark-neutral-neutral-dark` | #242424 | Primary body text |
| `--hf-stroke-neutral-neutral-mid` | #e4e4e4 | Default borders |
| `--hf-background-light-neutral-neutral-mid` | #f8f8f8 | Page background |

See `DESIGN_TOKENS.md` for the full reference.

**Typography:**
- Headlines: Agrandir Digital (`--hf-font-headline`), weight 500
- Body: Source Sans Pro (`--hf-font-body`), weights 400 / 600 / 700

---

## AI-Assisted Development

This project was built using **Claude Code** (terminal) inside **Cursor** (editor). The two tools serve different roles:

- **Cursor** handles file-level tasks: inline completions, quick edits, refactoring within a file
- **Claude Code** handles project-level tasks: scaffolding components, multi-file changes, running commands, and wiring up state

### CLAUDE.md

`CLAUDE.md` is the project brief for Claude. It is read at the start of every Claude Code session and instructs the AI on:

- Design token usage rules (always use `--hf-` tokens, never arbitrary hex values)
- How to consult the Figma design system before creating new components
- HelloFresh-specific UI patterns (override indicators, status badges, filter pills)
- Anti-patterns to avoid (redundant UI, inconsistent patterns, information overload)
- A decision framework for every design change

This means every AI-assisted change in this project is aware of the design system, the codebase conventions, and the team's standards — without needing to re-explain them each session.

---

## Key Workflows

### Weekly Forecast Review

1. Open the dashboard — defaults to the current HelloFresh week and Wednesday run
2. Review KPI cards for forecast volume, WAPE, Bias, and Confidence
3. Scan the forecast table (sorted by Action Required by default)
4. Investigate flagged weeks using the Alert Center
5. Apply overrides via the Edit Forecast Panel with a reason code
6. Review the Weekly Forecast Trend chart to check run-to-run stability
7. Approve the forecast using the Review & Approve flow

### Override Flow

- Click **Edit** on any forecast row to open the override panel
- Enter the new operational value with a reason code and comment
- The audit log records who changed what and when
- Overridden rows are flagged with an amber indicator

### Approval Flow

- Click **Review & Approve** to open the approval dialog
- Review which weeks are eligible (excludes locked and errored weeks)
- Add an approval comment and confirm
- Approved weeks are reflected in the table status

---

## Mock Data

All data is mocked in `lib/forecast-data.ts`. The default scenario represents **Maria Schmidt** reviewing the **Wednesday Run** for **HelloFresh Germany (DE)** across **HFW09–HFW16 (Weekout 1–8)**.

To extend or change the scenario, update the `forecastWeeks`, `forecastVersions`, `comparisonVersions`, and `auditLog` exports in that file.

---

## Contributing

Before making any UI changes, follow the pre-design checklist in `CLAUDE.md`:

1. Check `DESIGN_TOKENS.md` for the correct token
2. Search the Figma design system for the component pattern
3. Check `components/` for existing implementations
4. Apply the decision framework before building anything new

When in doubt: check Figma first, use tokens always, and never use arbitrary hex values.
