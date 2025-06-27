"use client";
import { AlertModal } from "@/components/modals/alert-modal";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Heading } from "@/components/ui/heading";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Catagory } from "@/lib/generated/prisma";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { Trash } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

const formSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
});

type CatagoryFormValues = z.infer<typeof formSchema>;

interface CatagoryFormProps {
  initialData: Catagory | null;
}

export const CatagoryForm: React.FC<CatagoryFormProps> = ({ initialData }) => {
  const params = useParams();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const title = initialData ? "Edit Catagory" : "Add Catagory";
  const description = initialData
    ? "Update an existing catagory."
    : "Create a new catagory.";
  const toastMessage = initialData ? "Catagory updated." : "Catagory created.";
  const action = initialData ? "Save changes" : "Create";

  const form = useForm<CatagoryFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      name: "",
    },
  });

  const onSubmit = async (values: CatagoryFormValues) => {
    try {
      setIsLoading(true);
      if (initialData) {
        await axios.patch(
          `/api/stores/${params.storeid}/catagories/${params.catagoryid}`,
          values
        );
      } else {
        await axios.post(`/api/stores/${params.storeid}/catagories`, values);
      }
      router.push(`/${params.storeid}/catagories`);
      toast.success(toastMessage);
    } catch (error) {
      toast.error("Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  const onDelete = async () => {
    try {
      setIsLoading(true);
      await axios.delete(
        `/api/stores/${params.storeid}/catagories/${params.catagoryid}`
      );
      router.refresh();
      router.push(`/${params.storeid}/catagories`);
      toast.success("Catagory deleted.");
    } catch (error) {
      toast.error(
        "Make sure you removed all products using this catagory first."
      );
    } finally {
      setIsLoading(false);
      setOpen(false);
    }
  };

  return (
    <div className="space-y-8 ">
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onDelete}
        loading={isLoading}
      />
      <div className="flex items-center justify-between w-full">
        <Heading title={title} description={description} />
        {initialData && (
          <Button
            disabled={isLoading}
            variant="destructive"
            size="sm"
            onClick={() => {
              setOpen(true);
            }}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isLoading}
                      placeholder="Catagory name.."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button disabled={isLoading} className="ml-auto" type="submit">
            {isLoading ? "Loading..." : action}
          </Button>
        </form>
      </Form>
      <Separator />
    </div>
  );
};
