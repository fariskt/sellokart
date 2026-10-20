
# Ecommerce Admin Design System (Donezo Reference Standard)

## Objective
Build and maintain a cohesive, production-grade ecommerce admin panel directly modeled after the Donezo aesthetic reference: minimalist SaaS design, soft neutral canvas, rounded Bento grid cards, restrained deep forest green accents, crisp typography, and compact, functional workflows.

---

## 1. Visual Design Tokens & Palette

### Color Hierarchy & Design Tokens
- **Design Tokens Rule:** Never use arbitrary hardcoded values like `bg-[#...]` or `text-[#...]`. Always use CSS variables and Tailwind theme tokens defined in `globals.css`:
  - **Primary & Actions:** `bg-primary`, `text-primary-foreground`, `hover:bg-primary/90`, `text-primary` for primary CTAs, active sidebar pills, featured KPI cards, and key metrics.
  - **Cards & Surfaces:** `bg-card`, `text-card-foreground`, `border-border` with `rounded-2xl` or `rounded-[var(--radius)]`.
  - **Canvas & Layout:** `bg-background` and `bg-muted/30`.
  - **Muted & Neutral Text:** `text-muted-foreground`, `text-foreground`.
  - **Semantic Status Badges:**
    - Success (Completed / Paid / In Stock): `bg-success/10 text-success border border-success/20`.
    - Warning (Pending / Low Stock): `bg-warning/10 text-warning border border-warning/20`.
    - Destructive (Cancelled / Refunded / Out of Stock): `bg-destructive/10 text-destructive border border-destructive/20`.
    - Info / Secondary: `bg-secondary text-secondary-foreground`.

### Real Database Data Rule
- **Never mock or fake data:** Every route must connect to real Supabase tables (`products`, `categories`, `orders`, `profiles`, `shipments`, `payments`, `reviews`, `notifications`).
- If no data exists in a table, render an informative, clean empty state with actionable instructions. Never invent fake names, mock AWBs, or synthetic metrics to make pages look full.

### Radii & Geometry
- **Global Card Radius:** `--radius: 1rem` (`16px`). All cards, table wrappers, and dialogs use `rounded-[var(--radius)]` or `rounded-2xl`.
- **Pills:** Search inputs, action buttons, category filters, and status badges use `rounded-full`.
- **Icon Buttons:** Circular `w-8 h-8 rounded-full border border-neutral-200 flex items-center justify-center`.

---

## 2. Navigation & Layout Shell

### Responsive Sidebar
- **Header:** Brand logo with circular leaf/sparkle green icon.
- **Section Headers:** Uppercase muted text with wide letter spacing (`text-[11px] font-semibold tracking-wider text-muted-foreground/70 uppercase px-3`).
- **Navigation Items:**
  - Hover state: `hover:bg-neutral-100/80 text-foreground`.
  - Active state: Emerald left vertical pill (`w-1.5 h-6 bg-[#105634] rounded-r-full`) or subtle green badge/tint with bold text.
  - Badges: Dark rounded pill badges (e.g., `12+`).
- **Bottom Feature Card:** Dark rounded container promoting mobile app, tools, or quick shortcuts with an action button.

### Top Header Bar
- **Pill Search:** `rounded-full bg-white border border-border/80 px-4 py-2` with search icon on left and keyboard shortcut chip (`⌘F` or `Ctrl+K`) on right.
- **Action Icons:** Circular envelope / message button, circular notification bell with unread dot.
- **User Profile Capsule:** Rounded capsule with user avatar, name, and email/role.

---

## 3. Page Structure Standards

Every admin page must follow this structured anatomy:
1. **Page Header:**
   - Left: Large clean title (`text-2xl font-bold tracking-tight text-neutral-900`) and concise subtitle (`text-sm text-muted-foreground`).
   - Right: Contextual primary button (`bg-[#105634] text-white rounded-full px-5 py-2.5 font-medium`) and optional secondary action (pill outline).
2. **KPI Bento Stat Cards (when applicable):**
   - 4-card or 5-card grid.
   - First card: **Featured Deep Green** (`bg-[#105634] text-white rounded-2xl p-5`) with diagonal arrow button `↗`, prominent metric, and trend chip.
   - Secondary cards: **Clean White** (`bg-white border border-neutral-200/80 rounded-2xl p-5`) with diagonal arrow button `↗`, prominent metric, and status pill.
3. **Filter & Search Toolbar:**
   - Search input (`rounded-full`), filter dropdowns (`rounded-full` or `rounded-xl`), date range or category chips.
4. **Data Table / Bento Grid:**
   - Container: `bg-white rounded-2xl border border-neutral-200/80 overflow-hidden shadow-2xs`.
   - Headers: Muted uppercase text (`text-[11px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted/30 px-4 py-3`).
   - Rows: Subtle divider borders, hover transitions, and responsive horizontal scroll.
   - Status: `<Badge className="rounded-full px-2.5 py-0.5 text-xs font-medium ...">`.
   - Actions: Dropdown menu using shared UI components and confirmation dialogs for destructive actions.
5. **Pagination & Footer:**
   - Result count summary ("Showing 1 to 10 of 42 results") and pill pagination buttons.

---

## 4. Route-by-Route Specifications

- **Dashboard (`/admin/dashboard`):** Bento grid featuring Revenue, Orders, Customers, Inventory; interactive charts with rounded tooltips; quick tables for Recent Orders, Low Stock, and Customer Insights.
- **Products (`/admin/products`):** Grid/table of catalog items with thumbnail previews, category badges, stock indicators, price display, and tabbed dialog for Create/Edit.
- **Orders (`/admin/orders`):** Order lifecycle tracking with customer info, payment status, fulfillment badges, order totals, and quick actions.
- **Categories (`/admin/categories`):** Hierarchical category management with slug, product count, and quick edit/delete modals.
- **Customers (`/admin/customers`):** Customer directory with avatars, order history counts, total spend, and contact details.
- **Inventory (`/admin/inventory`):** Stock levels, low stock warnings, replenishment actions, and SKU tracking.
- **Settings (`/admin/settings`):** Store profile, currency, tax rates, shipping methods, and notification preferences.
- **Reviews (`/admin/reviews`), Payments (`/admin/payments`), Shipments (`/admin/shipments`), Notifications (`/admin/notifications`):** Consistent Bento cards, status indicators, and streamlined actions.

---

## 5. Implementation Rules
- **Design Tokens:** Always set `--radius: 1rem` (or `0.875rem`) so `rounded-[var(--radius)]` creates beautiful, smooth cards.
- **Shared Components:** Always reuse `<Card>`, `<Badge>`, `<Button>`, `<Table>`, `<Avatar>`, `<DropdownMenu>`, `<Dialog>`.
- **No Mock Data:** Keep existing Supabase queries, server actions, optimistic updates, and form validations intact.
- **Zero Regression:** Never remove existing business logic or parameters.

