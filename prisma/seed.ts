import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const brands = [
    'Nike', 'Adidas', 'Puma', 'Reebok', 'New Balance', 'Converse', 'Vans', 'Skechers', 'Fila', 'Under Armour'
  ];
  for (const name of brands) {
    await prisma.brand.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  const materials = [
    'Leather', 'Canvas', 'Synthetic', 'Mesh', 'Rubber', 'Textile', 'Suede'
  ];
  for (const name of materials) {
    await prisma.material.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  const colors = [
    'Black', 'White', 'Red', 'Blue', 'Green', 'Yellow', 'Brown', 'Grey', 'Pink', 'Purple', 'Orange'
  ];
  for (const name of colors) {
    await prisma.shoeColor.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  const sizes = [
    '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'
  ];
  for (const name of sizes) {
    await prisma.shoeSize.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  const mainCategories = [
    { name: 'Men' },
    { name: 'Women' },
    { name: 'Kids' }
  ];
  const mainCatRecords: Record<string, { id: string }> = {};
  for (const cat of mainCategories) {
    let mainCat = await prisma.category.findFirst({
      where: {
        name: cat.name,
        parentId: null,
      },
    });

    if (!mainCat) {
      mainCat = await prisma.category.create({
        data: {
          name: cat.name,
        },
      });
    }
    mainCatRecords[cat.name] = mainCat;
  }

  const subcategories = [
    { name: 'Sneakers', parent: 'Men' },
    { name: 'Boots', parent: 'Men' },
    { name: 'Loafers', parent: 'Men' },
    { name: 'Sandals', parent: 'Men' },
    { name: 'Formal', parent: 'Men' },
    { name: 'Sneakers', parent: 'Women' },
    { name: 'Boots', parent: 'Women' },
    { name: 'Loafers', parent: 'Women' },
    { name: 'Sandals', parent: 'Women' },
    { name: 'Heels', parent: 'Women' },
    { name: 'Sneakers', parent: 'Kids' },
    { name: 'Boots', parent: 'Kids' },
    { name: 'Sandals', parent: 'Kids' },
    { name: 'Sports', parent: 'Kids' }
  ];

  for (const sub of subcategories) {
    const parentId = mainCatRecords[sub.parent].id;
    await prisma.category.upsert({
      where: {
        name_parentId: {
          name: sub.name,
          parentId: parentId
        }
      },
      update: {},
      create: {
        name: sub.name,
        parentId: parentId
      },
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });