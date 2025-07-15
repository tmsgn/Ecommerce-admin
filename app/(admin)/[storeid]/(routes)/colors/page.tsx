import ColorsClient from "./client";
import prisma from "@/lib/prismadb";

export default async function ColorsPage() {
  const colors = await prisma.shoeColor.findMany();
  return <ColorsClient initialColors={colors} />;
} 