import CategoriesClient from "./client";
import prisma from "@/lib/prismadb";

export default async function CategoriesPage({ params }: { params: { storeid: string } }) {
  const categories = await prisma.category.findMany();
  return <CategoriesClient initialCategories={categories} />;
} 