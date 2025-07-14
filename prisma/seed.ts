import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log(`Start seeding ...`);

  // --- Seed Categories ---
  const categoriesData = [
    { name: "Electronics" },
    { name: "Apparel" },
    { name: "Books"},
    { name: "Footwear" },
    { name: "Home Goods"},
  ];

  for (const cat of categoriesData) {
    await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: {
        name: cat.name
      },
    });
  }
  console.log('Seeded Categories');

  // --- Seed Options and Values ---
  const optionsAndValues = {
    Color: ["Black", "White", "Red", "Blue", "Green"],
    Size: ["S", "M", "L", "XL", "XXL"],
    Material: ["Cotton", "Polyester", "Leather", "Denim"],
    Storage: ["128GB", "256GB", "512GB", "1TB"], 
    RAM: ["6GB", "8GB", "12GB", "16GB"], 
  };

  for (const optionName of Object.keys(optionsAndValues)) {
    const option = await prisma.option.upsert({
      where: { name: optionName },
      update: {},
      create: {
        name: optionName,
      },
    });

    const values =
      optionsAndValues[optionName as keyof typeof optionsAndValues];

    for (const valueName of values) {
      await prisma.optionValue.upsert({
        where: {
          name_optionId: {
            name: valueName,
            optionId: option.id,
          },
        },
        update: {},
        create: {
          name: valueName,
          optionId: option.id,
        },
      });
    }
  }
  console.log('Seeded Options and Values');

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