import { Link, useLocation } from "react-router-dom";
import MarketStatus from "./MarketStatus";
import NotificationBell from "./NotificationBell";
import { useAuth } from "../hooks/useAuth";
import "../styles/layout.css";
import "../styles/trading.css";

export default function Header() {
  const { user, signOut } = useAuth();
  const location = useLocation();

  return (
    <header className="header">
      <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
        <Link to="/" style={{ textDecoration: "none" }}>
          <span className="header__title">Trading App</span>
        </Link>
        {user && (
          <nav className="nav-links">
            <Link to="/" className={location.pathname === "/" ? "active" : ""}>Dashboard</Link>
            <Link to="/portfolio" className={location.pathname === "/portfolio" ? "active" : ""}>Portfolio</Link>
            <Link to="/transactions" className={location.pathname === "/transactions" ? "active" : ""}>History</Link>
            <Link to="/kyc" className={location.pathname === "/kyc" ? "active" : ""}>KYC</Link>
          </nav>
        )}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <MarketStatus />
        {user && (
          <>
            <NotificationBell />
            <span style={{ fontSize: "0.8125rem", color: "var(--text-secondary)" }}>
              {user.email}
            </span>
            <button
              onClick={signOut}
              style={{
                padding: "0.375rem 0.75rem",
                background: "transparent",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                color: "var(--text-secondary)",
                fontSize: "0.8125rem",
                cursor: "pointer",
              }}
            >
              Logout
            </button>
          </>
        )}
      </div>
    </header>
  );
}
