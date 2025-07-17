export async function PATCH(req: Request) {
  const body = await req.json();
  const schema = z.object({
    id: z.string().min(1, "Subcategory id is required"),
    name: z.string().min(1, "Subcategory name is required"),
    mainCategories: z
      .array(z.enum(["MEN", "WOMEN", "KIDS"]))
      .min(1, "At least one main category is required"),
  });
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0].message },
      { status: 400 }
    );
  }
  const { id, name, mainCategories } = parsed.data;
  const subcategory = await prismadb.subcategory.update({
    where: { id },
    data: {
      name,
      mainCategories,
    },
  });
  return NextResponse.json(subcategory);
}
import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import { z } from "zod";

export async function GET() {
  const subcategories = await prismadb.subcategory.findMany({
    orderBy: { name: "asc" },
  });
  return NextResponse.json(subcategories);
}

export async function POST(req: Request) {
  const body = await req.json();
  const schema = z.object({
    name: z.string().min(1, "Subcategory name is required"),
    mainCategories: z
      .array(z.enum(["MEN", "WOMEN", "KIDS"]))
      .min(1, "At least one main category is required"),
  });
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0].message },
      { status: 400 }
    );
  }
  const { name, mainCategories } = parsed.data;
  const subcategory = await prismadb.subcategory.create({
    data: {
      name,
      mainCategories,
    },
  });
  return NextResponse.json(subcategory);
}
