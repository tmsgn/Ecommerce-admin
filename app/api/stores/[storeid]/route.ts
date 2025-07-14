import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  { params }: { params: { storeid: string } }
) {
  try {
    const { userId } = await auth();
 
    const { name, description } = await request.json();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    if (!params.storeid) {
      return new NextResponse("Store ID is required", { status: 400 });
    }



    const store = await prismadb.store.update({
      where: {
        id: params.storeid,
        userId: userId,
      },
      data: {
        name,
        description,
      },
    });

    return NextResponse.json(store);
  } catch (error) {
    console.error("[STORE_PATCH]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { storeid: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!params.storeid) {
      return new NextResponse("Store ID is required", { status: 400 });
    }

 
    const store = await prismadb.store.delete({
      where: {
        id: params.storeid,
        userId: userId,
      },
    });

    return NextResponse.json(store);
  } catch (error) {
    console.error("[STORE_DELETE]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
