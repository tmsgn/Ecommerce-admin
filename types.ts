import { ProductStatus, Catagory } from "@prisma/client";


export type ProductFormValues = {
  name: string;
  description?: string;
  price: number;
  isFeatured: boolean;
  status: ProductStatus;  // Strongly typed enum
  catagory: Catagory;
  images: { url: string }[];
};

// For passing initial data to forms (safe product type)
export type SafeProduct = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  status: ProductStatus;
  storeId: string;
  isFeatured: boolean;
  catagory: Catagory;
  images: { url: string }[];
  createdAt: string;  // Dates converted to string
  updatedAt: string;
};
