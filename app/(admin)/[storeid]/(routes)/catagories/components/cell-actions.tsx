"use client";

import React, { useState } from "react";
import { CatagoryColumn } from "./columns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Check, Copy, Edit, MoreHorizontal, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { AlertModal } from "@/components/modals/alert-modal";
import { toast } from "sonner";

interface CellActionProps {
  data: CatagoryColumn;
}
export const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const params = useParams();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const onCopy = (id: string) => {
    setCopied(true);
    navigator.clipboard.writeText(id);
    setTimeout(() => {
      setCopied(false);
    }, 1000);
  };

  const onDelete = async () => {
    try {
      setLoading(true);
      await axios.delete(`/api/stores/${params.storeid}/catagories/${data.id}`);
      router.push(`/${params.storeid}/catagories`);
      toast.success("Catagory deleted successfully");
    } catch (error) {
      toast.error(
        "Make sure you removed all products using this catagory first."
      );
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onDelete}
        loading={loading}
      />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant={"ghost"} className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => onCopy(data.id)} disabled={loading}>
            {copied ? (
              <Check className="mr-2 h-4 w-4" />
            ) : (
              <Copy className="mr-2 h-4 w-4" />
            )}
            Copy Id
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              router.push(`/${params.storeid}/catagories/${data.id}`)
            }
          >
            <Edit className="mr-2 h-4 w-4" />
            Update
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpen(true)} disabled={loading}>
            <Trash className="mr-2 text-red-800 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
