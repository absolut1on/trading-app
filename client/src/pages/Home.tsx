import { useEffect, useState } from "react";
import { apiFetch } from "../services/api";

interface HealthResponse {
  status: string;
  timestamp: string;
}

export default function Home() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<HealthResponse>("/api/health")
      .then(setHealth)
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div style={{ padding: "2rem", fontFamily: "system-ui, sans-serif" }}>
      <h1>Trading App</h1>
      <p>
        Backend status:{" "}
        {error ? (
          <span style={{ color: "red" }}>Disconnected — {error}</span>
        ) : health ? (
          <span style={{ color: "green" }}>
            Connected ({health.timestamp})
          </span>
        ) : (
          <span>Checking...</span>
        )}
      </p>
    </div>
  );
}
