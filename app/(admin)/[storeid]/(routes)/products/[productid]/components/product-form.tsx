"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash, Plus, X } from "lucide-react";

import {
  Product,
  Image,
  ProductVariant,
  Category,
  Option,
  OptionValue,
  ProductStatus,
  DiscountType,
} from "@prisma/client";

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
import { AlertModal } from "@/components/modals/alert-modal";
import { ImageUpload } from "@/components/image-uploader";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const formSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  status: z.nativeEnum(ProductStatus),
  images: z.object({ url: z.string() }).array().min(1),
  categories: z.string().array(),
  options: z.string().array(),
  variants: z
    .object({
      price: z.coerce.number(),
      inventory: z.coerce.number(),
      sku: z.string().optional(),
      discountType: z.nativeEnum(DiscountType).optional(),
      discountValue: z.coerce.number().optional(),
      optionValueIds: z.string().array(),
    })
    .array(),
});

type ProductFormValues = z.infer<typeof formSchema>;

interface ProductFormProps {
  initialData:
    | (Product & {
        images: Image[];
        variants: (ProductVariant & { optionValues: OptionValue[] })[];
        options: Option[];
        categories: Category[];
      })
    | null;
  categories: Category[];
  options: (Option & { values: OptionValue[] })[];
}

export const ProductForm: React.FC<ProductFormProps> = ({
  initialData,
  categories,
  options,
}) => {
  const params = useParams();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const title = initialData ? "Edit product" : "Create product";
  const description = initialData
    ? "Edit your product details."
    : "Add a new product.";
  const toastMessage = initialData ? "Product updated." : "Product created.";
  const action = initialData ? "Save changes" : "Create";

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
      ? {
          ...initialData,
          description: initialData.description || "",
          categories: initialData.categories.map((c) => c.id),
          options: initialData.options.map((o) => o.id),
          variants: initialData.variants.map((v) => ({
            price: parseFloat(String(v.price)),
            inventory: v.inventory,
            sku: v.sku || undefined,
            discountType: v.discountType || undefined,
            discountValue: v.discountValue
              ? parseFloat(String(v.discountValue))
              : undefined,
            optionValueIds: v.optionValues.map((ov) => ov.id),
          })),
        }
      : {
          title: "",
          description: "",
          status: ProductStatus.DRAFT,
          images: [],
          categories: [],
          options: [],
          variants: [],
        },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "variants",
  });

  const selectedOptionIds = form.watch("options");
  const selectedOptions = options.filter((option) =>
    selectedOptionIds.includes(option.id)
  );

  const handleOptionSelect = (optionId: string) => {
    const currentOptions = form.getValues("options");
    const newOptions = currentOptions.includes(optionId)
      ? currentOptions.filter((id) => id !== optionId)
      : [...currentOptions, optionId];
    form.setValue("options", newOptions);
  };

  const onSubmit = async (data: ProductFormValues) => {
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
        <Heading title={title} description={description} />
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
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        {" "}
                        <FormLabel>Title</FormLabel>{" "}
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
                        {" "}
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
                          {/* Wrap ImageUpload in a div to ensure only a single child for FormControl */}
                          <div>
                            <ImageUpload
                              value={field.value.map((image) => image.url)}
                              disabled={loading}
                              onChange={(url: string) =>
                                field.onChange([...field.value, { url }])
                              }
                              onRemove={(url: string) =>
                                field.onChange([
                                  ...field.value.filter(
                                    (current) => current.url !== url
                                  ),
                                ])
                              }
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Options</CardTitle>
                  <CardDescription>
                    Select the types of options this product has (e.g., Color,
                    Size).
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {options.map((option) => (
                      <Button
                        key={option.id}
                        type="button"
                        variant={
                          selectedOptionIds.includes(option.id)
                            ? "default"
                            : "outline"
                        }
                        onClick={() => handleOptionSelect(option.id)}
                      >
                        {" "}
                        {option.name}{" "}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Variants</CardTitle>
                  <CardDescription>
                    Configure the price and stock for each product variant.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {fields.map((field, index) => (
                    <div
                      key={field.id}
                      className="grid grid-cols-12 gap-4 items-end border p-4 rounded-md relative"
                    >
                      {selectedOptions.map((option) => (
                        <div
                          key={option.id}
                          className="col-span-6 md:col-span-3"
                        >
                          <FormField
                            control={form.control}
                            name={`variants.${index}.optionValueIds`}
                            render={({ field: fieldArray }) => (
                              <FormItem>
                                <FormLabel>{option.name}</FormLabel>
                                <Select
                                  onValueChange={(valueId) => {
                                    const currentValues =
                                      fieldArray.value || [];
                                    const otherValues = currentValues.filter(
                                      (id) =>
                                        !option.values.some((v) => v.id === id)
                                    );
                                    fieldArray.onChange([
                                      ...otherValues,
                                      valueId,
                                    ]);
                                  }}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select..." />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {option.values.map((value) => (
                                      <SelectItem
                                        key={value.id}
                                        value={value.id}
                                      >
                                        {value.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      ))}
                      <div className="col-span-6 md:col-span-3">
                        {" "}
                        <FormField
                          control={form.control}
                          name={`variants.${index}.price`}
                          render={({ field }) => (
                            <FormItem>
                              {" "}
                              <FormLabel>Price</FormLabel>{" "}
                              <FormControl>
                                <Input type="number" step="0.01" {...field} />
                              </FormControl>
                              <FormMessage />{" "}
                            </FormItem>
                          )}
                        />{" "}
                      </div>
                      <div className="col-span-6 md:col-span-3">
                        {" "}
                        <FormField
                          control={form.control}
                          name={`variants.${index}.inventory`}
                          render={({ field }) => (
                            <FormItem>
                              {" "}
                              <FormLabel>Inventory</FormLabel>{" "}
                              <FormControl>
                                <Input type="number" {...field} />
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
                          name={`variants.${index}.sku`}
                          render={({ field }) => (
                            <FormItem>
                              {" "}
                              <FormLabel>SKU</FormLabel>{" "}
                              <FormControl>
                                <Input {...field} />
                              </FormControl>{" "}
                            </FormItem>
                          )}
                        />{" "}
                      </div>
                      <div className="col-span-1 flex items-center">
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
                  {selectedOptions.length > 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        append({
                          price: 0,
                          inventory: 0,
                          sku: "",
                          optionValueIds: [],
                        })
                      }
                    >
                      {" "}
                      <Plus className="mr-2 h-4 w-4" /> Add Variant{" "}
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column */}
            <div className="space-y-8">
              <Card>
                <CardHeader>
                  {" "}
                  <CardTitle>Status</CardTitle>{" "}
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        {" "}
                        <Select
                          disabled={loading}
                          onValueChange={field.onChange}
                          value={field.value}
                          defaultValue={field.value}
                        >
                          {" "}
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue
                                defaultValue={field.value}
                                placeholder="Select status"
                              />
                            </SelectTrigger>
                          </FormControl>{" "}
                          <SelectContent>
                            {" "}
                            <SelectItem value={ProductStatus.DRAFT}>
                              Draft
                            </SelectItem>{" "}
                            <SelectItem value={ProductStatus.PUBLISHED}>
                              Published
                            </SelectItem>{" "}
                          </SelectContent>{" "}
                        </Select>{" "}
                        <FormMessage />{" "}
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  {" "}
                  <CardTitle>Organization</CardTitle>{" "}
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="categories"
                    render={() => (
                      <FormItem>
                        <FormLabel>Categories</FormLabel>
                        <div className="space-y-2 pt-2">
                          {categories.map((item) => (
                            <FormField
                              key={item.id}
                              control={form.control}
                              name="categories"
                              render={({ field }) => (
                                <FormItem
                                  key={item.id}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(item.id)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([
                                              ...field.value,
                                              item.id,
                                            ])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== item.id
                                              )
                                            );
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    {item.name}
                                  </FormLabel>
                                </FormItem>
                              )}
                            />
                          ))}
                        </div>
                        <FormMessage />
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
