export interface StrategySnapshot {
  realized_pnl: number;
  unrealized_pnl: number;
  net_pnl: number;
  positions: Record<string, number>;
  average_cost: Record<string, number>;
  [key: string]: unknown;
}

export type PortfolioResponse = Record<string, StrategySnapshot>;

export interface Order {
  id?: string | number;
  symbol: string;
  strategy_id: string;
  quantity: number;
  side: string;
  order_type: string;
  order_id: string;
  intent_id: string;
  [key: string]: unknown;
}
