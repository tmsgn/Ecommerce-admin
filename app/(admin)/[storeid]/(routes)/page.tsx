import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import prismadb from "@/lib/prismadb";
import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import React from "react";

const AdminPage = async ({ params }: { params: { storeid: string } }) => {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const stores = await prismadb.store.findMany({
    where: {
      userId: user.id,
    },
    include: {
      _count: {
        select: {
          products: true,
          categories: true,
        },
      },
    },
  });

  return (
    <div>
      <Heading title="Your Stores" description="Manage your stores" />
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {stores.map((store) => (
          <Link href={`/${store.id}`} key={store.id}>
            <Card
              className={`p-4 flex flex-col  h-full ${
                store.id === params.storeid ? "border-primary" : ""
              }`}
            >
              <div className="font-semibold">{store.name}</div>
              <div className="text-sm text-muted-foreground border w-fit p-1 rounded-lg">
                {store.type}
              </div>
              <div className="text-sm text-muted-foreground">
                {store._count.products} products
              </div>
              <div className="text-sm text-muted-foreground">
                {store._count.categories} categories
              </div>
              <div className="text-sm text-muted-foreground">
                Created: {store.createdAt.toLocaleDateString()}
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AdminPage;
