import BalanceHero from '@/components/dashboard/BalanceHero';
import StatsRow from '@/components/dashboard/StatsRow';
import MarketOverview from '@/components/dashboard/MarketOverview';
import PortfolioAllocation from '@/components/dashboard/PortfolioAllocation';
import RecentTransactions from '@/components/dashboard/RecentTransactions';
import TradingCTA from '@/components/dashboard/TradingCTA';
import styles from './DashboardHome.module.css';

export default function DashboardHome() {
  return (
    <div className={styles.page}>
      {/* Balance hero */}
      <BalanceHero />

      {/* Stats row */}
      <StatsRow />

      {/* Middle section: market + portfolio + transactions */}
      <div className={styles.midGrid}>
        <div className={styles.marketCol}>
          <MarketOverview />
        </div>
        <div className={styles.portfolioCol}>
          <PortfolioAllocation />
        </div>
        <div className={styles.txCol}>
          <RecentTransactions />
        </div>
      </div>

      {/* Trading CTA */}
      <TradingCTA />
    </div>
  );
}
