import SizesClient from "./client";
import prisma from "@/lib/prismadb";

export default async function SizesPage({ params }: { params: { storeid: string } }) {
  const sizes = await prisma.shoeSize.findMany({ where: { storeId: params.storeid } });
  return <SizesClient initialSizes={sizes} storeId={params.storeid} />;
} 