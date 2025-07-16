import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import { z } from "zod";

const materialSchema = z.object({
  name: z.string().min(1, "Material name is required"),
  storeId: z.string().min(1, "Store ID is required"),
});

export async function GET(req: Request) {
  const materials = await prismadb.material.findMany({
    orderBy: { name: "asc" },
  });
  return NextResponse.json(materials);
} 