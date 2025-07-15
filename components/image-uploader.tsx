"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { CloudUpload, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import clsx from "clsx";

interface ImageUploadProps {
  value: string[];
  onChange: (url: string) => void;
  onRemove: (url: string) => void;
  disabled?: boolean;
}

const MAX_FILES = 6;
const MAX_SIZE_MB = 5;
const MAX_SIZE = MAX_SIZE_MB * 1024 * 1024;

export const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  onRemove,
  disabled = false,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled || uploading || value.length >= MAX_FILES) return;
    const files = e.dataTransfer.files;
    await uploadFiles(files);
  };

  const uploadFiles = async (files: FileList | null) => {
    if (!files) return;
    if (value.length + files.length > MAX_FILES) {
      toast.error(`You can only upload up to ${MAX_FILES} images.`);
      return;
    }

    setUploading(true);

    for (const file of Array.from(files)) {
      if (file.size > MAX_SIZE) {
        toast.error(`${file.name} exceeds ${MAX_SIZE_MB}MB`);
        continue;
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "my_preset");

      try {
        const res = await fetch(
          "https://api.cloudinary.com/v1_1/dqbfjahy6/image/upload",
          {
            method: "POST",
            body: formData,
          }
        );
        const data = await res.json();
        if (data.secure_url) {
          onChange(data.secure_url);
        } else {
          toast.error("Upload failed.");
        }
      } catch {
        toast.error("Upload failed.");
      }
    }

    setUploading(false);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    uploadFiles(e.target.files);
  };

  const handleClick = () => {
    if (!disabled && !uploading && value.length < MAX_FILES) {
      inputRef.current?.click();
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={clsx(
            "border-input data-[dragging=true]:bg-accent/50 relative flex min-h-52 flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed p-4 transition-colors",
            { "opacity-50 cursor-not-allowed": disabled || uploading }
        )}
        data-dragging={isDragging}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileInput}
          disabled={disabled || uploading || value.length >= MAX_FILES}
          hidden
        />
        <div className="flex flex-col items-center justify-center px-4 py-3 text-center">
          <div className="bg-background mb-2 flex size-11 shrink-0 items-center justify-center rounded-full border">
            <CloudUpload className="size-5 opacity-60" />
          </div>
          <p className="mb-1.5 text-sm font-medium">
            Drop your images here, or click to browse
          </p>
          <p className="text-muted-foreground text-xs">
            Up to {MAX_FILES} images, {MAX_SIZE_MB}MB per file
          </p>
           <Button 
            type="button" // FIX: Prevents the button from submitting the parent form
            variant="outline" 
            className="mt-4" 
            onClick={handleClick}
            disabled={disabled || uploading || value.length >= MAX_FILES}
            >
            {uploading ? "Uploading..." : "Select Images"}
          </Button>
        </div>
      </div>

      {value.length > 0 && (
        <div className="flex gap-4 flex-wrap">
          {value.map((url) => (
            <div
              key={url}
              className="relative w-24 h-24 rounded-lg overflow-hidden border"
            >
              <Image
                src={url}
                alt="Uploaded image"
                className="object-cover"
                fill
              />
              <div className="absolute top-1 right-1 z-10">
                <Button
                  type="button"
                  size="icon"
                  variant="destructive"
                  className="h-6 w-6"
                  onClick={() => onRemove(url)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};