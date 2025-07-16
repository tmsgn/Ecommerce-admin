"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash, Plus, X } from "lucide-react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";

import {
  Category,
  Brand,
  Material,
  ShoeSize,
  ShoeColor,
  Image,
  Product,
  Variant,
} from "@prisma/client";
import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormControl,
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
import { AlertModal } from "@/components/modals/alert-modal";
import { ImageUpload } from "@/components/image-uploader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

const productFormSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().min(1, "Description is required"),
  price: z.coerce.number().min(0.01, "Price must be greater than 0"),
  images: z.array(z.object({ url: z.string().url("Invalid image URL") })).min(1, "At least one image is required"),
  mainCategoryIds: z.array(z.string()).min(1, "At least one main category"),
  subCategoryIds: z.array(z.string()).min(1, "At least one subcategory"),
  brandId: z.string().min(1, "Brand is required"),
  materialId: z.string().min(1, "Material is required"),
  variants: z.array(
    z.object({
      price: z.coerce.number().min(0, "Variant price required"),
      stock: z.coerce.number().min(0, "Stock required"),
      sku: z.string().optional().nullable(),
      sizeId: z.string().min(1, "Size is required"),
      colorId: z.string().min(1, "Color is required"),
    })
  ).min(1, "At least one variant is required"),
});

type ProductFormType = z.infer<typeof productFormSchema>;

interface ProductFormProps {
  initialData: ProductFormType | null;
  categories: Category[];
  brands: Brand[];
  materials: Material[];
  sizes: ShoeSize[];
  colors: ShoeColor[];
}

