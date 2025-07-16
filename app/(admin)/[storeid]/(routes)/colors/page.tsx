import ColorsClient from "./client";
import prisma from "@/lib/prismadb";

export default async function ColorsPage({ params }: { params: { storeid: string } }) {
  const colors = await prisma.shoeColor.findMany({ where: { storeId: params.storeid } });
  return <ColorsClient initialColors={colors} storeId={params.storeid} />;
} 