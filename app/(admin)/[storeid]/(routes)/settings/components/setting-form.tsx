"use client";
import { AlertModal } from "@/components/modals/alert-modal";
import { Alert } from "@/components/ui/alert";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Store } from "@/lib/generated/prisma";
import axios from "axios";
import { Trash } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

interface SettingsFormProps {
  initialData: Store;
}

const settingsFormSchema = z.object({
  name: z.string().min(1, "Store name is required"),
});
type SettingsFormValues = z.infer<typeof settingsFormSchema>;

export const SettingsForm: React.FC<SettingsFormProps> = ({ initialData }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setOpen] = useState(false);
  const [storeType, setStoreType] = useState(initialData.type || "Shoe store");

  const params = useParams();
  const router = useRouter();

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: {
      name: initialData.name,
    },
  });

  const onSubmit = async (values: SettingsFormValues) => {
    try {
      setIsLoading(true);
      await axios.patch(`/api/stores/${params.storeid}`, {
        ...values,
        type: storeType,
      });
      toast.success("Store settings updated successfully");
      router.push(`/`);
    } catch (error) {
      toast.error("Failed to update store settings");
      console.error("Failed to update store settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const onDelete = async () => {
    try {
      setIsLoading(true);
      await axios.delete(`/api/stores/${params.storeid}`);
      toast.success("Store deleted successfully");
      router.push("/");
      window.location.reload();
    } catch (error) {
      toast.error("Failed to delete store");
    } finally {
      setIsLoading(false);
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
        <Heading title="Settings" description="Manage Store preference" />
        <Button
          disabled={isLoading}
          variant="destructive"
          size="sm"
          onClick={() => setOpen(true)}
        >
          <Trash className="h-4 w-4" />
          Delete
        </Button>
      </div>
      <Separator />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8 w-full"
        >
          <div className="md:grid grid-cols-3 gap-8">
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
          </div>
          <Button disabled={isLoading} className="ml-auto" type="submit">
            {isLoading ? "Loading..." : "Save changes"}
          </Button>
        </form>
      </Form>
      <Separator />
    </>
  );
};
