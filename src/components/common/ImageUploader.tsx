"use client";

import { useRef, useState } from "react";

import { Upload, X } from "lucide-react";

import { cn } from "@/lib/utils";

interface ImageUploadProps {
  name?: string;
  label?: string;
  defaultImage?: string | null;
  maxSize?: number; // MB
}

export function ImageUpload({
  name = "image",
  label = "Image",
  defaultImage,
  maxSize = 5,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const [preview, setPreview] = useState<string | null>(
    defaultImage ?? null
  );

  const [error, setError] = useState("");

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];

    if (!file) return;

    const maxBytes =
      maxSize * 1024 * 1024;

    if (file.size > maxBytes) {
      setError(
        `Image must be smaller than ${maxSize}MB`
      );

      e.target.value = "";

      return;
    }

    setError("");

    setPreview(
      URL.createObjectURL(file)
    );
  }

  function removeImage() {
    setPreview(null);
    setError("");

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">
        {label}
      </label>

      <div
        onClick={() =>
          inputRef.current?.click()
        }
        className={cn(
          "group relative flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed transition-colors",
          preview
            ? "h-56 overflow-hidden border-border"
            : "h-40 border-muted-foreground/25 hover:border-primary"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          name={name}
          accept="image/*"
          className="hidden"
          onChange={handleChange}
        />

        {preview ? (
          <>
            <img
              src={preview}
              alt="Preview"
              className="h-full w-full object-cover"
            />

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeImage();
              }}
              className="absolute right-3 top-3 rounded-full bg-background p-2 shadow"
            >
              <X className="size-4" />
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Upload className="size-8" />

            <div className="text-center">
              <p className="font-medium">
                Upload image
              </p>

              <p className="text-xs">
                PNG, JPG, WEBP • Max{" "}
                {maxSize}MB
              </p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}