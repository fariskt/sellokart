"use client";

import { useRef, useState } from "react";

import { Upload, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export interface ProductImage {
  id: string;
  image_url: string;
  is_primary: boolean;
  sort_order: number;
}

type ProductImageItem = {
  id?: string;
  file?: File;

  image_url: string;

  is_primary: boolean;
  sort_order: number;

  is_deleted?: boolean;
};

interface ProductImagesUploadProps {
  name?: string;
  label?: string;
  maxSize?: number;
  defaultImages?: ProductImage[];
}

export function ProductImagesUpload({
  name = "images",
  label = "Product Images",
  maxSize = 5,
  defaultImages = [],
}: ProductImagesUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const filesRef = useRef(new DataTransfer());
  const [error, setError] = useState("");

  const [images, setImages] = useState<ProductImageItem[]>(
    defaultImages.map((image) => ({
      id: image.id,
      image_url: image.image_url,
      is_primary: image.is_primary,
      sort_order: image.sort_order,
    })),
  );

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);

    if (!files.length) return;

    const maxBytes = maxSize * 1024 * 1024;

    const invalidFile = files.find((file) => file.size > maxBytes);

    if (invalidFile) {
      setError(`Each image must be smaller than ${maxSize}MB`);

      e.target.value = "";

      return;
    }

    setError("");

    const newImages: ProductImageItem[] = files.map((file, index) => ({
      file,
      image_url: URL.createObjectURL(file),

      is_primary:
        images.filter((img) => !img.is_deleted).length === 0 && index === 0,

      sort_order: images.length + index,
    }));

    files.forEach((file) => {
      filesRef.current.items.add(file);
    });

    if (inputRef.current) {
      inputRef.current.files = filesRef.current.files;
    }

    setImages((prev) => [...prev, ...newImages]);
  }

  function removeImage(index: number) {
    setImages((prev) => {
      const image = prev[index];

      if (image.file) {
        const fileImages = prev.filter((img) => img.file);

        const fileIndex = fileImages.findIndex(
          (img) => img.image_url === image.image_url,
        );

        if (fileIndex !== -1) {
          filesRef.current.items.remove(fileIndex);

          if (inputRef.current) {
            inputRef.current.files = filesRef.current.files;
          }
        }
      }

      if (image.id) {
        return prev.map((item, i) =>
          i === index
            ? {
                ...item,
                is_deleted: true,
              }
            : item,
        );
      }

      return prev.filter((_, i) => i !== index);
    });
  }

  function setPrimary(index: number) {
    setImages((prev) =>
      prev.map((image, i) => ({
        ...image,
        is_primary: i === index,
      })),
    );
  }

  function updateSortOrder(index: number, value: number) {
    setImages((prev) =>
      prev.map((image, i) =>
        i === index
          ? {
              ...image,
              sort_order: value,
            }
          : image,
      ),
    );
  }

  const visibleImages = images.filter((image) => !image.is_deleted);

  return (
    <div className="space-y-4">
      <Label>{label}</Label>

      <div
        onClick={() => inputRef.current?.click()}
        className="flex h-40 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 transition-colors hover:border-primary"
      >
        <input
          ref={inputRef}
          type="file"
          name={name}
          multiple
          accept="image/*"
          className="hidden"
          onChange={handleChange}
        />

        <Upload className="mb-2 size-8 text-muted-foreground" />

        <p className="font-medium">Upload Images</p>

        <p className="text-xs text-muted-foreground">
          PNG, JPG, WEBP • Max {maxSize}MB each
        </p>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {/* Existing Images Metadata */}
      <input
        type="hidden"
        name={`${name}_metadata`}
        value={JSON.stringify(
          images.map((image) => ({
            id: image.id,
            is_primary: image.is_primary,
            sort_order: image.sort_order,
            is_deleted: image.is_deleted ?? false,
          })),
        )}
      />

      {visibleImages.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {visibleImages.map((image) => {
            const imageIndex = images.findIndex(
              (item) =>
                item.image_url === image.image_url &&
                item.sort_order === image.sort_order,
            );

            return (
              <div
                key={`${image.id ?? image.image_url}-${image.sort_order}`}
                className="overflow-hidden rounded-lg border bg-background"
              >
                <div className="relative">
                  <img
                    src={image.image_url}
                    alt="Preview"
                    className="aspect-square w-full object-cover"
                  />

                  <button
                    type="button"
                    onClick={() => removeImage(imageIndex)}
                    className="absolute right-2 top-2 rounded-full bg-background p-1 shadow"
                  >
                    <X className="size-4" />
                  </button>

                  {image.is_primary && (
                    <div className="absolute left-2 top-2 rounded-md bg-primary px-2 py-1 text-xs font-medium text-primary-foreground">
                      Primary
                    </div>
                  )}
                </div>

                <div className="space-y-4 p-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Primary Image</Label>

                    <Switch
                      checked={image.is_primary}
                      onCheckedChange={() => setPrimary(imageIndex)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">Sort Order</Label>

                    <Input
                      type="number"
                      min={0}
                      value={image.sort_order}
                      onChange={(e) =>
                        updateSortOrder(imageIndex, Number(e.target.value || 0))
                      }
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
