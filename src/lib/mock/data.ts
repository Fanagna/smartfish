import type { Fisherman, Boat, Catch } from "@/lib/services/resource.service";

export const mockFishermen: Fisherman[] = Array.from({ length: 24 }).map((_, i) => ({
  id: `fm-${i + 1}`,
  fullName: ["Amadou Diop", "Marie Diallo", "Ibrahima Sow", "Fatou Ndiaye", "Cheikh Fall", "Aïssatou Ba", "Modou Gueye", "Khady Sy"][i % 8] + ` ${i + 1}`,
  email: `fisher${i + 1}@smartfish.io`,
  phone: `+221 77 ${100 + i} ${20 + i} ${10 + i}`,
  licenseNumber: `LIC-${2024}-${1000 + i}`,
  boatId: `bt-${(i % 8) + 1}`,
  status: i % 5 === 0 ? "inactive" : "active",
  createdAt: new Date(Date.now() - i * 86400000).toISOString(),
}));

export const mockBoats: Boat[] = Array.from({ length: 12 }).map((_, i) => ({
  id: `bt-${i + 1}`,
  name: ["Atlantique", "Saloum", "Téranga", "Sirius", "Neptune", "Étoile", "Horizon", "Boréal"][i % 8] + ` ${i + 1}`,
  registrationNumber: `SN-${2024}-${500 + i}`,
  capacityKg: 1000 + i * 250,
  status: (["available", "at-sea", "maintenance"] as const)[i % 3],
  captain: ["Ousmane Kane", "Mamadou Diouf", "Bassirou Sarr"][i % 3],
  createdAt: new Date(Date.now() - i * 86400000 * 2).toISOString(),
}));

const species = ["Thon rouge", "Dorade", "Sardine", "Mérou", "Maquereau", "Sole", "Bar"];
export const mockCatches: Catch[] = Array.from({ length: 40 }).map((_, i) => ({
  id: `ct-${i + 1}`,
  boatId: `bt-${(i % 12) + 1}`,
  fishermanId: `fm-${(i % 24) + 1}`,
  fishType: species[i % species.length],
  weightKg: 50 + Math.floor(Math.random() * 450),
  quantity: 20 + Math.floor(Math.random() * 200),
  date: new Date(Date.now() - i * 3600_000 * 6).toISOString(),
  zone: ["Nord", "Sud", "Centre", "Ouest"][i % 4],
}));
