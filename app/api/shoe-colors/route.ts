import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import { z } from "zod";

const colorSchema = z.object({
  name: z.string().min(1, "Color name is required"),
});

export async function GET() {
  const colors = await prismadb.shoeColor.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(colors);
}

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = colorSchema.safeParse(body);
  if (!parsed.success) {
    return new NextResponse(JSON.stringify({ error: parsed.error.flatten() }), { status: 400 });
  }
  try {
    const color = await prismadb.shoeColor.create({ data: parsed.data });
    return NextResponse.json(color);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return new NextResponse(JSON.stringify({ error: 'Color name must be unique.' }), { status: 409 });
    }
    return new NextResponse(JSON.stringify({ error: 'Internal error' }), { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const body = await req.json();
  const { id, ...rest } = body;
  const parsed = colorSchema.safeParse(rest);
  if (!parsed.success) {
    return new NextResponse(JSON.stringify({ error: parsed.error.flatten() }), { status: 400 });
  }
  try {
    const color = await prismadb.shoeColor.update({ where: { id }, data: parsed.data });
    return NextResponse.json(color);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return new NextResponse(JSON.stringify({ error: 'Color name must be unique.' }), { status: 409 });
    }
    return new NextResponse(JSON.stringify({ error: 'Internal error' }), { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const body = await req.json();
  const { id } = body;
  try {
    // Check if any variants are using this color
    const variantsWithColor = await prismadb.variant.findFirst({
      where: { colorId: id },
    });

    if (variantsWithColor) {
      return new NextResponse(
        JSON.stringify({
          error: "This color is in use and cannot be deleted.",
        }),
        { status: 409 }
      );
    }

    await prismadb.shoeColor.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    return new NextResponse(JSON.stringify({ error: "Internal error" }), {
      status: 500,
    });
  }
} 