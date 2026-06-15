# North Bridge Frontend - Complete Styling Architecture Analysis

## Executive Summary

This document provides a comprehensive analysis of the CSS styling architecture in the North Bridge frontend v2 project. The project uses **CSS Modules** for component-scoped styling with a global CSS file for shared design tokens.

---

## 1. PROJECT CONFIGURATION

### Build & Tooling

- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite
- **CSS Strategy**: CSS Modules (.module.css) + Global CSS
- **CSS Preprocessor**: None (Pure CSS)
- **Font**: Inter (loaded via Google Fonts API)
- **Path Alias**: `@/` maps to `./src/`

### Key Configuration Files

**vite.config.ts**:

```typescript
- Plugin: @vitejs/plugin-react
- Path alias: @ → ./src
- No custom CSS plugins (Vite handles CSS modules natively)
```

**tsconfig.json**:

```json
- Target: ES2020
- JSX: react-jsx
- baseUrl: ./src
- Path mapping: @/* → ./src/*
```

---

## 2. GLOBAL DESIGN TOKENS

### Location: `src/index.css`

#### Color Palette (CSS Variables)

**Primary Colors**:

- `--primary`: #00c853 (Bright Green)
- `--primary-dark`: #00a844 (Dark Green)
- `--accent-blue`: #1e88e5 (Blue)
- `--accent-cyan`: #00e5ff (Cyan)
- `--yellow`: #ffc107

**Background Colors**:

- `--bg-dark`: #0a0e1a
- `--bg-dark2`: #0d1224
- `--bg-card`: #111827
- `--bg-card2`: #1a2234

**Text Colors**:

- `--text-white`: #ffffff
- `--text-light`: #b0bec5
- `--text-muted`: #78909c

**Borders & Misc**:

- `--border`: #1e2d45

#### Global Styles Applied

```css
- box-sizing: border-box (all elements)
- font-family: Inter sans-serif
- scroll-behavior: smooth
- base element styling (a, button, ul, img reset)
```

---

## 3. COMPLETE CSS MODULE FILES INVENTORY (43 Files)

### A. DASHBOARD COMPONENTS (6 files)

#### 1. **BalanceHero.module.css**

**Location**: `src/components/dashboard/BalanceHero.module.css`

**Layout Pattern**: Grid-based card (3-column layout)

**Class Names**:

