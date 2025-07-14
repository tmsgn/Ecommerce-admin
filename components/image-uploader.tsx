"use client";

import { AlertCircleIcon, ImageIcon, UploadIcon, XIcon } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface UploadedFile {
  id: string;
  url: string;
  name: string;
  size: number;
  type: string;
}

interface CloudinaryUploaderProps {
  value: string[];
  onChange: (url: string) => void;
  onRemove: (url: string) => void;
  disabled?: boolean;
}

const MAX_FILES = 6;
const MAX_SIZE_MB = 5;
const MAX_SIZE = MAX_SIZE_MB * 1024 * 1024;

export const ImageUpload: React.FC<CloudinaryUploaderProps> = ({
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
    if (disabled || uploading || value.length >= MAX_FILES) return;
    const files = e.dataTransfer.files;
    await uploadFiles(files);
    setIsDragging(false);
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
    <div className="flex flex-col gap-2">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className="border-input data-[dragging=true]:bg-accent/50 relative flex min-h-52 flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed p-4 transition-colors"
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileInput}
          hidden
        />
        <div className="flex flex-col items-center justify-center px-4 py-3 text-center">
          <div className="bg-background mb-2 flex size-11 shrink-0 items-center justify-center rounded-full border">
            <ImageIcon className="size-4 opacity-60" />
          </div>
          <p className="mb-1.5 text-sm font-medium">Drop your images here</p>
          <p className="text-muted-foreground text-xs">
            JPG, PNG, SVG, GIF (max. {MAX_SIZE_MB}MB)
          </p>
          <Button variant="outline" className="mt-4" onClick={handleClick}>
            <UploadIcon className="-ms-1 opacity-60" />
            Select images
          </Button>
        </div>
      </div>

      {value.length > 0 && (
        <div className="flex gap-2">
          {value.map((url) => (
            <div
              key={url}
              className="bg-background flex items-center justify-between gap-2 rounded-lg border p-2 pe-3"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="bg-accent aspect-square shrink-0 rounded">
                  <img
                    src={url}
                    alt="Uploaded"
                    className="size-10 rounded-[inherit] object-cover"
                  />
                </div>
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="text-muted-foreground/80 hover:text-foreground -me-2 size-8 hover:bg-transparent"
                onClick={() => onRemove(url)}
              >
                <XIcon />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
