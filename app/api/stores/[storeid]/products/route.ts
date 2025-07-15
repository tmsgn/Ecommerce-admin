import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";

const productFormSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().min(1, "Description is required"),
  price: z.coerce.number().min(0.01, "Price must be greater than 0"),
  images: z.array(z.object({ url: z.string().url("Invalid image URL") })).min(1, "At least one image is required"),
  categoryId: z.string().min(1, "Category is required"),
  brandId: z.string().min(1, "Brand is required"),
  materialId: z.string().min(1, "Material is required"),
  variants: z.array(
    z.object({
      price: z.coerce.number().min(0, "Variant price required"),
      stock: z.coerce.number().min(0, "Stock required"),
      sku: z.string().optional().nullable(),
      sizeId: z.string().min(1, "Size is required"),
      colorId: z.string().min(1, "Color is required"),
    })
  ).min(1, "At least one variant is required"),
});

export async function POST(
  req: Request,
  { params }: { params: { storeid: string } }
) {
  try {
    const { userId } = await auth();
    const body = await req.json();

    // --- Backend Validation ---
    const parsed = productFormSchema.safeParse(body);
    if (!parsed.success) {
      return new NextResponse(
        JSON.stringify({ error: parsed.error.flatten() }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    const {
      name,
      description,
      price,
      images,
      categoryId,
      brandId,
      materialId,
      variants,
    } = parsed.data;

    // --- Authentication & Validation ---
    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 });
    }
    if (!name) return new NextResponse("Name is required", { status: 400 });
    if (!price) return new NextResponse("Price is required", { status: 400 });
    if (!images || !images.length)
      return new NextResponse("Images are required", { status: 400 });
    if (!categoryId)
      return new NextResponse("Category is required", { status: 400 });
    if (!brandId) return new NextResponse("Brand is required", { status: 400 });
    if (!materialId)
      return new NextResponse("Material is required", { status: 400 });
    if (!variants || !variants.length)
      return new NextResponse("Variants are required", { status: 400 });
    if (!params.storeid)
      return new NextResponse("Store ID is required", { status: 400 });

    // --- Authorization ---
    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeid,
        userId,
      },
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    // --- Database Creation ---
    try {
      const product = await prismadb.product.create({
        data: {
          storeId: params.storeid,
          name,
          description,
          price,
          categoryId,
          brandId,
          materialId,
          images: {
            create: images.map((image: { url: string }) => image),
          },
          variants: {
            create: variants.map(
              (variant: {
                price: number;
                stock: number;
                sku?: string | null;
                sizeId: string;
                colorId: string;
              }) => ({
                price: variant.price,
                stock: variant.stock,
                sku: variant.sku ?? undefined,
                sizeId: variant.sizeId,
                colorId: variant.colorId,
              })
            ),
          },
        },
      });
      return NextResponse.json(product);
    } catch (error: any) {
      // Unique constraint error (duplicate name)
      if (error.code === 'P2002' && error.meta?.target?.includes('name')) {
        return new NextResponse(
          JSON.stringify({ error: 'A product with this name already exists in this store.' }),
          { status: 409, headers: { 'Content-Type': 'application/json' } }
        );
      }
      throw error;
    }
  } catch (error) {
    console.error("[PRODUCTS_POST]", error, typeof error === 'object' && error !== null ? JSON.stringify(error) : String(error));
    return new NextResponse(
      JSON.stringify({ message: "Internal error", error: error instanceof Error ? error.message : String(error) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
