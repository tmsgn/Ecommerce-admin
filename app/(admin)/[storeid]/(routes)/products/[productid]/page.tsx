import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import React from "react";
import { ProductForm } from "./components/product-form";
import prismadb from "@/lib/prismadb";
import { SafeProduct } from "@/types";

interface ProductPageProps {
  params: { productid: string; storeid: string };
}

const ProductPage = async ({ params }: ProductPageProps) => {
  const product = await prismadb.product.findUnique({
    where: {
      id: params.productid,
    },
    include: {
      images: true,
    },
  });

  const safeProduct: SafeProduct | undefined = product
    ? {
        ...product,
        price: Number(product.price),
        images: product.images.map((img) => ({ url: img.url })),
        createdAt: product.createdAt.toISOString(),
        updatedAt: product.updatedAt.toISOString(),
      }
    : undefined;

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>{product ? "Edit Product" : "Create Product"}</CardTitle>
          <CardDescription>
            {product
              ? "Update the fields below to edit the product."
              : "Fill this form to create a new product."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProductForm initialData={safeProduct} />
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductPage;
