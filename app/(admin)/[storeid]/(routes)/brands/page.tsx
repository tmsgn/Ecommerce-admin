import BrandsClient from "./client";
import prisma from "@/lib/prismadb";

export default async function BrandsPage({ params }: { params: { storeid: string } }) {
  const brands = await prisma.brand.findMany({ where: { storeId: params.storeid } });
  return <BrandsClient initialBrands={brands} storeId={params.storeid} />;
} 