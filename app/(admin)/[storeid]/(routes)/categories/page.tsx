import CategoriesClient from "./client";
import prisma from "@/lib/prismadb";

export default async function CategoriesPage() {
  // Fetch categories from the database
  const categories = await prisma.category.findMany();
  return <CategoriesClient initialCategories={categories} />;
} 