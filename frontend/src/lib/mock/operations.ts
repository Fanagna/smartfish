export interface StockItem {
  id: string;
  species: string;
  category: "Frais" | "Congelé" | "Transformé";
  quantityKg: number;
  threshold: number;
  unitPrice: number;
  warehouse: string;
  updatedAt: string;
}

export interface Sale {
  id: string;
  reference: string;
  client: string;
  channel: "Marché" | "Restaurant" | "Export" | "Détail";
  amount: number;
  items: number;
  status: "Payée" | "En attente" | "Annulée";
  date: string;
}

const species = ["Thon rouge", "Dorade", "Sardine", "Mérou", "Maquereau", "Sole", "Bar", "Sardinelle", "Crevette"];
const warehouses = ["Dakar", "Mbour", "Saint-Louis", "Ziguinchor"];

export const mockStock: StockItem[] = Array.from({ length: 18 }).map((_, i) => {
  const q = 50 + Math.floor(Math.random() * 1800);
  return {
    id: `st-${i + 1}`,
    species: species[i % species.length],
    category: (["Frais", "Congelé", "Transformé"] as const)[i % 3],
    quantityKg: q,
    threshold: 200 + (i % 4) * 100,
    unitPrice: 1200 + Math.floor(Math.random() * 4000),
    warehouse: warehouses[i % warehouses.length],
    updatedAt: new Date(Date.now() - i * 3600_000 * 8).toISOString(),
  };
});

export const mockSales: Sale[] = Array.from({ length: 28 }).map((_, i) => ({
  id: `sl-${i + 1}`,
  reference: `INV-${2026}-${1000 + i}`,
  client: ["Auchan", "Casino", "Tradex SA", "Le Lagon", "Marché Soumbédioune", "Sofitel", "Export EU"][i % 7],
  channel: (["Marché", "Restaurant", "Export", "Détail"] as const)[i % 4],
  amount: 50000 + Math.floor(Math.random() * 800000),
  items: 1 + Math.floor(Math.random() * 12),
  status: (["Payée", "Payée", "En attente", "Annulée"] as const)[i % 4],
  date: new Date(Date.now() - i * 3600_000 * 12).toISOString(),
}));

export const speciesDistribution = species.slice(0, 6).map((name) => ({
  name,
  value: 200 + Math.floor(Math.random() * 1800),
}));

export const monthlyRevenue = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"].map((m) => ({
  name: m,
  value: 18000 + Math.floor(Math.random() * 35000),
}));

export const forecastDemand = Array.from({ length: 14 }).map((_, i) => ({
  name: `J+${i + 1}`,
  value: 800 + Math.floor(Math.random() * 600) + i * 20,
}));

export const channelMix = [
  { name: "Marché", value: 38 },
  { name: "Restaurant", value: 22 },
  { name: "Export", value: 28 },
  { name: "Détail", value: 12 },
];
