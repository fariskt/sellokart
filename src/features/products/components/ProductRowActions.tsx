"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Button } from "@/components/ui/button";

import { MoreHorizontal } from "lucide-react";
import { deleteProduct, toggleFeatured } from "../lib/action";


interface Props {
  product: any;
  onEdit: (product: any) => void;
}

export function ProductRowActions({
  product,
  onEdit,
}: Props) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        asChild
      >
        <Button
          variant="ghost"
          size="icon-sm"
        >
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() =>
            onEdit(product)
          }
        >
          Edit
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() =>
            toggleFeatured(
              product.id,
              !product.featured
            )
          }
        >
          {product.featured
            ? "Remove Featured"
            : "Make Featured"}
        </DropdownMenuItem>

        <DropdownMenuItem
          className="text-destructive"
          onClick={() =>
            deleteProduct(product.id)
          }
        >
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}