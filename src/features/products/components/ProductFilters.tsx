import { AppSelect } from "@/components/AppSelect";
import { Input } from "@/components/ui/input";

interface ProductFiltersProps {
  search?: string;
  categoryId?: string;
  status?: string;
  sort?: string;

  categoryOptions: {
    label: string;
    value: string;
  }[];

  onSearchChange?: (
    value: string
  ) => void;

  onCategoryChange?: (
    value: string
  ) => void;

  onStatusChange?: (
    value: string
  ) => void;

  onSortChange?: (
    value: string
  ) => void;
}

const statusOptions = [
  {
    label: "All Status",
    value: "all",
  },
  {
    label: "Active",
    value: "active",
  },
  {
    label: "Draft",
    value: "draft",
  },
  {
    label: "Archived",
    value: "archived",
  },
];

const sortOptions = [
  {
    label: "Newest",
    value: "newest",
  },
  {
    label: "Oldest",
    value: "oldest",
  },
  {
    label: "Price Low → High",
    value: "price_asc",
  },
  {
    label: "Price High → Low",
    value: "price_desc",
  },
  {
    label: "Name A → Z",
    value: "name_asc",
  },
  {
    label: "Name Z → A",
    value: "name_desc",
  },
];

export function ProductFilters({
  search,
  categoryId,
  status,
  sort,
  categoryOptions,
  onSearchChange,
  onCategoryChange,
  onStatusChange,
  onSortChange,
}: ProductFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Input
        value={search}
        onChange={(e) =>
          onSearchChange?.(e.target.value)
        }
        placeholder="Search products..."
        className="w-full md:w-72"
      />

      <AppSelect
        value={categoryId}
        placeholder="Category"
        options={[
          {
            label: "All Categories",
            value: "all",
          },
          ...categoryOptions,
        ]}
        onValueChange={onCategoryChange}
      />

      <AppSelect
        value={status}
        placeholder="Status"
        options={statusOptions}
        onValueChange={onStatusChange}
      />

      <AppSelect
        value={sort}
        placeholder="Sort By"
        options={sortOptions}
        onValueChange={onSortChange}
      />
    </div>
  );
}