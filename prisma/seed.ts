// prisma/seed.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const brandsData = [
  { name: "NIKE" },
  { name: "ADIDAS" },
  { name: "PUMA" },
  { name: "REEBOK" },
  { name: "UNDER_ARMOUR" },
];

const materialsData = [
  { name: "LEATHER" },
  { name: "MESH" },
  { name: "CANVAS" },
  { name: "SYNTHETIC" },
  { name: "KNIT" },
];

const shoeSizesData = [
  { name: "US6" },
  { name: "US7" },
  { name: "US8" },
  { name: "US9" },
  { name: "US10" },
  { name: "US11" },
  { name: "US12" },
];

const shoeColorsData = [
  { name: "BLACK" },
  { name: "WHITE" },
  { name: "RED" },
  { name: "BLUE" },
  { name: "GREEN" },
  { name: "YELLOW" },
];

// Add your global categories here
const categoriesData = [
  { name: "Running Shoes" },
  { name: "Basketball Shoes" },
  { name: "Lifestyle Sneakers" },
  { name: "Sandals & Slides" },
  { name: "Boots" },
];

async function main() {
  console.log(`Start seeding ...`);

  console.log(`Seeding brands...`);
  await prisma.brand.createMany({
    data: brandsData,
    skipDuplicates: true,
  });

  console.log(`Seeding materials...`);
  await prisma.material.createMany({
    data: materialsData,
    skipDuplicates: true,
  });

  console.log(`Seeding shoe sizes...`);
  await prisma.shoeSize.createMany({
    data: shoeSizesData,
    skipDuplicates: true,
  });

  console.log(`Seeding shoe colors...`);
  await prisma.shoeColor.createMany({
    data: shoeColorsData,
    skipDuplicates: true,
  });

  // Seeding the new global categories
  console.log(`Seeding categories...`);
  await prisma.category.createMany({
    data: categoriesData,
    skipDuplicates: true,
  });

  console.log(`Seeding finished.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
