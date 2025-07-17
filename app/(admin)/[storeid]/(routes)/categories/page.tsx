import CategoriesClient from "./client";
import prisma from "@/lib/prismadb";
import { MainCategory } from "@prisma/client";

export default async function CategoriesPage() {
  const subcategories = await prisma.subcategory.findMany({
    orderBy: { name: "asc" },
  });

  // Prepare rows for the table: each row is a subcategory with its mainCategories
  const categories = subcategories.map((sub) => ({
    id: sub.id,
    name: sub.name,
    parentGroups: sub.mainCategories,
  }));

  return <CategoriesClient initialCategories={categories} />;
}