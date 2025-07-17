import { PrismaClient, MainCategory } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // --- Seed Brands ---
  const brands = ["Nike", "Adidas", "Puma", "Reebok", "New Balance", "Converse", "Vans", "Fila", "Asics", "Under Armour"];
  for (const name of brands) {
    await prisma.brand.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  // --- Seed Materials ---
  const materials = ["Leather", "Canvas", "Synthetic", "Mesh", "Rubber", "Textile", "Suede"];
  for (const name of materials) {
    await prisma.material.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  // --- Seed Shoe Colors ---
  const colors = ["Black", "White", "Red", "Blue", "Green", "Yellow", "Brown", "Grey", "Pink", "Purple"];
  for (const name of colors) {
    await prisma.shoeColor.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  // --- Seed Shoe Sizes ---
  const sizes = ["38", "39", "40", "41", "42", "43", "44", "45", "46", "47"];
  for (const name of sizes) {
    await prisma.shoeSize.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  // --- Seed Subcategories (existing logic) ---
}

main()
  .catch(() => {
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });