import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import { z } from "zod";

const sizeSchema = z.object({
  name: z.string().min(1, "Size name is required"),
  storeId: z.string().min(1, "Store ID is required"),
});

export async function GET(req: Request) {
  const sizes = await prismadb.shoeSize.findMany({
    orderBy: { name: "asc" },
  });
  return NextResponse.json(sizes);
} 