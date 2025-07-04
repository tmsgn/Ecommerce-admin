import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: { storeid: string } }
) {
  try {
    const { userId } = await auth();
    const body = await req.json();
    const { name, description, price, status, images, catagory, isFeatured } =
      body;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }
    if (!params.storeid) {
      return new NextResponse("Store ID is required", { status: 400 });
    }
    if (!images || !Array.isArray(images) || images.length === 0) {
      return new NextResponse("At least one image is required", {
        status: 400,
      });
    }
    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeid,
        userId,
      },
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 403 });
    }
    const product = await prismadb.product.create({
      data: {
        name,
        description,
        price,
        status,
        images: {
          createMany: {
            data: images.map((image: { url: string }) => ({ url: image.url })),
          },
        },
        storeId: params.storeid,
        catagory,
        isFeatured,
      },
    });

    return NextResponse.json(product);
  } catch (error: any) {
    console.error("[PRODUCTS_POST]", error.message, error);
    return new NextResponse(
      error?.message ? `Internal Error: ${error.message}` : "Internal Error",
      { status: 500 }
    );
  }
}
