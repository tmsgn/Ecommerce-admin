import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import { z } from "zod";

const sizeSchema = z.object({
  name: z.string().min(1, "Size name is required"),
});

export async function GET() {
  const sizes = await prismadb.shoeSize.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(sizes);
}

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = sizeSchema.safeParse(body);
  if (!parsed.success) {
    return new NextResponse(JSON.stringify({ error: parsed.error.flatten() }), { status: 400 });
  }
  try {
    const size = await prismadb.shoeSize.create({ data: parsed.data });
    return NextResponse.json(size);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return new NextResponse(JSON.stringify({ error: 'Size name must be unique.' }), { status: 409 });
    }
    return new NextResponse(JSON.stringify({ error: 'Internal error' }), { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const body = await req.json();
  const { id, ...rest } = body;
  const parsed = sizeSchema.safeParse(rest);
  if (!parsed.success) {
    return new NextResponse(JSON.stringify({ error: parsed.error.flatten() }), { status: 400 });
  }
  try {
    const size = await prismadb.shoeSize.update({ where: { id }, data: parsed.data });
    return NextResponse.json(size);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return new NextResponse(JSON.stringify({ error: 'Size name must be unique.' }), { status: 409 });
    }
    return new NextResponse(JSON.stringify({ error: 'Internal error' }), { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const body = await req.json();
  const { id } = body;
  try {
    // Check if any variants are using this size
    const variantsWithSize = await prismadb.variant.findFirst({
      where: { sizeId: id },
    });

    if (variantsWithSize) {
      return new NextResponse(
        JSON.stringify({
          error: "This size is in use and cannot be deleted.",
        }),
        { status: 409 }
      );
    }

    await prismadb.shoeSize.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    return new NextResponse(JSON.stringify({ error: "Internal error" }), {
      status: 500,
    });
  }
} 