import { api } from "@/lib/api/client";

export interface AiRecommendation {
  title: string;
  impact: string;
  confidence: number;
  tone?: "success" | "warning" | "info" | "danger";
}

export interface AiChatMessage {
  role: "user" | "model";
  content: string;
}

export interface StockDecision {
  sku: string;
  action: "BUY_NOW" | "STOP_BUYING" | "EXPORT_PRIORITY" | "SELL_LOCAL" | "HOLD";
  reason: string;
  priority: 1 | 2 | 3;
  confidence: number;
}

export interface StockIntelligenceOverview {
  metrics: { itemCount: number; ruptures: number; surstock: number; valuation: number };
  alerts: {
    ruptures: Array<{ sku: string; name: string; qty: number; threshold: number }>;
    surstock: Array<{ sku: string; name: string; qty: number; threshold: number }>;
  };
  ai: { summary: string; decisions: StockDecision[] };
}

export const aiService = {
  chat: async (message: string, history: AiChatMessage[] = []) => {
    const { data } = await api.post<{ reply: string; timestamp: string }>("/ai/chat", { message, history });
    return data;
  },
  recommendations: async () => {
    const { data } = await api.get<AiRecommendation[] | { recommendations: AiRecommendation[] }>("/ai/recommendations");
    return Array.isArray(data) ? data : data.recommendations ?? [];
  },
  forecast: async () => {
    const { data } = await api.get<{ baseline: number; horizonDays: number; forecast: Array<{ date: string; predicted: number }> }>("/ai/forecast");
    return data;
  },
  analyze: async () => {
    const { data } = await api.post<{ analysis: string; generatedAt: string }>("/ai/analyze", {});
    return data;
  },
};

export const stockIntelligenceService = {
  overview: async () => {
    const { data } = await api.get<StockIntelligenceOverview>("/stock/intelligence/overview");
    return data;
  },
  profitability: async () => {
    const { data } = await api.get<{
      ranked: Array<{ sku: string; name: string; species?: string; stockValue: number; margin: number }>;
      insight: string;
    }>("/stock/intelligence/profitability");
    return data;
  },
};
