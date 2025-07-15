import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import { z } from "zod";

const brandSchema = z.object({
  name: z.string().min(1, "Brand name is required"),
});

export async function GET() {
  const brands = await prismadb.brand.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(brands);
}

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = brandSchema.safeParse(body);
  if (!parsed.success) {
    return new NextResponse(JSON.stringify({ error: parsed.error.flatten() }), { status: 400 });
  }
  try {
    const brand = await prismadb.brand.create({ data: parsed.data });
    return NextResponse.json(brand);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return new NextResponse(JSON.stringify({ error: 'Brand name must be unique.' }), { status: 409 });
    }
    return new NextResponse(JSON.stringify({ error: 'Internal error' }), { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const body = await req.json();
  const { id, ...rest } = body;
  const parsed = brandSchema.safeParse(rest);
  if (!parsed.success) {
    return new NextResponse(JSON.stringify({ error: parsed.error.flatten() }), { status: 400 });
  }
  try {
    const brand = await prismadb.brand.update({ where: { id }, data: parsed.data });
    return NextResponse.json(brand);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return new NextResponse(JSON.stringify({ error: 'Brand name must be unique.' }), { status: 409 });
    }
    return new NextResponse(JSON.stringify({ error: 'Internal error' }), { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const body = await req.json();
  const { id } = body;
  try {
    // Check if any products are using this brand
    const productsInBrand = await prismadb.product.findFirst({
      where: { brandId: id },
    });

    if (productsInBrand) {
      return new NextResponse(
        JSON.stringify({
          error: "This brand is in use and cannot be deleted.",
        }),
        { status: 409 }
      );
    }

    await prismadb.brand.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    return new NextResponse(JSON.stringify({ error: "Internal error" }), {
      status: 500,
    });
  }
} 