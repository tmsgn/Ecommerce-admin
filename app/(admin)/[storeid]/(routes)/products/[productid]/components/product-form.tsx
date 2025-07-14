"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Category,
  Material,
  Brand,
  ShoeColor,
  ShoeSize,
} from "@prisma/client";
import { Trash } from "lucide-react";

import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageUpload } from "@/components/image-uploader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductFormValues as InitialProductData } from "@/types"; // Renamed for clarity

// 1. Define the Zod schema for ALL form fields you want to validate
const formSchema = z.object({
  name: z.string().min(1, "Name is required."),
  description: z.string().min(1, "Description is required."),
  price: z.coerce.number().min(0.01, "Price must be a positive number."),
  categoryId: z.string().min(1, "Category is required."),
  material: z.nativeEnum(Material),
  brand: z.nativeEnum(Brand),
  images: z
    .object({ url: z.string() })
    .array()
    .min(1, "At least one image is required."),
  variants: z
    .array(
      z.object({
        id: z.string().optional(),
        size: z.nativeEnum(ShoeSize),
        color: z.nativeEnum(ShoeColor),
        stock: z.coerce.number().int().min(0, "Stock cannot be negative."),
        price: z.coerce.number().min(0.01, "Variant price must be positive."),
        sku: z.string().nullable().optional(),
      })
    )
    .min(1, "At least one product variant is required."),
});

// 2. Infer the form's type directly from the Zod schema. This is the key to type safety.
type ProductFormSchema = z.infer<typeof formSchema>;

interface ProductFormProps {
  initialData: InitialProductData | null;
  categories: Category[];
}

export const ProductForm: React.FC<ProductFormProps> = ({
  initialData,
  categories,
}) => {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // 3. Use the INFERRED type for the form, and the REAL schema for the resolver.
  const form = useForm<ProductFormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      name: "",
      description: "",
      price: 0,
      material: Material.LEATHER,
      brand: Brand.NIKE,
      categoryId: "",
      images: [],
      variants: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "variants",
  });

  const onSubmit = async (data: ProductFormSchema) => {
    try {
      setLoading(true);
      if (initialData) {
        await axios.patch(
          `/api/${params.storeid}/products/${params.productid}`,
          data
        );
      } else {
        await axios.post(`/api/${params.storeid}/products`, data);
      }
      router.push(`/${params.storeid}/products`);
      router.refresh();
      toast.success(initialData ? "Product updated." : "Product created.");
    } catch (error) {
      console.error("[PRODUCT_FORM_SUBMIT]", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading
          title={initialData ? "Edit Product" : "Create Product"}
          description="Manage your product information, variants, and media."
        />
      </div>
      <Separator />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* General Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>General Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input
                          disabled={loading}
                          placeholder="Product name"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Base Price ($)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          disabled={loading}
                          placeholder="99.99"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={5}
                        disabled={loading}
                        placeholder="Product description..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Media Card */}
          <Card>
            <CardHeader>
              <CardTitle>Media</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="images"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Images</FormLabel>
                    <FormControl>
                      <ImageUpload
                        value={field.value.map((image) => image.url)}
                        disabled={loading}
                        onChange={(url) =>
                          field.onChange([...field.value, { url }])
                        }
                        onRemove={(url) =>
                          field.onChange(
                            field.value.filter((img) => img.url !== url)
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Details Card */}
          <Card>
            <CardHeader>
              <CardTitle>Product Details</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      disabled={loading}
                      onValueChange={field.onChange}
                      value={field.value}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="brand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brand</FormLabel>
                    <Select
                      disabled={loading}
                      onValueChange={field.onChange}
                      value={field.value}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a brand" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(Brand).map((brand) => (
                          <SelectItem key={brand} value={brand}>
                            {brand}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="material"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Material</FormLabel>
                    <Select
                      disabled={loading}
                      onValueChange={field.onChange}
                      value={field.value}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a material" />
                        </Trigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(Material).map((material) => (
                          <SelectItem key={material} value={material}>
                            {material}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Variants Card */}
          <Card>
            <CardHeader>
              <CardTitle>Variants</CardTitle>
              <FormDescription>
                Manage product variants for different sizes, colors, and stock
                levels.
              </FormDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="p-4 border rounded-md space-y-4 relative"
                >
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => remove(index)}
                    className="absolute top-2 right-2 h-6 w-6"
                    disabled={loading}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    <FormField
                      control={form.control}
                      name={`variants.${index}.size`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Size</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select size" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Object.values(ShoeSize).map((size) => (
                                <SelectItem key={size} value={size}>
                                  {size}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`variants.${index}.color`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Color</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select color" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Object.values(ShoeColor).map((color) => (
                                <SelectItem key={color} value={color}>
                                  {color}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`variants.${index}.stock`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Stock</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="10"
                              disabled={loading}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`variants.${index}.price`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="99.99"
                              disabled={loading}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`variants.${index}.sku`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SKU</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Optional"
                              disabled={loading}
                              {...field}
                              value={field.value ?? ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  append({
                    size: ShoeSize.US9,
                    color: ShoeColor.BLACK,
                    stock: 10,
                    price: form.getValues("price") || 99.99,
                    sku: "",
                  })
                }
                disabled={loading}
              >
                Add Variant
              </Button>
              <FormMessage>
                {form.formState.errors.variants?.message || form.formState.errors.variants?.root?.message}
              </FormMessage>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" disabled={loading} className="w-full md:w-auto">
              {initialData ? "Save Changes" : "Create Product"}
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
};