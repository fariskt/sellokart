"use client";

import { AppSelect } from "@/components/AppSelect";
import { ImageUpload } from "@/components/common/ImageUploader";
import { Input } from "@/components/ui/input";
import { createCategory, updateCategory } from "../lib/category.actions";
import { toast } from "sonner";
import { useMemo, useState } from "react";

import type { Category } from "../lib/category.actions";

interface Props {
  mode: "create" | "edit";

  category?: Category;

  categories: Category[];

  onSuccess: () => void;
}

export function CategoryForm({ mode, category, categories, onSuccess }: Props) {
  const [name, setName] = useState(category?.name ?? "");
  const [slug, setSlug] = useState(category?.slug ?? "");
  const [slugEdited, setSlugEdited] = useState(Boolean(category?.slug));

  const parentOptions = useMemo(
    () =>
      categories
        .filter((option) => option.id !== category?.id)
        .filter((option) => !isDescendant(option.id, category?.id, categories))
        .map((option) => ({
          label: option.name,
          value: option.id,
        })),
    [categories, category?.id],
  );

  function handleNameChange(value: string) {
    setName(value);

    if (!slugEdited) {
      setSlug(generateSlug(value));
    }
  }

  async function handleSubmit(formData: FormData) {
    const result =
      mode === "create"
        ? await createCategory(formData)
        : await updateCategory(category!.id, formData);

    if (result.success) {
      toast.success(result.message);
      onSuccess();
    } else {
      toast.error(result.message);
    }
  }

  return (
    <form id="category-form" action={handleSubmit} className="space-y-6">
      <section className="space-y-4 rounded-lg border border-border p-4">
        <h3 className="text-sm font-semibold text-foreground">
          Basic Information
        </h3>

        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Category Name"
            name="name"
            placeholder="Electronics"
            value={name}
            onChange={(event) => handleNameChange(event.target.value)}
            required
          />

          <Input
            label="Slug"
            name="slug"
            placeholder="electronics"
            value={slug}
            onChange={(event) => {
              setSlugEdited(true);
              setSlug(generateSlug(event.target.value));
            }}
            required
          />
        </div>
      </section>

      <section className="space-y-4 rounded-lg border border-border p-4">
        <h3 className="text-sm font-semibold text-foreground">
          Parent Category
        </h3>

        <AppSelect
          name="parent_id"
          placeholder="Select parent category"
          defaultValue={category?.parent_id ?? "none"}
          options={[
            {
              label: "No Parent",
              value: "none",
            },
            ...parentOptions,
          ]}
        />
      </section>

      <section className="space-y-4 rounded-lg border border-border p-4">
        <h3 className="text-sm font-semibold text-foreground">
          Category Image
        </h3>

        <ImageUpload
          name="image"
          defaultImage={category?.image_url}
          maxSize={1}
          removeName="remove_image"
        />
      </section>
    </form>
  );
}

function generateSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function isDescendant(
  candidateId: string,
  categoryId: string | undefined,
  categories: Category[],
) {
  if (!categoryId) return false;

  let cursor: string | null = candidateId;
  const visited = new Set<string>();

  while (cursor) {
    if (cursor === categoryId) return true;
    if (visited.has(cursor)) return false;

    visited.add(cursor);
    cursor =
      categories.find((category) => category.id === cursor)?.parent_id ?? null;
  }

  return false;
}
