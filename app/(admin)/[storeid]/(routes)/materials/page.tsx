import MaterialsClient from "./client";
import prisma from "@/lib/prismadb";

export default async function MaterialsPage({ params }: { params: { storeid: string } }) {
  const materials = await prisma.material.findMany();
  return <MaterialsClient initialMaterials={materials} />;
} 