"use client";
import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export const StoreModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const [storeName, setStoreName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const response = await axios.post("/api/stores", {
        name: storeName,

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
        <Button
          type="submit"
          disabled={!storeName.trim() || isLoading}
        >
          {isLoading ? "Creating..." : "Create Store"}
        </Button>
      </form>
    </Modal>
  );
};
