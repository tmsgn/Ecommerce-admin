import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// POST handler for creating a new product with variants
export async function POST(
  req: Request,
  { params }: { params: { storeid: string } }
) {
  try {
    const { userId } = await auth();
    const body = await req.json();

    const {
      title,
      description,
      images,
      masterCategoryId,
      variants, // Expect an array of variants
    } = body;

    // --- Validation ---
    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 });
    }
    if (!title) {
      return new NextResponse("Title is required", { status: 400 });
    }
    if (!images || !images.length) {
      return new NextResponse("At least one image is required", { status: 400 });
    }
    if (!masterCategoryId) {
      return new NextResponse("Category is required", { status: 400 });
    }
    if (!variants || !variants.length) {
      return new NextResponse("At least one product variant is required", { status: 400 });
    }
    if (!params.storeid) {
      return new NextResponse("Store ID is required", { status: 400 });
    }

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
    const product = await prismadb.product.create({
      data: {
        title,
        description,
        storeId: params.storeid,
        masterCategoryId,
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
    console.error("[PRODUCTS_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}


// GET handler for fetching all products, with optional filtering
export async function GET(
  req: Request,
  { params }: { params: { storeid: string } }
) {
  try {
    const { searchParams } = new URL(req.url);
    const masterCategoryId = searchParams.get("masterCategoryId") || undefined;
    
    if (!params.storeid) {
      return new NextResponse("Store id is required", { status: 400 });
    }

    const products = await prismadb.product.findMany({
      where: {
        storeId: params.storeid,
        masterCategoryId, // Filter by the master category ID if provided
      },
      include: {
        images: true,
        masterCategory: true,
        variants: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("[PRODUCTS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}