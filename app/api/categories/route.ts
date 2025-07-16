import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import { z } from "zod";

const categorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
});

export async function GET(req: Request) {
  const categories = await prismadb.category.findMany({
    orderBy: { name: "asc" },
  });
  return NextResponse.json(categories);
}

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = categorySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0].message }, { status: 400 });
  }
  const { name } = parsed.data;
  const category = await prismadb.category.create({
    data: { name },
  });
  return NextResponse.json(category);
}