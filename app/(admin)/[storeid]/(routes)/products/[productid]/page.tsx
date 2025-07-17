import React from "react";
import prismadb from "@/lib/prismadb";
import { ProductForm } from "./components/product-form";
import { format } from "date-fns";
import { ProductFormValues } from "@/types";
import { Brand, Material, ShoeColor, ShoeSize, MainCategory } from "@prisma/client";

interface ProductPageProps {
  params: { productid: string; storeid: string };
}

const ProductPage = async ({ params }: ProductPageProps) => {
  // Get main categories from enum
  const mainCategories = Object.values(MainCategory).map((value) => ({
    label: value.charAt(0) + value.slice(1).toLowerCase(),
    value,
  }));
  // Get subcategories from database
  const subcategories = await prismadb.subcategory.findMany({ orderBy: { name: "asc" } });

  const [product, brands, materials, sizes, colors] =
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
              subcategories: true,
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
      prismadb.brand.findMany(),
      prismadb.material.findMany(),
      prismadb.shoeSize.findMany(),
      prismadb.shoeColor.findMany(),
    ]);

  // mainCategoryIds from product.mainCategories (enum array)
  const mainCategoryIds = product?.mainCategories || [];
  // subCategoryIds from product.subcategories (relation)
  const subCategoryIds = product?.subcategories?.map((sub: any) => sub.id) || [];

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
        isFeatured: product.isFeatured ?? false,
        discountType: product.discountType ?? undefined,
        discountValue: product.discountValue ?? undefined,
        createdAt: format(product.createdAt, "yyyy-MM-dd"),
      }
    : null;

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <ProductForm
          initialData={formattedProduct}
          mainCategories={mainCategories}
          subcategories={subcategories}
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
