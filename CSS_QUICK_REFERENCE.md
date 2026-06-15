# CSS Modules Quick Reference Guide

## 📊 CSS Modules by Category

### Dashboard Components (6 files)

| File                             | Purpose                        | Layout                  | Color Theme     |
| -------------------------------- | ------------------------------ | ----------------------- | --------------- |
| `BalanceHero.module.css`         | Hero balance card with actions | 3-col grid              | Dark (gradient) |
| `MarketOverview.module.css`      | Market data table              | Card + Table            | Light           |
| `PortfolioAllocation.module.css` | Donut chart + legend           | Card + Chart            | Light           |
| `RecentTransactions.module.css`  | Transaction list               | Card + Vertical list    | Light           |
| `StatsRow.module.css`            | 4-stat card grid               | 4-col grid → responsive | Light           |
| `TradingCTA.module.css`          | Trading call-to-action banner  | Flex row + features     | Light gradient  |

### Layout Components (2 files)

| File                         | Purpose                             | Layout                | Color Theme  |
| ---------------------------- | ----------------------------------- | --------------------- | ------------ |
| `DashboardLayout.module.css` | Main app layout (sidebar + content) | Flex (sidebar + main) | Dark sidebar |
| `AdminLayout.module.css`     | Admin layout (similar to dashboard) | Flex (sidebar + main) | Dark sidebar |

### Authentication (2 files)

| File                    | Purpose                             | Layout                    | Color Theme  |
| ----------------------- | ----------------------------------- | ------------------------- | ------------ |
| `AuthLayout.module.css` | Login/Register two-column layout    | 2-col grid → 1-col mobile | Dark + Light |
| `auth.module.css`       | Shared form styles (all auth pages) | Flex column forms         | Light        |

### Main Pages (6 files)

| File                          | Purpose                | Layout                | Color Theme       |
| ----------------------------- | ---------------------- | --------------------- | ----------------- |
| `DashboardHome.module.css`    | Main dashboard page    | 3-col responsive grid | Light             |
| `DepositPage.module.css`      | Deposit form + widget  | Side-by-side flex     | Light + Dark      |
| `WithdrawPage.module.css`     | Withdraw form + widget | Side-by-side flex     | Light + Dark      |
| `MarketsPage.module.css`      | Markets/trading page   | Flex column           | Light             |
| `TransactionsPage.module.css` | Transaction history    | Stats grid + Table    | Light             |
| `WalletPage.module.css`       | User wallet management | Flex column           | Light + Dark hero |

### Utility Pages (3 files)

| File                      | Purpose               | Layout                | Color Theme |
| ------------------------- | --------------------- | --------------------- | ----------- |
| `SettingsPage.module.css` | User settings panel   | Tab sidebar + content | Light       |
| `AcademyPage.module.css`  | Academy/learning page | Hero + content        | Dark hero   |
| `SupportPage.module.css`  | Support/help page     | Flex column           | Light       |

### Admin Pages (11+ files)

| File                           | Purpose                 | Layout          | Color Theme |
| ------------------------------ | ----------------------- | --------------- | ----------- |
| `AdminOverview.module.css`     | Admin dashboard KPIs    | Grid + cards    | Light       |
| `AdminMarkets.module.css`      | Market management table | Table + filters | Light       |
| `AdminDeposits.module.css`     | Deposit management      | Table + actions | Light       |
| `AdminWithdrawals.module.css`  | Withdrawal management   | Table + actions | Light       |
| `AdminKyc.module.css`          | KYC verification        | Table + modals  | Light       |
| `AdminUsers.module.css`        | User management         | Table + filters | Light       |
| `AdminTransactions.module.css` | Transaction logs        | Table + filters | Light       |
| `AdminSupport.module.css`      | Support tickets         | Table/List      | Light       |
| `AdminSettings.module.css`     | Admin settings          | Form cards      | Light       |
| `AdminWallets.module.css`      | Wallet management       | Table           | Light       |
| `AdminAcademy.module.css`      | Academy content mgmt    | Table/Grid      | Light       |

---

## 🎨 Color Tokens (Global Variables)

```css
/* Primary */
--primary: #00c853 /* Bright green, use for CTAs */ --primary-dark: #00a844
  /* Dark green, hover state */ /* Accents */ --accent-blue: #1e88e5
  /* Blue, links and active states */ --accent-cyan: #00e5ff
  /* Cyan, branding accents */ --yellow: #ffc107 /* Yellow, warnings */
  /* Backgrounds */ --bg-dark: #0a0e1a /* Sidebar background */
  --bg-dark2: #0d1224 /* Darker background */ --bg-card: #111827
  /* Dark card background */ --bg-card2: #1a2234 /* Alternative dark card */
  /* Text */ --text-white: #ffffff /* White text on dark */
  --text-light: #b0bec5 /* Light gray text */ --text-muted: #78909c
  /* Muted gray text */ /* Borders */ --border: #1e2d45 /* Border color */;
```

