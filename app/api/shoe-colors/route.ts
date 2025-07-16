import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import { z } from "zod";

const colorSchema = z.object({
  name: z.string().min(1, "Color name is required"),
  storeId: z.string().min(1, "Store ID is required"),
});

export async function GET(req: Request) {
  const colors = await prismadb.shoeColor.findMany({
    orderBy: { name: "asc" },
  });
  return NextResponse.json(colors);
} 