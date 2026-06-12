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

interface Category {
  id: string;
  name: string;
  image_url?: string;
  slug: string;
  parent_id: string | null;
  created_at: string;

  parent?: {
    id: string;
    name: string;
  } | null;
}

interface Props {
  categories: Category[];

  onEdit: (category: Category) => void;
}

export function CategoriesTable({ categories, onEdit }: Props) {
  return (
    <div className="overflow-hidden rounded-[var(--radius)] border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Category</TableHead>

            <TableHead>Slug</TableHead>

            <TableHead>Parent</TableHead>

            <TableHead>Created</TableHead>

            <TableHead />
          </TableRow>
        </TableHeader>

        <TableBody>
          {categories.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={5}
                className="h-32 text-center text-muted-foreground"
              >
                No categories found
              </TableCell>
            </TableRow>
          ) : (
            categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <TableImage src={category?.image_url} alt={category.name} />

                    <div>
                      <p className="font-medium">{category.name}</p>

                      <p className="text-xs text-muted-foreground">
                        /category/{category.slug}
                      </p>

                      {category.parent_id && (
                        <p className="text-xs text-muted-foreground">
                          Sub Category
                        </p>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>{category.slug}</TableCell>

                <TableCell>{category.parent?.name ?? "-"}</TableCell>

                <TableCell>
                  {new Date(category.created_at).toLocaleDateString()}
                </TableCell>

                <TableCell>
                  <CategoryRowActions category={category} onEdit={onEdit} />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
