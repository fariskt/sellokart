"use client";

import { useTransition } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Button } from "@/components/ui/button";

import {
  Edit,
  Eye,
  MoreHorizontal,
  Trash,
} from "lucide-react";
import { deleteCategory } from "../lib/category.actions";
import { toast } from "sonner";
import type { Category } from "../lib/category.actions";


interface Props {
  category: Category;
  onView: (category: Category) => void;
  onEdit: (category: Category) => void;
}

export function CategoryRowActions({
  category,
  onView,
  onEdit,
}: Props) {
  const [isPending, startTransition] =
    useTransition();

  function handleDelete() {
    const confirmed = window.confirm(
      `Delete "${category.name}"?`
    );

    if (!confirmed) return;

    startTransition(async () => {
      const result = await deleteCategory(category.id);

      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
        >
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onView(category)}>
          <Eye className="mr-2 size-4" />
          View
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => onEdit(category)}
        >
          <Edit className="mr-2 size-4" />
          Edit
        </DropdownMenuItem>

        <DropdownMenuItem
          disabled={isPending}
          onClick={handleDelete}
          className="text-destructive focus:text-destructive"
        >
          <Trash className="mr-2 size-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
