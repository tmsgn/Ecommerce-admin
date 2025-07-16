import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import { z } from "zod";

const categorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  parentGroups: z.array(z.enum(["MEN", "WOMEN", "KIDS"])).min(1, "At least one parent group is required"),
});

export async function GET(req: Request) {
  const categories = await prismadb.category.findMany({
    where: { parentId: null }, 
    orderBy: { name: "asc" },
    include: { children: true }, 
  });
  return NextResponse.json(categories);
}

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = categorySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0].message }, { status: 400 });
  }
  const { name, parentGroups } = parsed.data;
  const category = await prismadb.category.create({
    data: { name },
  });
  return NextResponse.json(category);}
