import SizesClient from "./client";
import prisma from "@/lib/prismadb";

export default async function SizesPage() {
  // Fetch sizes from the database
  const sizes = await prisma.shoeSize.findMany();
  return <SizesClient initialSizes={sizes} />;
} 