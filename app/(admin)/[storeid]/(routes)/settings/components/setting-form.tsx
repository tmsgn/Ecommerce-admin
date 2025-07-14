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
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ApiAlert } from "@/components/ui/api-alert";
import { Trash } from "lucide-react";

const settingsFormSchema = z.object({
  name: z.string().min(1, "Store name is required."),
  description: z.string().optional(),
});

type SettingsFormValues = z.infer<typeof settingsFormSchema>;

interface SettingsFormProps {
  initialData: SettingsFormValues;
}

export const SettingsForm: React.FC<SettingsFormProps> = ({ initialData }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setOpen] = useState(false);
  const params = useParams();
  const router = useRouter();

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: initialData,
  });

  const onSubmit = async (values: SettingsFormValues) => {
    try {
      setIsLoading(true);
      await axios.patch(`/api/stores/${params.storeid}`, values);
      window.location.assign(`/${params.storeid}`);
      toast.success("Store settings updated successfully.");
    } catch (error) {
      toast.error("Failed to update store settings.");
    } finally {
      setIsLoading(false);
    }
  };

  const onDelete = async () => {
    try {
      setIsLoading(true);
      await axios.delete(`/api/stores/${params.storeid}`);
      router.refresh();
      router.push("/");
      toast.success("Store deleted successfully.");
    } catch (error) {
      toast.error("Make sure you removed all products and categories first.");
    } finally {
      setIsLoading(false);
      setOpen(false);
    }
  };

  return (
    <>
      <AlertModal
        isOpen={isOpen}
        onClose={() => setOpen(false)}
        onConfirm={onDelete}
        loading={isLoading}
      />
      <div className="flex items-center justify-between">
        <Heading title="Settings" description="Manage Store preferences" />
        <Button
          disabled={isLoading}
          variant="destructive"
          size="sm"
          onClick={() => setOpen(true)}
        >
          <Trash className="h-4 w-4" />
        </Button>
      </div>
      <Separator />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8 w-full"
        >
          <div className="md:grid md:grid-cols-3 gap-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isLoading}
                      placeholder="Store name"
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
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      disabled={isLoading}
                      placeholder="A short description about your store"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button disabled={isLoading} className="ml-auto" type="submit">
            {isLoading ? "Saving..." : "Save changes"}
          </Button>
        </form>
      </Form>
      <Separator />
      <Heading
        title="API"
        description="API calls for this store"
      />
      <ApiAlert
        title="NEXT_PUBLIC_API_URL"
        description={`/api/stores/${params.storeid}`}
        variant="public"
      />
    </>
  );
};