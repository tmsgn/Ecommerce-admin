import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import { z } from "zod";

const brandSchema = z.object({
  name: z.string().min(1, "Brand name is required"),
  storeId: z.string().min(1, "Store ID is required"),
});

export async function GET(req: Request) {
  const brands = await prismadb.brand.findMany({
    orderBy: { name: "asc" },
  });
  return NextResponse.json(brands);
} 