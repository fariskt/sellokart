import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CategoryRowActions } from "./CategoryRowActions";
import { TableImage } from "@/components/common/TableImage";
import type { Category } from "../lib/category.actions";

interface Props {
  categories: Category[];

  onView: (category: Category) => void;
  onEdit: (category: Category) => void;
}

export function CategoriesTable({ categories, onView, onEdit }: Props) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-2xs">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Image</TableHead>

            <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Name</TableHead>

            <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Slug</TableHead>

            <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Parent Category</TableHead>

            <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Created At</TableHead>

            <TableHead className="w-14" />
          </TableRow>
        </TableHeader>

        <TableBody>
          {categories.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className="h-32 text-center text-muted-foreground"
              >
                No categories found
              </TableCell>
            </TableRow>
          ) : (
            categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell>
                  <TableImage src={category?.image_url} alt={category.name} />
                </TableCell>

                <TableCell>
                  <div>
                    <p className="font-medium">{category.name}</p>

                    {category.parent_id && (
                      <p className="text-xs text-muted-foreground">
                        Sub Category
                      </p>
                    )}
                  </div>
                </TableCell>

                <TableCell>
                  <span className="font-mono text-xs">{category.slug}</span>
                </TableCell>

                <TableCell>{category.parent?.name ?? "-"}</TableCell>

                <TableCell>
                  {new Date(category.created_at).toLocaleDateString()}
                </TableCell>

                <TableCell>
                  <CategoryRowActions
                    category={category}
                    onView={onView}
                    onEdit={onEdit}
                  />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
