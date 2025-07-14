import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

// GET: Get a single product
export async function GET(req, { params }) {
  const { storeid, productid } = params;
  const product = await prismadb.product.findUnique({
    where: { id: productid, storeId: storeid },
    include: { images: true, variants: true },
  });
  return NextResponse.json(product);
}

// PATCH: Update a product
export async function PATCH(req, { params }) {
  const { storeid, productid } = params;
  const body = await req.json();
  const {
    name,
    images,
    price,
    categoryId,
    size,
    color,
    stock,
    material,
    brand,
  } = body;
  // Update product
  const product = await prismadb.product.update({
    where: { id: productid, storeId: storeid },
    data: {
      name,
      price,
      material,
      brand,
      categoryId,
      images: { deleteMany: {}, create: images },
      variants: { deleteMany: {}, create: [{ size, color, stock, price }] },
    },
    include: { images: true, variants: true },
  });
  return NextResponse.json(product);
}

// DELETE: Delete a product
export async function DELETE(req, { params }) {
  const { storeid, productid } = params;
  await prismadb.product.delete({
    where: { id: productid, storeId: storeid },
  });
  return NextResponse.json({ success: true });
} 