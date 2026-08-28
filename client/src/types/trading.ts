export type Profile = {
  balance: number;
  kyc_completed: boolean;
  email: string;
  username: string | null;
};

export type Holding = {
  id: string;
  user_id: string;
  symbol: string;
  quantity: number;
  avg_buy_price: number;
  created_at: string;
  updated_at: string;
};

export type Transaction = {
  id: string;
  user_id: string;
  symbol: string;
  type: "buy" | "sell";
  quantity: number;
  price: number;
  total: number;
  created_at: string;
};

export type PriceTrigger = {
  id: string;
  user_id: string;
  symbol: string;
  target_price: number;
  quantity: number;
  active: boolean;
  created_at: string;
};

export type Notification = {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
};
