import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

// GET: List all products for a store
export async function GET(req, { params }) {
  const { storeid } = params;
  const products = await prismadb.product.findMany({
    where: { storeId: storeid },
    include: { images: true, variants: true },
  });
  return NextResponse.json(products);
}

// POST: Create a new product for a store
export async function POST(req, { params }) {
  const { storeid } = params;
  const body = await req.json();
  // Expect body to match ProductFormValues
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
  // Create product
  const product = await prismadb.product.create({
    data: {
      name,
      price,
      material,
      brand,
      storeId: storeid,
      categoryId,
      images: { create: images },
      variants: {
        create: [{ size, color, stock, price }],
      },
      description: "",
    },
    include: { images: true, variants: true },
  });
  return NextResponse.json(product);
} 