- `.card` - Main container (gradient: #0d2052 → #0a1840 → #071230)
- `.card::before` - Decorative blue bubble overlay (rgba(21,101,192,0.18))
- `.left` - Left column (balance info)
- `.balanceLabel` - Small label "Total Balance"
- `.eyeBtn` - Show/hide balance button
- `.balanceValue` - Large balance number (34px, 800 weight)
- `.balanceSubrow` - Row with USD and badge
- `.usd` - USD text
- `.badge` - Green badge (#00c853)
- `.today` - Date/time indicator
- `.actions` - CTA buttons container
- `.btnDeposit` - Primary green button
- `.btnWithdraw` - Secondary button
- `.center` - Center column (crypto list/icons)
- `.right` - Right column (additional info)

**Styling Patterns**:

- Grid: `grid-template-columns: 280px 1fr 220px`
- Gap: 24px
- Min-height: 180px
- Gradient background with decorative pseudo-elements
- Responsive: Adapts grid at smaller breakpoints

**Color Scheme**: Dark (primary #00c853 green)

---

#### 2. **MarketOverview.module.css**

**Location**: `src/components/dashboard/MarketOverview.module.css`

**Layout Pattern**: Card with table

**Class Names**:

- `.card` - White card container (border: 1px solid #f0f2f5)
- `.header` - Header with title + action button
- `.title` - "Market Overview" (15px, 700 weight)
- `.viewAll` - Link button (blue #1565C0)
- `.table` - HTML table element
- `.coinCell` - Cell with coin icon + names
- `.coinIcon` - Coin avatar
- `.coinNames` - Container for coin name + symbol
- `.coinName` - Coin name (13px, 600 weight)
- `.coinSymbol` - Coin symbol (11px, lighter)
- `.priceCell` - Price display cell
- `.changeCell` - Percentage change cell
- `.changePos` - Green change (color: #00c853)
- `.changeNeg` - Red change (color: #ef4444)

**Styling Patterns**:

- Table hover effects: background: #f9fafb
- Flexbox for cell content alignment
- Shadow on hover
- Transitions: 0.1s on row background

**Color Scheme**: Light (white background #ffffff)

---

#### 3. **PortfolioAllocation.module.css**

**Location**: `src/components/dashboard/PortfolioAllocation.module.css`

**Layout Pattern**: Card with donut chart + legend

**Class Names**:

- `.card` - White card container
- `.header` - Title section
- `.title` - "Portfolio Allocation" (15px, 700 weight)
- `.viewAll` - "View All" link (#1565C0)
- `.body` - Chart + legend container (flexbox column)
- `.donut` - Chart wrapper (centered)
- `.legend` - Legend list container (flexbox column)
- `.legendRow` - Individual legend item
- `.legendLeft` - Icon + label
- `.dot` - Color dot (10px circle)
- `.legendLabel` - Asset name (12px, ellipsis overflow)
- `.legendRight` - Percentage display
- `.legendPct` - Percentage value (12px, 700 weight, right-aligned)

**Styling Patterns**:

- Legend uses `min-width: 0` on parent for text truncation
- Dots are colored based on data
- Responsive legend with flexbox

**Color Scheme**: Light (white background)

---

#### 4. **RecentTransactions.module.css**

**Location**: `src/components/dashboard/RecentTransactions.module.css`

**Layout Pattern**: Card with vertical list

**Class Names**:

- `.card` - White card container
- `.header` - Title + "View All" link
- `.title` - "Recent Transactions"
- `.list` - Transaction list (flexbox column)
- `.item` - Individual transaction item
- `.iconWrap` - Circular icon container (36px)
  - `[data-type="deposit"]` - Green (#00c853)
  - `[data-type="withdraw"]` - Red (#ef4444)
  - `[data-type="trade"]` - Blue (#1565C0)
- `.info` - Transaction details (type, subtitle)
- `.txType` - Transaction type (13px, 700 weight)
- `.txSub` - Transaction details/address (11px)
- `.txDate` - Date/time (10.5px)
- `.txAmount` - Amount displayed (13px, 700 weight)
- `.amountIn` - Green amount color
- `.amountOut` - Red amount color

**Styling Patterns**:

- Type-specific styling via data attributes
- Flexbox row layout with icon + info + amount
- Border separators between items

**Color Scheme**: Light (white background)

---

#### 5. **StatsRow.module.css**

**Location**: `src/components/dashboard/StatsRow.module.css`

**Layout Pattern**: 4-column grid of stat cards

**Class Names**:

- `.row` - Grid container (4 columns, 16px gap)
- `.card` - Individual stat card
- `.iconWrap` - Icon container (48px, light blue background #f0f4ff)
- `.info` - Stat label + value container
- `.label` - Stat name (12px, gray #6b7280)
- `.value` - Large stat value (18px, 800 weight)
- `.sub` - Change indicator row
- `.usd` - USD suffix (11.5px)
- `.change` - Change value (11.5px, 600 weight)
- `.pos` - Green color (#00c853)
- `.neg` - Red color (#ef4444)

**Styling Patterns**:

- Hover effect: box-shadow 0 4px 16px rgba(0,0,0,0.08)
- Grid responsive: 4 col → 2 col (1200px) → 1 col (600px)
- Card transitions: 0.2s

**Color Scheme**: Light (white background)

---

#### 6. **TradingCTA.module.css**

**Location**: `src/components/dashboard/TradingCTA.module.css`

**Layout Pattern**: Banner with features + CTA button

**Class Names**:

- `.banner` - Main banner (gradient: #f0f7ff → #e8f0fe)
- `.left` - Text section (min-width: 180px)
- `.heading` - "Start Trading Now" (17px, 800 weight)
- `.sub` - Description text (12px)
- `.phoneIllustration` - Illustration placeholder
- `.features` - Features list (flexbox, wrap)
- `.feature` - Individual feature item
- `.featureIcon` - Feature icon (36px, light blue bg #dbeafe)
- `.featureText` - Feature title + description
- `.featureTitle` - Feature name (12.5px, 700 weight)
- `.featureSub` - Feature description (11px)
- `.ctaBtn` - "Start Trading" button (green #00c853, hover: #00a844)

**Styling Patterns**:

- Feature grid with flexbox wrap
- Icon backgrounds use light color variants
- Button transitions: 0.15s background
- Responsive at 1100px breakpoint

**Color Scheme**: Light (blue gradient background)

---

### B. LAYOUT COMPONENTS (2 files)

#### 7. **DashboardLayout.module.css**

**Location**: `src/layouts/DashboardLayout.module.css`

**Layout Pattern**: Sidebar + Main area (flexbox)

**Class Names - Sidebar**:

- `.sidebar` - Dark sidebar (width: 220px, bg: #0a1628)
- `.sidebarInner` - Scrollable container (hidden scrollbar)
- `.logo` - Logo section (padding: 22px 20px)
- `.logoIcon` - Logo icon
- `.logoText` - Logo text
- `.logoCoin` - White text
- `.logoBridge` - Cyan text (#4fc3f7)
- `.nav` - Navigation list (flexbox column, gap: 2px)
- `.navItem` - Nav item button/link
- `.navItem:hover` - Hover state (background: rgba(255,255,255,0.06))
- `.navItemActive` - Active state (bg: #1565C0, color: white)
- `.navDivider` - Divider line (1px, rgba(255,255,255,0.06))
- `.inviteCard` - Referral card (gradient: #1a3a6e → #0d2552)
- `.inviteBtn` - Invite button (semi-transparent)

**Class Names - Main Area**:

- `.layout` - Root flex container (100vh height)
- `.main` - Main content area (flex: 1)
- `.content` - Scrollable content
- `.header` - Top bar with user menu
- `.topBar` - Header area styling

**Styling Patterns**:

- Dark theme (blue-black palette)
- Smooth transitions: 0.15s
- Sidebar z-index: 100
- Scrollbar hidden with scrollbar-width: none + webkit rule
- Logo uses two-color styling

**Color Scheme**: Dark (bg: #0a1628, text: #8899aa → #dde8f0)

---

#### 8. **AdminLayout.module.css**

**Location**: `src/pages/admin/components/AdminLayout.module.css`

**Layout Pattern**: Similar to DashboardLayout but for admin

**Class Names**:

- `.layout` - Root flex (100vh)
- `.sidebar` - Admin sidebar (width: 228px, bg: #0a1628)
- `.logo` - Logo section with admin badge
- `.adminBadge` - "ADMIN" label (cyan, small)
- `.nav` - Admin nav items
- `.navItem` - Nav button (slightly smaller text 13.5px)
- `.navItemActive` - Active nav state (blue bg #1565C0)
- `.main` - Main admin content area
- (Same header/content structure as DashboardLayout)

**Styling Patterns**:

- Identical to DashboardLayout with admin branding
- Admin badge uses cyan color (#4fc3f7)

**Color Scheme**: Dark admin theme

---

### C. AUTH PAGES (2 files)

#### 9. **AuthLayout.module.css**

**Location**: `src/pages/auth/AuthLayout.module.css`

**Layout Pattern**: Two-column grid (branding + form)

**Class Names**:

- `.root` - Root grid (2 columns at 1:1 ratio)
- `.panel` - Left branding panel (dark gradient bg)
- `.panel::before` - Blue radial gradient bubble
- `.panel::after` - Green radial gradient bubble
- `.panelInner` - Content container (flexbox column)
- `.logo` - Logo at top
- `.panelContent` - Center content (flex: 1, center aligned)
- `.panelTitle` - Main title (36px, 800 weight, white)
- `.panelSub` - Description (15px, light gray #90a4ae)
- `.perks` - Features list
- `.perk` - Individual perk item
- `.perkCheck` - Check icon circle (blue bg with transparency)
- `.panelFooter` - Footer text (12px)
- `.form` - Right form panel (white bg)
- `.formInner` - Form content wrapper (max-width: 420px)

**Styling Patterns**:

- Gradient background with pseudo-element decorations
- Z-index layering for pseudo-elements
- Responsive: Single column at 900px
- Panel hidden on mobile

**Color Scheme**: Dark panel (gradient) + Light form

**Breakpoints**:

- 900px: Stack to single column, hide panel

---

#### 10. **auth.module.css**

**Location**: `src/pages/auth/auth.module.css`

**Layout Pattern**: Shared form styling (LoginPage, RegisterPage, ForgotPasswordPage)

**Class Names**:

- `.backLink` - Back navigation link (13px, gray)
- `.header` - Form header section
- `.title` - Page title (26px, 800 weight)
- `.subtitle` - Description text (14px)
- `.form` - Form container (flexbox column, gap: 20px)
- `.row` - Multi-column form row (2 columns, 16px gap)
- `.field` - Individual form field
- `.label` - Field label (13px, 600 weight)
- `.inputWrap` - Input container (relative for icon positioning)
- `.input` - Text input (padding: 11px 14px, border: 1.5px #e5e7eb)
- `.input:focus` - Focus state (border: #1e88e5, blue shadow)
- `.inputIcon` - Input suffix icon
- `.inputWithIcon` - Input with right icon (padding-right: 40px)
- `.extras` - Checkbox + forgot link row
- `.checkLabel` - Checkbox label
- `.forgotLink` - "Forgot Password" link
- `.submitBtn` - Submit button

**Styling Patterns**:

- Focus states with 3px blue shadow
- Input placeholders styled (gray #9ca3af)
- Checkbox with accent color: #1e88e5
- Transitions: 0.2s on border and shadow

**Color Scheme**: Light form styling

---

### D. PAGE COMPONENTS (Main Pages - 10+ files)

#### 11. **DashboardHome.module.css**

**Location**: `src/pages/home/DashboardHome.module.css`

**Layout Pattern**: Grid layout for dashboard

**Class Names**:

- `.page` - Page wrapper (max-width: 1400px)
- `.midGrid` - 3-column grid (1fr, minmax(260px, 320px), minmax(280px, 340px))
- `.marketCol` - Market column (min-width: 0)
- `.portfolioCol` - Portfolio column
- `.txCol` - Transactions column

**Styling Patterns**:

- Responsive grid: 3 col → 2 col (1200px) → 1 col (768px)
- Transactions span full width on tablet
- Min-width: 0 on columns for text truncation

**Responsive Breakpoints**:

- 1200px: 2-column layout, tx column spans full width
- 768px: 1-column layout

---

#### 12. **DepositPage.module.css**

**Location**: `src/pages/deposit/DepositPage.module.css`

**Layout Pattern**: Side-by-side (form + sticky widget)

**Class Names**:

- `.pageLayout` - Main flex row (gap: 24px)
- `.widgetSide` - Sticky widget sidebar (flex: 1, sticky, min-width: 320px)
- `.container` - Form container (max-width: 680px, flex: 0 0 680px)
- `.header` - Page title section
- `.progressRow` - Progress indicator
- `.progressStep` - Individual step
- `.progressDot` - Step dot (30px, circle)
- `.dotActive` - Active step (green bg #00c853)
- `.dotDone` - Completed step (light green)
- `.progressLabel` - Step label
- `.progressLine` - Step connector line

**Styling Patterns**:

- Sticky positioning (top: 24px)
- Two-column layout with specific widths
- Progress dots with animations
- Dark widget background (#111827)

**Color Scheme**: Light form + Dark widget

---

#### 13. **WithdrawPage.module.css**

**Location**: `src/pages/withdraw/WithdrawPage.module.css`

**Layout Pattern**: Identical to DepositPage

**Class Names**: Same structure as DepositPage

**Styling Patterns**: Sticky widget + form layout

---

#### 14. **MarketsPage.module.css**

**Location**: `src/pages/markets/MarketsPage.module.css`

**Layout Pattern**: Simple flex column

**Class Names**:

- `.container` - Page container (flexbox column, gap: 24px)
- `.header` - Page title
- `.widgetWrap` - Trading widget container (min-height: 80px, dark bg)
- `.divider` - Separator line
- `.quotesWidget` - TradingView widget (height: 700px, border-radius: 14px)

**Styling Patterns**:

- Dark widget background (#000000, border: rgba(255,255,255,0.07))
- Override iframe dimensions (100% width/height)

---

#### 15. **TransactionsPage.module.css**

**Location**: `src/pages/transactions/TransactionsPage.module.css`

**Layout Pattern**: Full-width page with stats grid + filters + table

**Class Names**:

- `.page` - Page wrapper (max-width: 1200px)
- `.statsGrid` - 4-column stats grid (16px gap)
- `.statCard` - Individual stat card (flexbox row)
- `.statIcon` - Icon wrapper (48px)
- `.statIconBlue` - Blue icon (bg: #f0f4ff, color: #1565C0)
- `.statIconGreen` - Green icon
- `.statIconRed` - Red icon
- `.statIconYellow` - Yellow icon
- `.statLabel` - Stat label (12px, gray)
- `.statValue` - Stat number (22px, 800 weight)
- `.card` - Main card container
- `.filtersRow` - Filter controls (flexbox, space-between)
- `.typeFilters` - Transaction type filters (gap: 6px)
- `.filterBtn` - Filter button (padding: 7px 16px)
- `.filterBtnActive` - Active filter (blue bg #1565C0)
- `.rightFilters` - Additional filters (search, date range)

**Styling Patterns**:

- Stat cards with color-coded icons
- Filter buttons with active state
- Responsive stats grid: 4 col → 2 col (900px)

**Responsive Breakpoints**:

- 900px: Stats grid to 2 columns

---

#### 16. **WalletPage.module.css**

**Location**: `src/pages/wallet/WalletPage.module.css`

**Layout Pattern**: Header + Balance card + Content

**Class Names**:

- `.container` - Page container (flexbox column, gap: 32px)
- `.header` - Header with title + button
- `.headerLeft` - Title section
- `.btnCreateWallet` - Green action button (green #00c853, shadow, hover effect)
- `.totalBalanceCard` - Large balance display (gradient bg)
- `.balanceGlow` - Decorative radial gradient
- `.totalBalanceLeft` - Balance text container
- `.balanceLabelTop` - "Total Balance" label
- `.balanceValueBig` - Large balance number
- `.balanceSubtext` - Additional text

**Styling Patterns**:

- Button hover: translateY(-2px), shadow increase
- Gradient background with bubble decoration
- Large typography for balance

**Color Scheme**: Light header + Dark gradient balance card

---

#### 17. **SettingsPage.module.css**

**Location**: `src/pages/settings/SettingsPage.module.css`

**Layout Pattern**: Tab sidebar + Content panel

**Class Names**:

- `.page` - Page wrapper (max-width: 900px)
- `.layout` - Flex row (gap: 24px)
- `.tabSidebar` - Vertical tab navigation (width: 200px, card styling)
- `.tabBtn` - Tab button (padding: 10px 12px)
- `.tabBtn:hover` - Hover (bg: #f5f6fa)
- `.tabBtnActive` - Active tab (blue bg #1565C0)
- `.panel` - Content panel (flex: 1)
- `.card` - Content card
- `.cardTitle` - Card title (15px, 700 weight)
- `.cardSubtitle` - Card subtitle (13px, gray)
- `.profileHeader` - User profile section
- `.avatarWrap` - Avatar container (relative)
- `.avatar` - Avatar image (72px circle)
- `.avatarEditBtn` - Edit button on avatar

**Styling Patterns**:

- Tab sidebar with card styling
- Responsive two-column layout
- Profile section with avatar

---

#### 18. **AcademyPage.module.css**

**Location**: `src/pages/academy/AcademyPage.module.css`

**Layout Pattern**: Hero + Content

**Class Names**:

- `.page` - Page wrapper (max-width: 1100px)
- `.hero` - Hero banner (gradient: #0d2052 → #0a1840 → #071230)
- `.heroBubble1` - Blue bubble (top right)
- `.heroBubble2` - Green bubble (bottom right)
- `.heroInner` - Hero content (flexbox, space-between)
- `.heroLeft` - Text content
- `.heroBadge` - "Get Started" badge (green, semi-transparent)
- `.heroTitle` - "Start Learning" title (32px, 800 weight, white)
- `.heroDesc` - Description (15px, light text)
- `.heroRight` - Buttons section (flexbox column)
- `.telegramBtn` - Telegram link button (bg: #0088cc)
- `.startBtn` - Primary green button

**Styling Patterns**:

- Dark gradient background with bubbles
- Large hero typography
- Button styling with hover effects

**Color Scheme**: Dark hero + Light content

---

#### 19. **SupportPage.module.css**

(Presumed to exist based on workspace structure)

---

#### 20. **AdminOverview.module.css**

**Location**: `src/pages/admin/pages/AdminOverview.module.css`

**Layout Pattern**: KPI grid + Cards

**Class Names**:

- `.page` - Page wrapper (flexbox column, gap: 20px, max-width: 1400px)
- `.topRow` - Header with greeting + period tabs
- `.greeting` - "Admin Overview" (22px, 800 weight)
- `.periodTabs` - Period selector tabs (Day/Week/Month)
- `.periodBtn` - Period button (padding: 7px 16px)
- `.periodBtnActive` - Active period (blue bg)
- `.kpiGrid` - 3-column KPI grid (16px gap)
- `.kpiCard` - Individual KPI card (card styling)
- `.kpiHeader` - Icon + badge header
- `.kpiIcon` - Icon wrapper (44px)
- `.kpiIconBlue` - Blue variant (bg: #f0f4ff, color: #1565C0)
- `.kpiIconGreen` - Green variant
- `.kpiIconRed` - Red variant
- `.kpiIconYellow` - Yellow variant
- `.kpiValue` - Large KPI value (28px, 800 weight)
- `.kpiLabel` - KPI label (12.5px, gray)
- `.twoCol` - 2-column card grid
- `.card` - Content card
- `.cardTitle` - Card title

**Styling Patterns**:

- Color-coded icons for different metrics
- KPI badges with status colors
- Period selector with active state
- Responsive grid

---

#### 21. **AdminMarkets.module.css**

**Location**: `src/pages/admin/pages/AdminMarkets.module.css`

**Layout Pattern**: Compact minified styles

**Class Names**:

- `.page` - Page wrapper
- `.statsGrid` - 4-column stats grid
- `.card` - Content card
- `.filtersRow` - Filter controls (search + sort)
- `.searchBox` - Search input (flexbox, bg: #f5f6fa)
- `.searchInput` - Input field
- `.tableWrap` - Scrollable table wrapper
- `.table` - Data table
- `.coinCell` - Coin name + symbol cell
- `.priceCell` - Price cell (clickable, shows edit hint)
- `.changeVal` - Price change value
- `.toggle` - Toggle switch (width: 40px, height: 22px)
- `.toggleOn` - On state (green #00c853)
- `.toggleOff` - Off state (gray)
- `.toggleKnob` - Slider knob

**Styling Patterns**:

- Inline/minified CSS for tables
- Toggle switch animation
- Modal overlay for mini modals
- Color-coded status badges

**Color Scheme**: Light table + Various status colors

---

#### 22-31. Additional Admin Pages

Files include: AdminDeposits, AdminWithdrawals, AdminKyc, AdminUsers, AdminTransactions, AdminSupport, AdminSettings, AdminWallets, AdminAcademy

**Common Patterns** across all admin pages:

- `.overlay` - Fixed modal background (rgba(0,0,0,0.4))
- `.miniModal` - Modal dialog (max-width: 340px)
- `.btnPrimary` - Blue button (bg: #1565C0)
- `.btnCancel` - Secondary button (gray)
- `.input` - Form input field
- `.table` - Data table styling
- `.statusBadge` - Status indicator
  - `.statusVerified` - Green (dcfce7, #15803d)
  - `.statusPending` - Yellow (fef3c7, #d97706)
  - `.statusSuspended` - Red (fee2e2, #dc2626)

---

## 4. REUSABLE CSS PATTERNS & DESIGN TOKENS

### Typography Scale

```css
Large headings:     32px, 800 weight (Hero titles)
Page titles:        26px, 800 weight
Section titles:     22px, 800 weight
Card titles:        15px, 700 weight
Body text:          13-14px, 500-600 weight
Small labels:       11-12px, 500-600 weight
```

### Color Palette (Consistent Across App)

```css
Primary Green:      #00c853 (CTA, success, positive)
Primary Dark Green: #00a844 (Hover, active)
Accent Blue:        #1e88e5 / #1565C0 (Links, active states)
Accent Cyan:        #00e5ff (Branding, accents)
Accent Red:         #ef4444 (Negative, losses, errors)
Accent Yellow:      #ffc107 (Warnings, caution)

Background White:   #ffffff (Main content areas)
Background Dark:    #0a0e1a, #0d1224 (Sidebar, dark sections)
Background Card:    #111827, #1a2234 (Card backgrounds)

Text Primary:       #111827 (Light theme)
Text White:         #ffffff (Dark theme)
Text Secondary:     #6b7280 (Gray)
Text Muted:         #9ca3af (Light gray)
```

### Border Radius Scale

```css
14px - Cards, buttons, input fields (most common)
12px - Medium elements
10px - Smaller buttons, icons
8px - Form inputs, small buttons
6px - Badges, tags
20px - Pills (full rounded)
50% - Circles
```

### Spacing Scale (Gap/Padding)

```css
4px   - Minimal spacing
6px   - Tight spacing
8px   - Standard small gap
10px  - Standard medium gap
12px  - Standard gap
16px  - Common gap between elements
20px  - Large gap
24px  - Section separator
28px  - Card padding (often)
32px  - Page section gap
40px  - Large section gap
```

### Shadow Scale

```css
0 1px 4px rgba(0,0,0,0.04)      - Card shadow (subtle)
0 4px 16px rgba(0,0,0,0.08)     - Hover shadow (cards)
0 20px 60px rgba(0,0,0,0.2)     - Modal shadow (heavy)
0 0 0 3px rgba(30,136,229,0.1)  - Focus ring (blue)
0 0 0 4px rgba(0,200,83,0.2)    - Active progress dot
```

### Transitions

```css
0.1s - Simple state changes (hover, background)
0.15s - Button hover, color changes
0.2s - More complex animations
0.3s - Sidebar animations, layout shifts
```

### Flexbox Patterns

```css
/* Row layouts */
gap: 12px (buttons, items)
gap: 16px (sections)
gap: 24px (major sections)

/* Column layouts */
gap: 8px (tight form fields)
gap: 12px (list items)
gap: 20px (card sections)
```

### Grid Patterns

```css
Stats row:        grid-template-columns: repeat(4, 1fr)  → 2 col → 1 col
Dashboard grid:   grid-template-columns: 1fr minmax(260px, 320px) minmax(280px, 340px)
Admin KPI:        grid-template-columns: repeat(3, 1fr)
```

### Responsive Breakpoints

```css
1200px - Tablet/Medium: Reduce columns, simplify layout
900px  - Medium Mobile: Further column reduction
768px  - Mobile: Single column layouts
600px  - Small Mobile: Minimum spacing adjustments
```

### Button Styles

```css
Primary Green Button:
  - bg: #00c853
  - color: white
  - padding: 11-14px 20-24px
  - border-radius: 10-12px
  - hover: bg #00a844
  - transition: 0.15s

Secondary Button:
  - bg: transparent or light
  - border: 1px solid
  - hover: background change

Link Button:
  - color: #1565C0
  - hover: underline
```

### Form Input Styles

```css
Input Base:
  - padding: 11px 14px
  - border: 1.5px solid #e5e7eb
  - border-radius: 8px
  - font-size: 14px
  - background: #f9fafb

Input Focus:
  - border-color: #1e88e5
  - background: white
  - box-shadow: 0 0 0 3px rgba(30,136,229,0.1)
```

### Card Styles

```css
White Card (Light Theme):
  - background: white
  - border: 1px solid #f0f2f5
  - border-radius: 14px
  - padding: 20px
  - box-shadow: 0 1px 4px rgba(0,0,0,0.04)

Dark Card (Dashboard):
  - background: #111827 or gradient
  - border: 1px solid rgba(255,255,255,0.07-0.08)
  - border-radius: 14-18px
```

---

## 5. LAYOUT PATTERNS

### A. Dashboard Layout Pattern

```
Sidebar (220px, dark) | Main Area (flex: 1)
                      ├── Top Bar (header)
                      └── Content (scrollable)
```

### B. Dashboard Home Pattern

```
Hero Balance Card (full width)
↓
Stats Row (4 col grid)
↓
3-column Grid:
├─ Market Overview (1fr)
├─ Portfolio Allocation (260-320px)
└─ Recent Transactions (280-340px)
```

### C. Auth Layout Pattern

```
Left Panel (dark, branding) | Right Panel (form)
50% / 50% at full width
Stacks to single column on mobile
```

### D. Deposit/Withdraw Pattern

```
Left: Form Container (680px fixed width)
Right: Sticky Widget (320px+ flex)
```

### E. Sticky Widget Pattern

```
position: sticky
top: 24px
height: calc(100vh - 48px)
min-height: 500px
```

### F. Admin Dashboard Pattern

```
Period Selector (Day/Week/Month)
↓
KPI Grid (3 columns)
↓
Two-column card grid
↓
Data tables with filters
```

---

## 6. TWO-THEME ARCHITECTURE

### Light Theme (Content Pages)

- **Background**: White (#ffffff)
- **Cards**: White with light borders (#f0f2f5)
- **Text**: Dark (#111827)
- **Accents**: Blue (#1565C0), Green (#00c853)
- **Pages**: Markets, Dashboard Home, Settings, Support, etc.

### Dark Theme (Navigation Areas)

- **Background**: Dark blue-black (#0a1628, #0d1224)
- **Cards**: Dark gray (#111827) or gradient
- **Text**: White with opacity
- **Accents**: Cyan (#4fc3f7), Green (#00c853), Blue (#1e88e5)
- **Pages**: Sidebar, Auth panels, Deposit/Withdraw widgets

---

## 7. CSS PREPROCESSING & FUTURE CONSIDERATIONS

### Current Setup

- **No Preprocessor**: Uses pure CSS
- **Native CSS Modules**: Vite handles scoping automatically
- **No Build-time Optimization**: CSS not minified further by custom processors

### File Organization

```
src/
├── index.css (global tokens + resets)
├── components/
│   └── dashboard/*.module.css (component styles)
├── layouts/
│   └── *.module.css (layout styles)
└── pages/
    ├── auth/*.module.css
    ├── admin/*.module.css
    └── [other pages]/*.module.css
```

### Naming Convention

- **CSS Module files**: `.module.css`
- **Class names**: camelCase (`.cardTitle`, `.iconWrap`, `.statusBadge`)
- **Data attributes**: Lower case (` [data-type="deposit"]`)
- **Pseudo-selectors**: As needed (`.navItem:hover`, `.card::before`)

---

## 8. SUMMARY OF KEY FINDINGS

### Strengths

1. ✅ **Consistent Design System**: Well-defined color palette, spacing, and typography
2. ✅ **Responsive Design**: Multiple breakpoints for mobile/tablet/desktop
3. ✅ **Scoped Styling**: CSS Modules prevent global conflicts
4. ✅ **Two Clear Themes**: Dark sidebar + Light content areas well separated
5. ✅ **Reusable Patterns**: Common component styles (cards, buttons, badges)
6. ✅ **Performance**: Pure CSS, no runtime overhead

### Areas for Enhancement

1. ⚠️ **No Design Token File**: Consider creating a shared token object (JS/JSON)
2. ⚠️ **Some Color Duplication**: Colors manually repeated instead of derived
3. ⚠️ **No CSS Framework**: Some utility classes could reduce repetition
4. ⚠️ **No Animation Library**: Animations are minimal CSS-based

### Recommendations

1. **Create a design-tokens.ts**: Export colors, spacing, typography as TypeScript constants
2. **Consider CSS-in-JS for dynamic styles**: For runtime theme switching
3. **Add CSS utilities**: For common patterns (text truncation, flexbox helpers)
4. **Document component props**: Map props to CSS classes for consistency
5. **Create Storybook**: For component documentation and design system

---

## 9. COMPLETE FILE LISTING (43 CSS Module Files)

### Dashboard Components (6)

1. `src/components/dashboard/BalanceHero.module.css`
2. `src/components/dashboard/MarketOverview.module.css`
3. `src/components/dashboard/PortfolioAllocation.module.css`
4. `src/components/dashboard/RecentTransactions.module.css`
5. `src/components/dashboard/StatsRow.module.css`
6. `src/components/dashboard/TradingCTA.module.css`

### Layout Components (2)

7. `src/layouts/DashboardLayout.module.css`
8. `src/pages/admin/components/AdminLayout.module.css`

### Auth Pages (2)

9. `src/pages/auth/AuthLayout.module.css`
10. `src/pages/auth/auth.module.css`

### Main Pages (6)

11. `src/pages/home/DashboardHome.module.css`
12. `src/pages/deposit/DepositPage.module.css`
13. `src/pages/withdraw/WithdrawPage.module.css`
14. `src/pages/markets/MarketsPage.module.css`
15. `src/pages/transactions/TransactionsPage.module.css`
16. `src/pages/wallet/WalletPage.module.css`

### Utility Pages (3)

17. `src/pages/settings/SettingsPage.module.css`
18. `src/pages/academy/AcademyPage.module.css`
19. `src/pages/support/SupportPage.module.css`

### Admin Dashboard Pages (11+)

20. `src/pages/admin/pages/AdminOverview.module.css`
21. `src/pages/admin/pages/AdminMarkets.module.css`
22. `src/pages/admin/pages/AdminDeposits.module.css`
23. `src/pages/admin/pages/AdminWithdrawals.module.css`
24. `src/pages/admin/pages/AdminKyc.module.css`
25. `src/pages/admin/pages/AdminUsers.module.css`
26. `src/pages/admin/pages/AdminTransactions.module.css`
27. `src/pages/admin/pages/AdminSupport.module.css`
28. `src/pages/admin/pages/AdminSettings.module.css`
29. `src/pages/admin/pages/AdminWallets.module.css`
30. `src/pages/admin/pages/AdminAcademy.module.css`
31. Additional admin pages as needed

---

## Appendix: Quick Reference

### Primary Colors Quick Reference

```
✅ Success/Primary: #00c853 (use for CTAs, positive states)
🔵 Link/Active: #1565C0 (use for links, active tabs)
🔴 Error/Negative: #ef4444 (use for errors, losses)
🟡 Warning: #ffc107 (use for warnings)
🔷 Branding: #4fc3f7 (cyan, admin accents)
```

### Most Common Class Names Pattern

```
.card           → Card container wrapper
.header         → Section header with title + action
.title          → Section/Card title
.label          → Form label or description text
.value          → Large numeric value display
.badge          → Status or tag indicator
.btn*           → Button variation (btnPrimary, btnSecondary)
.icon*          → Icon container/wrapper
.*Cell          → Table/Grid cell container
.*Row           → Row container (flexbox)
```

---

**Document Version**: 1.0  
**Last Updated**: June 2, 2026  
**Analysis Scope**: Complete North Bridge Frontend v2 Styling Architecture
