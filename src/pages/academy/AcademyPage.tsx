import styles from "./AcademyPage.module.css";

const TELEGRAM_LINK = "https://t.me/northbridgebanking";

const COURSES = [
  {
    title: "Crypto Basics",
    desc: "Learn the fundamentals of blockchain, Bitcoin, and digital assets.",
    level: "Beginner",
    lessons: 12,
    color: "#1565C0",
    icon: "₿",
  },
  {
    title: "Trading Strategies",
    desc: "Master technical analysis, chart patterns, and risk management.",
    level: "Intermediate",
    lessons: 18,
    color: "#22c853",
    icon: "📈",
  },
  {
    title: "DeFi & Web3",
    desc: "Explore decentralized finance, smart contracts, and yield farming.",
    level: "Advanced",
    lessons: 15,
    color: "#9945ff",
    icon: "⬡",
  },
  {
    title: "Wallet Security",
    desc: "Protect your assets with best practices for crypto security.",
    level: "Beginner",
    lessons: 8,
    color: "#f59e0b",
    icon: "🔒",
  },
  {
    title: "Portfolio Management",
    desc: "Build and rebalance a diversified crypto portfolio.",
    level: "Intermediate",
    lessons: 10,
    color: "#ef4444",
    icon: "📊",
  },
  {
    title: "Tax & Compliance",
    desc: "Understand crypto tax implications and reporting requirements.",
    level: "Intermediate",
    lessons: 7,
    color: "#26a17b",
    icon: "📋",
  },
];

const LEVEL_COLORS = {
  Beginner: "#22c55e",
  Intermediate: "#f59e0b",
  Advanced: "#ef4444",
};

export default function AcademyPage() {
  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>🎓 North Bridge Academy</div>
          <h1 className={styles.heroTitle}>Master Crypto Investing</h1>
          <p className={styles.heroSubtitle}>
            Join thousands of students learning blockchain, trading, and DeFi in
            our Telegram community.
          </p>
          <a
            href={TELEGRAM_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.heroBtn}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
            Join Academy on Telegram
          </a>
        </div>
        <div className={styles.heroStats}>
          {[
            { value: "10,000+", label: "Students" },
            { value: "70+", label: "Lessons" },
            { value: "Free", label: "Access" },
          ].map((s) => (
            <div key={s.label} className={styles.heroStat}>
              <div className={styles.heroStatValue}>{s.value}</div>
              <div className={styles.heroStatLabel}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.coursesSection}>
        <h2 className={styles.sectionTitle}>Course Library</h2>
        <p className={styles.sectionSubtitle}>
          All courses are available free in our Telegram community
        </p>
        <div className={styles.courseGrid}>
          {COURSES.map((course) => (
            <div key={course.title} className={styles.courseCard}>
              <div
                className={styles.courseIconWrap}
                style={{ background: `${course.color}18`, color: course.color }}
              >
                <span style={{ fontSize: "24px" }}>{course.icon}</span>
              </div>
              <div className={styles.courseHeader}>
                <h3 className={styles.courseTitle}>{course.title}</h3>
                <span
                  className={styles.levelBadge}
                  style={{
                    color:
                      LEVEL_COLORS[course.level as keyof typeof LEVEL_COLORS],
                    background: `${LEVEL_COLORS[course.level as keyof typeof LEVEL_COLORS]}18`,
                  }}
                >
                  {course.level}
                </span>
              </div>
              <p className={styles.courseDesc}>{course.desc}</p>
              <div className={styles.courseMeta}>
                <span>{course.lessons} lessons</span>
                <span>·</span>
                <span>Free</span>
              </div>
              <a
                href={TELEGRAM_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.courseBtn}
                style={{
                  borderColor: `${course.color}40`,
                  color: course.color,
                }}
              >
                Access on Telegram →
              </a>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.ctaBanner}>
        <div className={styles.ctaContent}>
          <h2 className={styles.ctaTitle}>Ready to start learning?</h2>
          <p className={styles.ctaSubtitle}>
            Join our Telegram group for live sessions, signals, and community
            support.
          </p>
          <a
            href={TELEGRAM_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.heroBtn}
          >
            Join Free on Telegram →
          </a>
        </div>
      </div>
    </div>
  );
}
