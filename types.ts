import { ShoeColor, ShoeSize, Material, Brand } from "@prisma/client";

export interface ProductFormValues {
  id: string;
  name: string;
  description: string;
  price: number;
  material: Material;
  brand: Brand;
  categoryId: string;
  categoryName?: string; 
  images: {
    url: string;
  }[];
  variants: {
    id?: string;
    size: ShoeSize;
    color: ShoeColor;
    price: number;
    stock: number;
    sku?: string | null;
  }[];
  createdAt: string;
}
