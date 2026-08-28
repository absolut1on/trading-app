import { EventEmitter } from "events";

export const eventBus = new EventEmitter();

export const Events = {
  TRIGGER_EXECUTED: "trigger.executed",
  PRICE_ALERT: "price.alert",
  NOTIFICATION: "notification",
} as const;
