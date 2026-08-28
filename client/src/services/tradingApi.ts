import { apiFetch } from "./api";
import type { Profile, Holding, Transaction, PriceTrigger, Notification } from "../types/trading";

export const fetchProfile = () => apiFetch<Profile>("/api/portfolio/profile");

export const fetchHoldings = () =>
  apiFetch<{ holdings: Holding[] }>("/api/portfolio/holdings").then((r) => r.holdings);

export const fetchTransactions = () =>
  apiFetch<{ transactions: Transaction[] }>("/api/portfolio/transactions").then((r) => r.transactions);

export const deposit = (amount: number) =>
  apiFetch<{ balance: number }>("/api/portfolio/deposit", {
    method: "POST",
    body: JSON.stringify({ amount }),
  });

export const submitKyc = (fullName: string, phone: string, address: string) =>
  apiFetch<{ message: string }>("/api/portfolio/kyc", {
    method: "POST",
    body: JSON.stringify({ fullName, phone, address }),
  });

export const buyStock = (symbol: string, quantity: number) =>
  apiFetch<{ message: string; price: number; total: number }>("/api/trading/buy", {
    method: "POST",
    body: JSON.stringify({ symbol, quantity }),
  });

export const sellStock = (symbol: string, quantity: number) =>
  apiFetch<{ message: string; price: number; total: number }>("/api/trading/sell", {
    method: "POST",
    body: JSON.stringify({ symbol, quantity }),
  });

export const fetchTriggers = () =>
  apiFetch<{ triggers: PriceTrigger[] }>("/api/triggers").then((r) => r.triggers);

export const createTrigger = (symbol: string, targetPrice: number, quantity: number) =>
  apiFetch<{ trigger: PriceTrigger }>("/api/triggers", {
    method: "POST",
    body: JSON.stringify({ symbol, targetPrice, quantity }),
  });

export const cancelTrigger = (id: string) =>
  apiFetch<{ message: string }>(`/api/triggers/${id}`, { method: "DELETE" });

export const fetchNotifications = () =>
  apiFetch<{ notifications: Notification[] }>("/api/notifications").then((r) => r.notifications);

export const markAllRead = () =>
  apiFetch<{ message: string }>("/api/notifications/read-all", { method: "PATCH" });
