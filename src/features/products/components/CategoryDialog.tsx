"use client";

import { AppDialog } from "@/components/AppDialog";
import { CategoryForm } from "./CategoryForm";
import { SubmitButton } from "@/components/common/SubmitButton";
import type { Category } from "../lib/category.actions";

interface CategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;

  mode: "create" | "edit";

  category?: Category;

  categories: Category[];
}

export function CategoryDialog({
  open,
  onOpenChange,
  mode,
  category,
  categories,
}: CategoryDialogProps) {
  const isEdit = mode === "edit";

  return (
    <AppDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Edit Category" : "Create Category"}
      description={isEdit ? "Update category details." : "Add a new category."}
      size="lg"
      footer={
        <SubmitButton
          mode={mode}
          createText="Create Category"
          form="category-form"
          updateText="Update Category"
        />
      }
    >
      <CategoryForm
        key={category?.id ?? "new-category"}
        mode={mode}
        category={category}
        categories={categories}
        onSuccess={() => onOpenChange(false)}
      />
    </AppDialog>
  );
}
