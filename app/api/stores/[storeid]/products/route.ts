import prismadb from "@/lib/prismadb";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: { storeid: string } }
) {
  try {
    const body = await req.json();
    const product = await prismadb.product.create({
      data: {
        title: body.title,
        description: body.description,
        status: body.status,
        storeId: params.storeid,
        images: {
          create:
            body.images?.map((img: { url: string }) => ({ url: img.url })) ||
            [],
        },
        categories: {
          connect: body.categories?.map((id: string) => ({ id })) || [],
        },
        options: {
          connect: body.options?.map((id: string) => ({ id })) || [],
        },
        variants: {
          create:
            body.variants?.map((variant: any) => ({
              price: variant.price,
              inventory: variant.inventory,
              sku: variant.sku,
              discountType: variant.discountType,
              discountValue: variant.discountValue,
              optionValues: {
                connect:
                  variant.optionValueIds?.map((id: string) => ({ id })) || [],
              },
            })) || [],
        },
      },
      include: {
        images: true,
        categories: true,
        options: true,
        variants: {
          include: {
            optionValues: true,
          },
        },
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error("Product creation error:", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