export const ProductForm: React.FC<ProductFormProps> = ({
  initialData,
  categories,
  brands,
  materials,
  sizes,
  colors,
}) => {
  const params = useParams();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const title = initialData ? "Edit product" : "Create product";
  const toastMessage = initialData ? "Product updated." : "Product created.";
  const action = initialData ? "Save changes" : "Create";

  const form = useForm({
    resolver: zodResolver(productFormSchema),
    defaultValues: initialData || {
      name: "",
      description: "",
      price: 0,
      images: [],
      mainCategoryIds: [],
      subCategoryIds: [],
      brandId: "",
      materialId: "",
      variants: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "variants",
  });

  const onSubmit = async (data: ProductFormType) => {
    // Only keep the variant toast error for empty size/color (should be rare now)
    const invalidVariant = data.variants.some(
      (v) => !v.sizeId || !v.colorId
    );
    if (invalidVariant) {
      toast.error("All variants must have a size and color selected.");
      return;
    }
    // No need to convert price/stock to number, Zod handles it
    try {
      setLoading(true);
      if (initialData) {
        await axios.patch(
          `/api/stores/${params.storeid}/products/${params.productid}`,
          data
        );
      } else {
        await axios.post(`/api/stores/${params.storeid}/products`, data);
      }
      router.refresh();
      router.push(`/${params.storeid}/products`);
      toast.success(toastMessage);
    } catch (error) {
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async () => {
    /* ... delete logic ... */
  };

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onDelete}
        loading={loading}
      />
      <div className="flex items-center justify-between">
        <Heading
          title={title}
          description="Manage product details, variants, and organization."
        />
        {initialData && (
          <Button
            disabled={loading}
            variant="destructive"
            size="sm"
            onClick={() => setOpen(true)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        )}
      </div>
      <Separator />

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8 w-full"
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>General Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        {" "}
                        <FormLabel>Name</FormLabel>{" "}
                        <FormControl>
                          <Input
                            disabled={loading}
                            placeholder="Product name"
                            {...field}
                          />
                        </FormControl>{" "}
                        <FormMessage />{" "}
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>{" "}
                        <FormControl>
                          <Textarea
                            disabled={loading}
                            rows={5}
                            placeholder="Product description"
                            {...field}
                          />
                        </FormControl>{" "}
                        <FormMessage />{" "}
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        {" "}
                        <FormLabel>Base Price</FormLabel>{" "}
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            disabled={loading}
                            {...field}
                            value={typeof field.value === 'number' ? field.value : Number(field.value) || 0}
                          />
                        </FormControl>{" "}
                        <FormMessage />{" "}
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

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
                        <FormControl>
                          <ImageUpload
                            value={field.value.map((image) => image.url)}
                            onChange={(
                              url: string // FIX: Add type 'string'
                            ) => field.onChange([...field.value, { url }])}
                            onRemove={(
                              url: string // FIX: Add type 'string'
                            ) =>
                              field.onChange([
                                ...field.value.filter(
                                  (current) => current.url !== url
                                ),
                              ])
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Variants</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {fields.map((field, index) => (
                    <div
                      key={field.id}
                      className="grid grid-cols-12 gap-4 items-end border p-4 rounded-md relative"
                    >
                      <div className="col-span-6 md:col-span-3">
                        {" "}
                        <FormField
                          control={form.control}
                          name={`variants.${index}.sizeId`}
                          render={({ field }) => (
                            <FormItem>
                              {" "}
                              <FormLabel>Size</FormLabel>{" "}
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                                defaultValue={field.value}
                              >
                                {" "}
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select size" />
                                  </SelectTrigger>
                                </FormControl>{" "}
                                <SelectContent>
                                  {sizes.map((s) => (
                                    <SelectItem key={s.id} value={s.id}>
                                      {s.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>{" "}
                              </Select>{" "}
                              <FormMessage />{" "}
                            </FormItem>
                          )}
                        />{" "}
                      </div>
                      <div className="col-span-6 md:col-span-3">
                        {" "}
                        <FormField
                          control={form.control}
                          name={`variants.${index}.colorId`}
                          render={({ field }) => (
                            <FormItem>
                              {" "}
                              <FormLabel>Color</FormLabel>{" "}
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                                defaultValue={field.value}
                              >
                                {" "}
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select color" />
                                  </SelectTrigger>
                                </FormControl>{" "}
                                <SelectContent>
                                  {colors.map((c) => (
                                    <SelectItem key={c.id} value={c.id}>
                                      {c.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>{" "}
                              </Select>{" "}
                              <FormMessage />{" "}
                            </FormItem>
                          )}
                        />{" "}
                      </div>
                      <div className="col-span-6 md:col-span-2">
                        {" "}
                        <FormField
                          control={form.control}
                          name={`variants.${index}.price`}
                          render={({ field }) => (
                            <FormItem>
                              {" "}
                              <FormLabel>Price</FormLabel>{" "}
                              <FormControl>
                                <Input type="number" step="0.01" {...field} value={typeof field.value === 'number' ? field.value : Number(field.value) || 0} />
                              </FormControl>
                              <FormMessage />{" "}
                            </FormItem>
                          )}
                        />{" "}
                      </div>
                      <div className="col-span-6 md:col-span-2">
                        {" "}
                        <FormField
                          control={form.control}
                          name={`variants.${index}.stock`}
                          render={({ field }) => (
                            <FormItem>
                              {" "}
                              <FormLabel>Stock</FormLabel>{" "}
                              <FormControl>
                                <Input type="number" {...field} value={typeof field.value === 'number' ? field.value : Number(field.value) || 0} />
                              </FormControl>
                              <FormMessage />{" "}
                            </FormItem>
                          )}
                        />{" "}
                      </div>
                      <div className="col-span-12 md:col-span-1">
                        {" "}
                        <Button
                          type="button"
                          size="icon"
                          variant="destructive"
                          onClick={() => remove(index)}
                        >
                          {" "}
                          <X className="h-4 w-4" />{" "}
                        </Button>{" "}
                      </div>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      append({
                        price: initialData?.price || 0,
                        stock: 0,
                        sizeId: "",
                        colorId: "",
                      })
                    }
                  >
                    {" "}
                    <Plus className="mr-2 h-4 w-4" /> Add Variant{" "}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Right Column */}
            <div className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Organization</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="mainCategoryIds"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Main Categories</FormLabel>
                        <div className="flex flex-col gap-2">
                          {categories.filter((main) => !main.parentId).map((main) => (
                            <label key={main.id} className="flex items-center gap-2">
                              <Checkbox
                                checked={field.value?.includes(main.id)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    field.onChange([...field.value, main.id]);
                                  } else {
                                    field.onChange(field.value.filter((id) => id !== main.id));
                                  }
                                }}
                              />
                              {main.name}
                            </label>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="subCategoryIds"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subcategories</FormLabel>
                        <div className="flex flex-col gap-2">
                          {categories.filter((sub) => sub.parentId && form.watch("mainCategoryIds").includes(sub.parentId)).map((sub) => (
                            <label key={sub.id} className="flex items-center gap-2">
                              <Checkbox
                                checked={field.value?.includes(sub.id)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    field.onChange([...field.value, sub.id]);
                                  } else {
                                    field.onChange(field.value.filter((id) => id !== sub.id));
                                  }
                                }}
                              />
                              {sub.name}
                            </label>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="brandId"
                    render={({ field }) => (
                      <FormItem>
                        {" "}
                        <FormLabel>Brand</FormLabel>{" "}
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || ""}
                          defaultValue={field.value || ""}
                        >
                          {" "}
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a brand" />
                            </SelectTrigger>
                          </FormControl>{" "}
                          <SelectContent>
                            {brands.map((b) => (
                              <SelectItem key={b.id} value={b.id}>
                                {b.name}
                              </SelectItem>
                            ))}
                          </SelectContent>{" "}
                        </Select>{" "}
                        <FormMessage />{" "}
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="materialId"
                    render={({ field }) => (
                      <FormItem>
                        {" "}
                        <FormLabel>Material</FormLabel>{" "}
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || ""}
                          defaultValue={field.value || ""}
                        >
                          {" "}
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a material" />
                            </SelectTrigger>
                          </FormControl>{" "}
                          <SelectContent>
                            {materials.map((m) => (
                              <SelectItem key={m.id} value={m.id}>
                                {m.name}
                              </SelectItem>
                            ))}
                          </SelectContent>{" "}
                        </Select>{" "}
                        <FormMessage />{" "}
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
          <div className="w-full flex justify-end">
            <Button disabled={loading} type="submit">
              {action}
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
};
