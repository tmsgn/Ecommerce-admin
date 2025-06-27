"use client";
import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { toast } from "sonner";

export const StoreModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const [storeName, setStoreName] = useState("");
  const [storeType, setStoreType] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const response = await axios.post("/api/stores", {
        name: storeName,
        type: storeType,
      });
      toast.success("Store created successfully");
      window.location.assign(`/${response.data.id}`);
    } catch (error) {
      toast.error("Failed to create store");
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      title="Create a Store"
      description="You don't have a store yet. Please create one to continue."
      isOpen={isOpen}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
        <Input
          placeholder="Store name"
          value={storeName}
          onChange={(e) => setStoreName(e.target.value)}
          required
          autoFocus
        />
        <Select value={storeType} onValueChange={setStoreType}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Store type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Shoe store">Shoe store</SelectItem>
            <SelectItem value="Cloth store">Cloth store</SelectItem>
            <SelectItem value="Electronics store">Electronics store</SelectItem>
          </SelectContent>
        </Select>
        <Button
          type="submit"
          disabled={!storeName.trim() || !storeType || isLoading}
        >
          {isLoading ? "Creating..." : "Create Store"}
        </Button>
      </form>
    </Modal>
  );
};
