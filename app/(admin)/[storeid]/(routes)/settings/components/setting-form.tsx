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
import { toast } from "sonner";

interface SettingsFormProps {
  initialData: Store;
}

type SettingsFormValues = {
  name: string;
};

export const SettingsForm: React.FC<SettingsFormProps> = ({ initialData }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setOpen] = useState(false);
  const [storeType, setStoreType] = useState(initialData.type || "Shoe store");

  const params = useParams();
  const router = useRouter();

  const form = useForm<SettingsFormValues>({
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
                  <div className="mt-2">
                    <Select value={storeType} onValueChange={setStoreType}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Store type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Shoe store">Shoe store</SelectItem>
                        <SelectItem value="Cloth store">Cloth store</SelectItem>
                        <SelectItem value="Electronics store">
                          Electronics store
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
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
