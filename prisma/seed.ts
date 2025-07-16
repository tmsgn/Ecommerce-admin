import { PrismaClient, ParentGroup } from "@prisma/client";

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
    { name: 'Men', parentGroups: [ParentGroup.MEN] },
    { name: 'Women', parentGroups: [ParentGroup.WOMEN] },
    { name: 'Kids', parentGroups: [ParentGroup.KIDS] }
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
          parentGroups: cat.parentGroups,
        },
      });
    } else if (!mainCat.parentGroups || mainCat.parentGroups.length === 0) {
      // Update existing main category to have correct parentGroups if missing
      mainCat = await prisma.category.update({
        where: { id: mainCat.id },
        data: { parentGroups: cat.parentGroups },
      });
    }
    mainCatRecords[cat.name] = mainCat;
  }

  // Subcategories for each main category
  const subcategoriesByParent: Record<string, { name: string; parentGroups: ParentGroup[] }[]> = {
    'Men': [
      { name: 'Sneakers', parentGroups: [ParentGroup.MEN] },
      { name: 'Boots', parentGroups: [ParentGroup.MEN] },
      { name: 'Loafers', parentGroups: [ParentGroup.MEN] },
      { name: 'Sandals', parentGroups: [ParentGroup.MEN] },
      { name: 'Formal', parentGroups: [ParentGroup.MEN] },
    ],
    'Women': [
      { name: 'Sneakers', parentGroups: [ParentGroup.WOMEN] },
      { name: 'Boots', parentGroups: [ParentGroup.WOMEN] },
      { name: 'Loafers', parentGroups: [ParentGroup.WOMEN] },
      { name: 'Sandals', parentGroups: [ParentGroup.WOMEN] },
      { name: 'Heels', parentGroups: [ParentGroup.WOMEN] },
      { name: 'Flats', parentGroups: [ParentGroup.WOMEN] },
    ],
    'Kids': [
      { name: 'Sneakers', parentGroups: [ParentGroup.KIDS] },
      { name: 'Boots', parentGroups: [ParentGroup.KIDS] },
      { name: 'Sandals', parentGroups: [ParentGroup.KIDS] },
      { name: 'Sports', parentGroups: [ParentGroup.KIDS] },
      { name: 'School Shoes', parentGroups: [ParentGroup.KIDS] },
    ],
  };

  for (const parentName of Object.keys(subcategoriesByParent)) {
    const parentId = mainCatRecords[parentName].id;
    for (const sub of subcategoriesByParent[parentName]) {
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
          parentId: parentId,
          parentGroups: sub.parentGroups,
        },
      });
    }
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