---

## 🔧 Typography Scale

| Size   | Weight  | Use Case                     |
| ------ | ------- | ---------------------------- |
| 36px   | 800     | Hero titles (auth panel)     |
| 32px   | 800     | Page hero titles             |
| 28px   | 800     | KPI values (admin)           |
| 26px   | 800     | Page titles                  |
| 22px   | 800     | Section headings             |
| 18px   | 800     | Stat values                  |
| 17px   | 800     | TradingCTA heading           |
| 15px   | 700     | Card titles, section headers |
| 14px   | 500-600 | Body text, buttons           |
| 13px   | 600-700 | Regular labels, table data   |
| 12px   | 500-600 | Small labels, secondary text |
| 11.5px | 600     | Table headers, small UI      |
| 11px   | 500     | Muted text, fine print       |

---

## 📐 Spacing Scale (Gaps/Padding)

```css
4px      - Minimal spacing (rarely used)
6px      - Tight spacing (icon + text)
8px      - Small gap (form fields)
10px     - Standard small (table cells)
12px     - Standard gap (buttons, nav)
16px     - Standard gap (grid spacing, common)
20px     - Large gap (card sections)
24px     - Large gap (sections, layout gaps)
28px     - Card padding (28px vertical, 28px horizontal)
32px     - Page gaps, major sections
40px     - Page padding bottom
```

---

## 🎯 Border Radius Scale

```css
50%     - Perfect circles (avatars)
20px    - Pill shapes (badges)
16px    - Large rounded (hero cards)
14px    - Standard rounded (cards, buttons) ⭐ MOST COMMON
12px    - Smaller buttons, features
10px    - Small elements, icon containers
8px     - Form inputs, small buttons ⭐ VERY COMMON
6px     - Badges, status indicators
4px     - Admin badge
```

---

## 🖱️ Button Styles

### Primary Green Button (CTA)

```css
background: #00c853
color: #ffffff
padding: 13-14px 24px
border-radius: 10-12px
font-weight: 700
hover: background #00a844
transition: 0.15s
box-shadow: 0 4px 16px rgba(0, 200, 83, 0.28)  /* on wallet btn */
```

### Secondary Button

```css
background: transparent or #f5f6fa
border: 1px solid #e8ecf0
color: #374151
padding: 9px 18px
font-weight: 600
hover: background #f5f6fa
```

### Link Button

```css
background: transparent
color: #1565C0
font-size: 12.5-13px
font-weight: 600
hover: text-decoration underline
```

---

## 📋 Form Input Styles

### Input Field

```css
width: 100%
padding: 11px 14px
background: #f9fafb
border: 1.5px solid #e5e7eb
border-radius: 8px
font-size: 14px
font-family: 'Inter', sans-serif
color: #111827
placeholder-color: #9ca3af
```

### Input Focus State

```css
border-color: #1e88e5
background: #ffffff
box-shadow: 0 0 0 3px rgba(30,136,229,0.1)
transition: 0.2s
```

### Checkbox

```css
width: 16px
height: 16px
accent-color: #1e88e5
cursor: pointer
```

---

## 🃏 Card Styles

### White Card (Light Theme)

```css
background: #ffffff
border: 1px solid #f0f2f5
border-radius: 14px
padding: 20px
box-shadow: 0 1px 4px rgba(0,0,0,0.04)
transition: box-shadow 0.2s
hover: box-shadow 0 4px 16px rgba(0,0,0,0.08)
```

### Dark Card (Dashboard)

```css
background: #111827 or gradient
border: 1px solid rgba(255,255,255,0.07-0.08)
border-radius: 14-18px
padding: 20-28px
color: #ffffff or text-light
```

### Hero Card

```css
background: linear-gradient(135deg, #0d2052 0%, #0a1840 50%, #071230 100%)
border-radius: 16-18px
padding: 28-32px
position: relative
overflow: hidden
```

---

## 📊 Status Badge Colors

| Status           | Background | Text    | Usage              |
| ---------------- | ---------- | ------- | ------------------ |
| Success/Verified | #dcfce7    | #15803d | Approved, verified |
| Pending          | #fef3c7    | #d97706 | Pending, waiting   |
| Error/Suspended  | #fee2e2    | #dc2626 | Failed, suspended  |
| Deposit          | #dcfce7    | #15803d | Deposit badge      |
| Withdraw         | #fee2e2    | #dc2626 | Withdraw badge     |
| Trade            | #dbeafe    | #1565C0 | Trade badge        |

---

## 🔄 Responsive Grid Breakpoints

### Dashboard Stats Row

```
1400px+: 4 columns
1200px:  2 columns
600px:   1 column (stacked)
```

### Dashboard Home (3-col Grid)

```
1200px+: 3 columns (1fr | 260-320px | 280-340px)
1200px:  2 columns (transactions span full)
768px:   1 column (stacked)
```

### Admin Stats Grid

```
1400px+: 4 columns or 3 columns (KPI)
900px:   2 columns
```

### Auth Layout

```
900px+:  2 columns (left branding | right form)
900px:   1 column (form only, panel hidden)
```

---

## ⚡ Common Transitions

```css
0.1s    - Simple hover, background changes
0.15s   - Button hover, color transitions ⭐ MOST COMMON
0.2s    - Box-shadow, border-color changes
0.3s    - Sidebar, major layout shifts
```

---

## 🎭 Pseudo-Element Patterns

### Gradient Bubbles (Decorative)

```css
::before,
::after {
  position: absolute;
  background: radial-gradient(circle, rgba(...) 0%, transparent 70%);
  border-radius: 50%;
  pointer-events: none;
}
```

### Active Indicator

```css
[data-type="deposit"] {
  background: #00c853;
}
[data-type="withdraw"] {
  background: #ef4444;
}
[data-type="trade"] {
  background: #1565c0;
}
```

---

## 📱 Mobile-First Responsive Pattern

### Typical Mobile Adjustments

```css
@media (max-width: 768px) {
  .grid {
    grid-template-columns: 1fr; /* Single column */
  }

  .card {
    padding: 16px; /* Reduced padding */
  }

  .text-large {
    font-size: 18px; /* Smaller font */
  }
}
```

---

## 🔍 Shadow Scale

| Depth      | CSS                              | Use Case            |
| ---------- | -------------------------------- | ------------------- |
| Subtle     | `0 1px 4px rgba(0,0,0,0.04)`     | Cards (default)     |
| Medium     | `0 4px 16px rgba(0,0,0,0.08)`    | Card hover          |
| Heavy      | `0 20px 60px rgba(0,0,0,0.2)`    | Modals, overlays    |
| Focus Ring | `0 0 0 3px rgba(30,136,229,0.1)` | Input focus         |
| Progress   | `0 0 0 4px rgba(0,200,83,0.2)`   | Active progress dot |

---

## 🚀 Performance Notes

✅ **Optimized**:

- CSS Modules prevent global conflicts
- No CSS-in-JS runtime overhead
- Vite handles CSS minification
- No animation libraries loaded

⚠️ **Considerations**:

- Colors are repeated in some files (could use design tokens)
- No CSS variable usage in component files (only global)
- Some duplication in admin pages (minified inline)

---

## 📌 Most Common Class Name Patterns

| Pattern        | Example         | Purpose           |
| -------------- | --------------- | ----------------- |
| `.card`        | `.card`         | Container wrapper |
| `.header`      | `.header`       | Section header    |
| `.title`       | `.cardTitle`    | Heading text      |
| `.label`       | `.label`        | Form label        |
| `.value`       | `.statValue`    | Numeric display   |
| `.badge`       | `.badge`        | Status indicator  |
| `.btn*`        | `.btnPrimary`   | Button variant    |
| `.icon*`       | `.iconWrap`     | Icon container    |
| `.*Cell`       | `.coinCell`     | Table/grid cell   |
| `.*Row`        | `.progressRow`  | Flex row          |
| `.*Grid`       | `.statsGrid`    | Grid container    |
| `.*Left/Right` | `.heroLeft`     | Section side      |
| `.*Active`     | `.tabBtnActive` | Active state      |

---

## 🎓 Design System Maturity

### Current Level: **Intermediate**

- ✅ Consistent color palette
- ✅ Responsive breakpoints
- ✅ Component-scoped CSS
- ✅ Two clear themes
- ⚠️ Could benefit from shared token system
- ⚠️ Some manual repetition
- ⚠️ No component library documentation

### Next Steps for Improvement:

1. Create `design-tokens.ts` file with all colors, spacing, typography
2. Add CSS utility classes for common patterns
3. Create Storybook for component documentation
4. Implement CSS variables in component files
5. Add animation library for enhanced UX

---

**Quick Tips for Developers**:

- 🎨 Always use `border-radius: 14px` for cards (standard)
- 🟢 Use `#00c853` for primary CTAs
- 🔵 Use `#1565C0` for active/link states
- 📱 Test responsive at 768px, 1200px breakpoints
- ⚡ Use `transition: 0.15s` for hover effects
- 📊 Always add `min-width: 0` on flex children with text
- 🎯 Use `gap` instead of margin for spacing
- ♿ Ensure 3:1 contrast ratio minimum for text

---

**Version**: 1.0  
**Last Updated**: June 2, 2026
