import React from "react";
import prismadb from "@/lib/prismadb";
import { ProductForm } from "./components/product-form";
import { format } from "date-fns";
import { ProductFormValues } from "@/types";
import { Brand, Category, Material, ShoeColor, ShoeSize } from "@prisma/client";

interface ProductPageProps {
  params: { productid: string; storeid: string };
}

const ProductPage = async ({ params }: ProductPageProps) => {
  const [product, categories, brands, materials, sizes, colors] =
    await Promise.all([
      params.productid === "new"
        ? null
        : prismadb.product.findUnique({
            where: {
              id: params.productid,
              storeId: params.storeid,
            },
            include: {
              images: true,
              categories: { include: { category: true } },
              brand: true,
              material: true,
              variants: {
                include: {
                  size: true,
                  color: true,
                },
              },
            },
          }),
      prismadb.category.findMany(),
      prismadb.brand.findMany(),
      prismadb.material.findMany(),
      prismadb.shoeSize.findMany(),
      prismadb.shoeColor.findMany(),
    ]);

  const mainCategoryIds = product?.categories
    .map((pc: any) => pc.category)
    .filter((cat: any) => !cat.parentId)
    .map((cat: any) => cat.id) || [];
  const subCategoryIds = product?.categories
    .map((pc: any) => pc.category)
    .filter((cat: any) => !!cat.parentId)
    .map((cat: any) => cat.id) || [];

  const formattedProduct: ProductFormValues | null = product
    ? {
        id: product.id,
        name: product.name,
        description: product.description || "",
        price: product.price,
        mainCategoryIds,
        subCategoryIds,
        brandId: product.brandId,
        materialId: product.materialId,
        images: product.images.map((img: any) => ({ url: img.url })),
        variants: product.variants.map((v: any) => ({
          id: v.id,
          price: v.price,
          stock: v.stock,
          sku: v.sku,
          sizeId: v.sizeId,
          colorId: v.colorId,
        })),
        createdAt: format(product.createdAt, "yyyy-MM-dd"),
      }
    : null;

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <ProductForm
          initialData={formattedProduct}
          categories={categories}
          brands={brands}
          materials={materials}
          sizes={sizes}
          colors={colors}
        />
      </div>
    </div>
  );
};

export default ProductPage;
