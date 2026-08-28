import { useEffect, useState, useRef } from "react";
import { fetchNotifications, markAllRead } from "../services/tradingApi";
import { connectSocket, disconnectSocket } from "../services/socket";
import { useAuth } from "../hooks/useAuth";
import type { Notification } from "../types/trading";
import "../styles/notifications.css";

export default function NotificationBell() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const unread = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    if (!user) return;

    fetchNotifications().then(setNotifications).catch(() => {});

    const socket = connectSocket(user.id);
    socket.on("notification", (data: { type: string; title: string; message: string }) => {
      const newNotif: Notification = {
        id: crypto.randomUUID(),
        user_id: user.id,
        type: data.type,
        title: data.title,
        message: data.message,
        read: false,
        created_at: new Date().toISOString(),
      };
      setNotifications((prev) => [newNotif, ...prev]);
    });

    return () => { disconnectSocket(); };
  }, [user]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleOpen = async () => {
    setOpen(!open);
    if (!open && unread > 0) {
      await markAllRead().catch(() => {});
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    }
  };

  return (
    <div className="notif-bell" ref={ref}>
      <button className="notif-bell__btn" onClick={handleOpen}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unread > 0 && <span className="notif-bell__badge">{unread}</span>}
      </button>

      {open && (
        <div className="notif-dropdown">
          <div className="notif-dropdown__header">Notifications</div>
          {notifications.length === 0 ? (
            <div className="notif-dropdown__empty">No notifications</div>
          ) : (
            <div className="notif-dropdown__list">
              {notifications.slice(0, 20).map((n) => (
                <div key={n.id} className={`notif-item ${!n.read ? "notif-item--unread" : ""}`}>
                  <div className="notif-item__title">{n.title}</div>
                  <div className="notif-item__msg">{n.message}</div>
                  <div className="notif-item__time">{new Date(n.created_at).toLocaleString()}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
