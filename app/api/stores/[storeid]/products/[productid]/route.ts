import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

// GET: Get a single product
export async function GET(req, { params }) {
  const { storeid, productid } = params;
  const product = await prismadb.product.findUnique({
    where: { id: productid, storeId: storeid },
    include: { images: true, variants: true, categories: { include: { category: true } } },
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
    mainCategoryIds = [],
    subCategoryIds = [],
    materialId,
    brandId,
    variants = [],
  } = body;
  // Update product
  const product = await prismadb.product.update({
    where: { id: productid, storeId: storeid },
    data: {
      name,
      price,
      materialId,
      brandId,
      images: { deleteMany: {}, create: images },
      variants: { deleteMany: {}, create: variants },
    },
  });
  // Update categories (remove all, then add new)
  await prismadb.productCategory.deleteMany({ where: { productId: productid } });
  const allCategoryIds = Array.from(new Set([...mainCategoryIds, ...subCategoryIds]));
  await prismadb.productCategory.createMany({
    data: allCategoryIds.map((categoryId) => ({ productId: productid, categoryId })),
    skipDuplicates: true,
  });
  // Return updated product with categories
  const updatedProduct = await prismadb.product.findUnique({
    where: { id: productid },
    include: { images: true, variants: true, categories: { include: { category: true } } },
  });
  return NextResponse.json(updatedProduct);
}

// DELETE: Delete a product
export async function DELETE(req, { params }) {
  const { storeid, productid } = params;
  await prismadb.product.delete({
    where: { id: productid, storeId: storeid },
  });
  return NextResponse.json({ success: true });
} 