import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@smartfish.io" },
    update: {},
    create: { email: "admin@smartfish.io", passwordHash, fullName: "Admin SmartFish", role: "ADMIN" },
  });

  const boat = await prisma.boat.upsert({
    where: { registrationNumber: "SN-DKR-001" },
    update: {},
    create: { name: "Téranga", registrationNumber: "SN-DKR-001", captain: "M. Diop", capacityKg: 8000, status: "available" },
  });

  const fisherman = await prisma.fisherman.upsert({
    where: { licenseNumber: "LIC-0001" },
    update: {},
    create: { fullName: "Ibrahima Sow", email: "ibrahima@smartfish.io", phone: "+221770000000", licenseNumber: "LIC-0001", boatId: boat.id, status: "active" },
  });

  await prisma.catch.createMany({
    data: [
      { boatId: boat.id, fishermanId: fisherman.id, fishType: "Thon", weightKg: 320, quantity: 40, zone: "Zone A" },
      { boatId: boat.id, fishermanId: fisherman.id, fishType: "Sardine", weightKg: 180, quantity: 600, zone: "Zone B" },
    ],
  });

  await prisma.stockItem.createMany({
    data: [
      { sku: "THON-001", name: "Thon entier", species: "Thon", warehouse: "Dakar-1", quantityKg: 1200, thresholdKg: 500, unitPrice: 8.5 },
      { sku: "SARD-001", name: "Sardine fraîche", species: "Sardine", warehouse: "Dakar-1", quantityKg: 200, thresholdKg: 300, unitPrice: 2.1 },
    ],
    skipDuplicates: true,
  });

  await prisma.sale.createMany({
    data: [
      { invoiceNo: "INV-0001", customer: "Export EU SARL", channel: "export", status: "paid", amount: 12500, currency: "EUR", paidAt: new Date() },
      { invoiceNo: "INV-0002", customer: "Marché Soumbedioune", channel: "local", status: "pending", amount: 3200, currency: "EUR" },
    ],
    skipDuplicates: true,
  });

  // eslint-disable-next-line no-console
  console.log("✅ Seed OK — login: admin@smartfish.io / admin123", admin.id);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
