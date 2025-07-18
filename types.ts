// types.ts (or wherever your ProductFormValues is defined)

// This interface now uses string IDs for relations
export interface ProductFormValues {
  id: string;
  name: string;
  description: string;
  price: number;
  mainCategoryIds: string[]; // NEW: Multiple main categories
  subCategoryIds: string[];  // NEW: Multiple subcategories
  brandId: string; // Changed from 'brand'
  materialId: string; // Changed from 'material'
  categoryName?: string;
  images: {
    url: string;
  }[];
  variants: {
    id?: string;
    price: number;
    stock: number;
    sku?: string | null;
    sizeId: string; // Changed from 'size'
    colorId: string; // Changed from 'color'
  }[];
  isFeatured: boolean;
  discountType?: 'PERCENT' | 'VALUE';
  discountValue?: number;
  createdAt: string;
}
