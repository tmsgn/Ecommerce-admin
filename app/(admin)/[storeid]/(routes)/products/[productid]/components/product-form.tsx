"use client";
import React, { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Trash } from "lucide-react";
import { AlertModal } from "@/components/modals/alert-modal";
import ImageUpload from "@/components/image-uploader";

import { SafeProduct } from "@/types";

const productFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional().nullable(),
  price: z.number().min(0, "Price must be greater than 0"),
  isFeatured: z.boolean().optional(),
  status: z.enum(["draft", "published", "archived"]),
  catagory: z.enum(["men", "women", "kids"]),
  images: z
    .array(z.object({ url: z.string().url("Invalid image URL") }))
    .min(1, "At least one image is required"),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

interface ProductFormProps {
  initialData?: SafeProduct;
}

export const ProductForm: React.FC<ProductFormProps> = ({ initialData }) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const params = useParams();
  const router = useRouter();

  const toastMessage = initialData
    ? "Product updated successfully"
    : "Product created successfully";

  const defaultValues: ProductFormValues = {
    name: initialData?.name || "",
    description: initialData?.description || "",
    price: initialData?.price || 0,
    isFeatured: initialData?.isFeatured || false,
    status: (initialData?.status as ProductFormValues["status"]) || "draft",
    catagory: (initialData?.catagory as ProductFormValues["catagory"]) || "men",
    images: initialData?.images || [],
  };

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues,
    mode: "onChange",
  });

  const onSubmit: SubmitHandler<ProductFormValues> = async (values) => {
    try {
      setIsLoading(true);
      const payload = {
        ...values,
        description: values.description || null,
      };

      if (initialData) {
        await axios.patch(
          `/api/${params.storeid}/products/${params.productid}`,
          payload
        );
      } else {
        await axios.post(`/api/${params.storeid}/products`, payload);
      }

      toast.success(toastMessage);
      router.refresh();
      router.push(`/${params.storeid}/products`);
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  const onDelete = async () => {
    try {
      setIsLoading(true);
      await axios.delete(`/api/${params.storeid}/products/${params.productid}`);
      toast.success("Product deleted successfully.");
      router.refresh();
      router.push(`/${params.storeid}/products`);
    } catch {
      toast.error("Remove all dependencies before deleting.");
    } finally {
      setIsLoading(false);
      setOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onDelete}
        loading={isLoading}
      />

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">
          {initialData ? "Edit Product" : "Create Product"}
        </h2>
        {initialData && (
          <Button
            disabled={isLoading}
            variant="destructive"
            size="sm"
            onClick={() => setOpen(true)}
          >
            <Trash className="w-4 h-4" />
          </Button>
        )}
      </div>

      <Separator />

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Product Name</FormLabel>
                <FormControl>
                  <Input
                    disabled={isLoading}
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
            name="description"
            render={({ field }) => (
              <FormItem className="md:col-span-2 lg:col-span-1">
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter product description"
                    {...field}
                    value={field.value ?? ""}
                    disabled={isLoading}
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
                <FormLabel>Price</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="$0.00"
                    step="0.01"
                    value={field.value}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isFeatured"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-4 col-span-full">
                <FormLabel className="text-base">Featured Product</FormLabel>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={isLoading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="catagory"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={isLoading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="men">Men</SelectItem>
                    <SelectItem value="women">Women</SelectItem>
                    <SelectItem value="kids">Kids</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="images"
            render={({ field }) => (
              <FormItem className="col-span-full">
                <FormLabel>Product Images</FormLabel>
                <FormControl>
                  <ImageUpload
                    value={field.value.map((img) => img.url)}
                    disabled={isLoading}
                    onChange={(urls) =>
                      field.onChange(urls.map((url) => ({ url })))
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

          <div className="col-span-full flex justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Loading..." : initialData ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
