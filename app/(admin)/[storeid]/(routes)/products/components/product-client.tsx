
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus } from "lucide-react";
import React from "react";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import Link from "next/link";

import prismadb from "@/lib/prismadb";

interface ProductClientProps {
    storeid: string
}

const ProductClient: React.FC<ProductClientProps> = async ({storeid}) => {
 

  const data = await prismadb.product.findMany({
    where: { storeId: storeid },
    include: { images: true },
  });

  const mappedData = data.map((product) => ({
    ...product,
    images: product.images.length > 0 ? product.images[0].url : "",
    description: product.description ?? "",
    createdAt:
      product.createdAt instanceof Date
        ? product.createdAt.toISOString()
        : product.createdAt,
    updatedAt:
      product.updatedAt instanceof Date
        ? product.updatedAt.toISOString()
        : product.updatedAt,
  }));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-end">
        <Link href={`/${storeid}/products/create`}>
          <Button>
            <Plus />
            Add product
          </Button>
        </Link>
      </div>
      <div>
        <Card>
          <CardHeader>
            <CardTitle>Products</CardTitle>
            <CardDescription>Manage your products</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="container mx-auto py-10">
              <DataTable columns={columns} data={mappedData} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProductClient;
