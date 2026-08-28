import { Router, Request, Response } from "express";
import { MarketStatusResponse } from "../types/stock";

const router = Router();

const US_HOLIDAYS_2026 = [
  "2026-01-01",
  "2026-01-19",
  "2026-02-16",
  "2026-04-03",
  "2026-05-25",
  "2026-07-03",
  "2026-09-07",
  "2026-11-26",
  "2026-12-25",
];

function getETTime(): { hours: number; minutes: number; day: number; dateStr: string } {
  const now = new Date();
  const etStr = now.toLocaleString("en-US", { timeZone: "America/New_York" });
  const etDate = new Date(etStr);
  const year = etDate.getFullYear();
  const month = String(etDate.getMonth() + 1).padStart(2, "0");
  const dayOfMonth = String(etDate.getDate()).padStart(2, "0");

  return {
    hours: etDate.getHours(),
    minutes: etDate.getMinutes(),
    day: etDate.getDay(),
    dateStr: `${year}-${month}-${dayOfMonth}`,
  };
}

function formatTimeET(): string {
  return new Date().toLocaleString("en-US", {
    timeZone: "America/New_York",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}

function getNextEvent(isOpen: boolean, et: ReturnType<typeof getETTime>): string {
  if (isOpen) {
    const minutesLeft = (16 * 60) - (et.hours * 60 + et.minutes);
    const h = Math.floor(minutesLeft / 60);
    const m = minutesLeft % 60;
    return h > 0 ? `Market closes in ${h}h ${m}m` : `Market closes in ${m}m`;
  }

  const currentMinutes = et.hours * 60 + et.minutes;
  const openMinutes = 9 * 60 + 30;

  if (et.day >= 1 && et.day <= 5 && currentMinutes < openMinutes) {
    const minutesUntil = openMinutes - currentMinutes;
    const h = Math.floor(minutesUntil / 60);
    const m = minutesUntil % 60;
    return h > 0 ? `Market opens in ${h}h ${m}m` : `Market opens in ${m}m`;
  }

  return "Market opens next trading day at 9:30 AM ET";
}

router.get("/status", (_req: Request, res: Response) => {
  const et = getETTime();

  const isWeekday = et.day >= 1 && et.day <= 5;
  const isHoliday = US_HOLIDAYS_2026.includes(et.dateStr);
  const currentMinutes = et.hours * 60 + et.minutes;
  const isMarketHours = currentMinutes >= 9 * 60 + 30 && currentMinutes < 16 * 60;

  const isOpen = isWeekday && !isHoliday && isMarketHours;

  const response: MarketStatusResponse = {
    isOpen,
    currentTimeET: formatTimeET(),
    nextEvent: getNextEvent(isOpen, et),
  };

  res.json(response);
});

export default router;
