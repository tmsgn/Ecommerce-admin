import BrandsClient from "./client";
import prisma from "@/lib/prismadb";

export default async function BrandsPage() {
  const brands = await prisma.brand.findMany();
  return <BrandsClient initialBrands={brands} />;
} 