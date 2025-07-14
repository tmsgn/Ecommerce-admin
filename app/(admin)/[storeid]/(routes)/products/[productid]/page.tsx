import React from "react";
import prismadb from "@/lib/prismadb";
import { ProductForm } from "./components/product-form";
import { format } from "date-fns";
import { ProductFormValues } from "@/types";

interface ProductPageProps {
  params: { productid: string; storeid: string };
}

const ProductPage = async ({ params }: ProductPageProps) => {
  const [product, categories] = await Promise.all([
    prismadb.product.findUnique({
      where: {
        id: params.productid,
        storeId: params.storeid,
      },
      include: {
        images: true,
        variants: true,
        category: true,
      },
    }),
    prismadb.category.findMany({
      where: {
        storeId: params.storeid,
      },
    }),
  ]);

  const formattedProduct: ProductFormValues | null = product
    ? {
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        material: product.material,
        brand: product.brand,
        categoryId: product.categoryId,
        categoryName: product.category.name,
        images: product.images.map((img) => ({ url: img.url })),
        variants: product.variants.map((v) => ({
          id: v.id,
          size: v.size,
          color: v.color,
          price: v.price,
          stock: v.stock,
          sku: v.sku,
        })),
        createdAt: format(product.createdAt, "yyyy-MM-dd"),
      }
    : null;

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <ProductForm initialData={formattedProduct} categories={categories} />
      </div>
    </div>
  );
};

export default ProductPage;
