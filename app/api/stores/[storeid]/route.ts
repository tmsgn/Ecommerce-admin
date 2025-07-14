import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  { params }: { params: { storeid: string } }
) {
  try {
    const { userId } = await auth();
    // Destructure all fields that can be updated from the body
    const { name, description } = await request.json();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // You can update any field, so we only need to validate the ones provided
    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    if (!params.storeid) {
      return new NextResponse("Store ID is required", { status: 400 });
    }

    // Generate a new slug if the name is being updated
    const slug = name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w\-]+/g, "");

    const store = await prismadb.store.update({
      where: {
        id: params.storeid,
        userId: userId, // This ensures a user can only update their own store
      },
      data: {
        name,
        description,
        slug,
      },
    });

    return NextResponse.json(store);
  } catch (error) {
    console.error("[STORE_PATCH]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(
  request: Request, // request is unused but required by Next.js convention
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

    // Use `delete` instead of `deleteMany` to target a single record
    // The `onDelete: Cascade` in your schema will handle deleting related products
    const store = await prismadb.store.delete({
      where: {
        id: params.storeid,
        userId: userId, // This security check prevents a user from deleting another's store
      },
    });

    return NextResponse.json(store);
  } catch (error) {
    // Corrected the log message
    console.error("[STORE_DELETE]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
