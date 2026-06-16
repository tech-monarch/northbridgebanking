const TELEGRAM_LINK = "https://t.me/northbridgebanking";

export default function AdminAcademy() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div>
        <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#fff" }}>
          Academy Management
        </h1>
        <p style={{ color: "#9ca3af", fontSize: "13px", marginTop: "4px" }}>
          Learning content is hosted on Telegram
        </p>
      </div>

      <div
        style={{
          background: "rgba(34,200,83,0.06)",
          border: "1px solid rgba(34,200,83,0.2)",
          borderRadius: "16px",
          padding: "32px",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>📚</div>
        <h2
          style={{
            fontSize: "20px",
            fontWeight: 700,
            color: "#fff",
            marginBottom: "8px",
          }}
        >
          Academy Lives on Telegram
        </h2>
        <p
          style={{
            color: "#9ca3af",
            fontSize: "14px",
            maxWidth: "400px",
            margin: "0 auto 24px",
          }}
        >
          All courses, lessons, live sessions, and community discussions are
          managed through the official Telegram group.
        </p>
        <a
          href={TELEGRAM_LINK}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "12px 24px",
            borderRadius: "10px",
            background: "#22c55e",
            color: "#000",
            textDecoration: "none",
            fontWeight: 700,
            fontSize: "14px",
          }}
        >
          Open Telegram Group →
        </a>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: "12px",
        }}
      >
        {[
          {
            label: "Post a lesson",
            icon: "✍️",
            desc: "Share content in the Telegram group",
          },
          {
            label: "Live session",
            icon: "🎥",
            desc: "Host a live video or voice chat",
          },
          {
            label: "Announcements",
            icon: "📢",
            desc: "Send updates to all members",
          },
          {
            label: "Q&A session",
            icon: "💬",
            desc: "Answer student questions live",
          },
        ].map((item) => (
          <a
            key={item.label}
            href={TELEGRAM_LINK}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "12px",
              padding: "16px",
              textDecoration: "none",
              display: "block",
            }}
          >
            <div style={{ fontSize: "28px", marginBottom: "8px" }}>
              {item.icon}
            </div>
            <div
              style={{
                fontWeight: 600,
                color: "#e5e7eb",
                fontSize: "14px",
                marginBottom: "4px",
              }}
            >
              {item.label}
            </div>
            <div style={{ fontSize: "12px", color: "#6b7280" }}>
              {item.desc}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
