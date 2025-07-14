import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// GET handler for a single product
export async function GET(
  req: Request,
  { params }: { params: { productid: string } }
) {
  try {
    if (!params.productid) {
      return new NextResponse("Product ID is required", { status: 400 });
    }

    const product = await prismadb.product.findUnique({
      where: {
        id: params.productid,
      },
      include: {
        images: true,
        masterCategory: true,
        variants: true,
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error("[PRODUCT_GET]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// PATCH handler for updating a product
export async function PATCH(
  req: Request,
  { params }: { params: { storeid: string; productid: string } }
) {
  try {
    const { userId } = await auth();
    const body = await req.json();

    const {
      title,
      description,
      images,
      masterCategoryId,
      variants,
    } = body;

    // --- Validation ---
    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 });
    }
    if (!title) return new NextResponse("Title is required", { status: 400 });
    if (!images || !images.length) return new NextResponse("Images are required", { status: 400 });
    if (!masterCategoryId) return new NextResponse("Category is required", { status: 400 });
    if (!variants || !variants.length) return new NextResponse("Variants are required", { status: 400 });
    if (!params.productid) return new NextResponse("Product ID is required", { status: 400 });

    // --- Authorization: Check if user owns the store ---
    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeid,
        userId,
      },
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    // --- Database Update ---
    // First, update the main product and delete all old images and variants
    await prismadb.product.update({
      where: {
        id: params.productid,
      },
      data: {
        title,
        description,
        masterCategoryId,
        images: {
          deleteMany: {},
        },
        variants: {
          deleteMany: {},
        },
      },
    });

    // Then, create the new images and variants in a second update
    const product = await prismadb.product.update({
      where: {
        id: params.productid,
      },
      data: {
        images: {
          createMany: {
            data: [...images.map((image: { url: string }) => image)],
          },
        },
        variants: {
          create: variants.map((variant: { title: string; price: number; inventory: number; sku?: string }) => ({
            title: variant.title,
            price: variant.price,
            inventory: variant.inventory,
            sku: variant.sku,
          })),
        },
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error("[PRODUCT_PATCH]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// DELETE handler for a single product
export async function DELETE(
  req: Request,
  { params }: { params: { storeid: string; productid: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 });
    }
    if (!params.productid) {
      return new NextResponse("Product ID is required", { status: 400 });
    }

    // --- Authorization: Check if user owns the store ---
    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeid,
        userId,
      },
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    // --- Database Deletion ---
    const product = await prismadb.product.delete({
      where: {
        id: params.productid,
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error("[PRODUCT_DELETE]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}