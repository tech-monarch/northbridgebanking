import { useState, useEffect, useCallback } from "react";
import api from "@/services/api";

interface Ticket {
  id: number;
  subject: string;
  message: string;
  status: string;
  created_at: string;
  user?: { name: string; email: string };
  reply?: string;
}

const TELEGRAM_LINK = "https://t.me/northbridgebanking";

export default function AdminSupport() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Ticket | null>(null);
  const [reply, setReply] = useState("");
  const [replyLoading, setReplyLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchTickets = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter !== "all") params.set("status", statusFilter);
    api
      .get<{ data: Ticket[] }>(`/admin/support/tickets?${params}`)
      .then((res) => {
        setTickets(res.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [statusFilter]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const sendReply = async () => {
    if (!selected || !reply.trim()) return;
    setReplyLoading(true);
    try {
      const res: any = await api.post(
        `/admin/support/tickets/${selected.id}/reply`,
        { reply },
      );
      setMsg(res.message || "Reply sent");
      setReply("");
      fetchTickets();
      setSelected(null);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Failed");
    } finally {
      setReplyLoading(false);
    }
  };

  const closeTicket = async (id: number) => {
    try {
      await api.post(`/admin/support/tickets/${id}/close`);
      fetchTickets();
    } catch {}
  };

  const inputStyle = {
    width: "100%",
    padding: "10px 12px",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "8px",
    color: "#fff",
    fontSize: "13px",
    boxSizing: "border-box" as const,
    outline: "none",
  };
  const statusColors: Record<string, string> = {
    open: "#22c55e",
    closed: "#6b7280",
    pending: "#f59e0b",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#fff" }}>
            Support Tickets
          </h1>
          <p style={{ color: "#9ca3af", fontSize: "13px", marginTop: "4px" }}>
            {tickets.length} tickets
          </p>
        </div>
        <a
          href={TELEGRAM_LINK}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            padding: "8px 16px",
            borderRadius: "8px",
            background: "rgba(34,200,83,0.15)",
            color: "#22c55e",
            border: "1px solid rgba(34,200,83,0.3)",
            textDecoration: "none",
            fontSize: "13px",
          }}
        >
          Community Telegram →
        </a>
      </div>

      {msg && (
        <div
          style={{
            padding: "10px 14px",
            borderRadius: "8px",
            background: "rgba(34,200,83,0.1)",
            color: "#22c55e",
            fontSize: "13px",
          }}
        >
          {msg}
        </div>
      )}

      <div style={{ display: "flex", gap: "4px", marginBottom: "4px" }}>
        {["all", "open", "pending", "closed"].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            style={{
              padding: "6px 14px",
              borderRadius: "6px",
              border: "none",
              cursor: "pointer",
              fontSize: "12px",
              background:
                statusFilter === s ? "#1565C0" : "rgba(255,255,255,0.04)",
              color: statusFilter === s ? "#fff" : "#9ca3af",
            }}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ padding: "40px", textAlign: "center", color: "#9ca3af" }}>
          Loading…
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {tickets.length === 0 ? (
            <div
              style={{
                padding: "40px",
                textAlign: "center",
                color: "#9ca3af",
                background: "rgba(255,255,255,0.02)",
                borderRadius: "12px",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              No {statusFilter} tickets.
            </div>
          ) : (
            tickets.map((ticket) => {
              const sc = statusColors[ticket.status] || "#9ca3af";
              return (
                <div
                  key={ticket.id}
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "10px",
                    padding: "16px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "12px",
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        marginBottom: "4px",
                      }}
                    >
                      <span
                        style={{
                          fontWeight: 600,
                          color: "#e5e7eb",
                          fontSize: "14px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {ticket.subject}
                      </span>
                      <span
                        style={{
                          padding: "1px 7px",
                          borderRadius: "10px",
                          fontSize: "11px",
                          fontWeight: 600,
                          color: sc,
                          background: `${sc}18`,
                          textTransform: "capitalize",
                          flexShrink: 0,
                        }}
                      >
                        ● {ticket.status}
                      </span>
                    </div>
                    <div style={{ fontSize: "12px", color: "#9ca3af" }}>
                      {ticket.user?.name || "—"} · {ticket.user?.email}
                    </div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#6b7280",
                        marginTop: "4px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {ticket.message}
                    </div>
                    <div
                      style={{
                        fontSize: "11px",
                        color: "#4b5563",
                        marginTop: "4px",
                      }}
                    >
                      {new Date(ticket.created_at).toLocaleString()}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
                    <button
                      onClick={() => {
                        setSelected(ticket);
                        setReply("");
                      }}
                      style={{
                        padding: "6px 12px",
                        borderRadius: "6px",
                        background: "rgba(21,101,192,0.15)",
                        color: "#1565C0",
                        border: "1px solid rgba(21,101,192,0.3)",
                        fontSize: "12px",
                        cursor: "pointer",
                      }}
                    >
                      Reply
                    </button>
                    {ticket.status !== "closed" && (
                      <button
                        onClick={() => closeTicket(ticket.id)}
                        style={{
                          padding: "6px 12px",
                          borderRadius: "6px",
                          background: "rgba(255,255,255,0.04)",
                          color: "#9ca3af",
                          border: "1px solid rgba(255,255,255,0.08)",
                          fontSize: "12px",
                          cursor: "pointer",
                        }}
                      >
                        Close
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {selected && (
        <>
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.7)",
              zIndex: 100,
            }}
            onClick={() => setSelected(null)}
          />
          <div
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%,-50%)",
              background: "#0f172a",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: "16px",
              padding: "24px",
              zIndex: 101,
              width: "500px",
              maxWidth: "95vw",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "16px",
              }}
            >
              <h3 style={{ color: "#fff" }}>{selected.subject}</h3>
              <button
                onClick={() => setSelected(null)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#9ca3af",
                  cursor: "pointer",
                  fontSize: "18px",
                }}
              >
                ✕
              </button>
            </div>
            <div
              style={{
                fontSize: "13px",
                color: "#9ca3af",
                marginBottom: "4px",
              }}
            >
              From: {selected.user?.name} ({selected.user?.email})
            </div>
            <div
              style={{
                padding: "12px",
                background: "rgba(255,255,255,0.04)",
                borderRadius: "8px",
                fontSize: "14px",
                color: "#e5e7eb",
                marginBottom: "16px",
                lineHeight: 1.6,
              }}
            >
              {selected.message}
            </div>
            {selected.reply && (
              <div
                style={{
                  padding: "12px",
                  background: "rgba(21,101,192,0.08)",
                  borderRadius: "8px",
                  fontSize: "13px",
                  color: "#93c5fd",
                  marginBottom: "16px",
                }}
              >
                <strong>Previous reply:</strong> {selected.reply}
              </div>
            )}
            <label
              style={{
                fontSize: "12px",
                color: "#9ca3af",
                display: "block",
                marginBottom: "6px",
              }}
            >
              Your Reply
            </label>
            <textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              rows={4}
              placeholder="Type your reply…"
              style={{
                ...inputStyle,
                resize: "vertical",
                marginBottom: "12px",
              }}
            />
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={() => setSelected(null)}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: "8px",
                  background: "rgba(255,255,255,0.06)",
                  color: "#9ca3af",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={sendReply}
                disabled={replyLoading || !reply.trim()}
                style={{
                  flex: 2,
                  padding: "10px",
                  borderRadius: "8px",
                  background: "#1565C0",
                  color: "#fff",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 600,
                  opacity: !reply.trim() ? 0.5 : 1,
                }}
              >
                {replyLoading ? "Sending…" : "Send Reply"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
