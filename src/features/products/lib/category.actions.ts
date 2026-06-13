"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createAuditLog } from "@/features/audit-logs/lib/audit-log.action";

const categorySchema = z
  .object({
    name: z.string().trim().min(1, "Category name is required"),
    slug: z.string().trim().min(1, "Slug is required"),
    parent_id: z.string().nullable(),
  })
  .refine((data) => data.parent_id !== "none", {
    message: "Invalid parent category",
    path: ["parent_id"],
  });

export interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  image_url?: string | null;
  image_path?: string | null;
  created_at: string;
  parent?: {
    id: string;
    name: string;
  } | null;
  children?: Category[];
}

function generateSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function getCategoryInput(formData: FormData) {
  const name = String(formData.get("name") ?? "");
  const submittedSlug = String(formData.get("slug") ?? "");
  const parentValue = String(formData.get("parent_id") ?? "");

  return categorySchema.safeParse({
    name,
    slug: submittedSlug ? generateSlug(submittedSlug) : generateSlug(name),
    parent_id: parentValue && parentValue !== "none" ? parentValue : null,
  });
}

function validationError(message: string) {
  return {
    success: false,
    message,
  };
}

async function isDescendantCategory(
  categoryId: string,
  parentId: string,
  categories: Pick<Category, "id" | "parent_id">[],
) {
  let cursor: string | null = parentId;
  const visited = new Set<string>();

  while (cursor) {
    if (cursor === categoryId) return true;
    if (visited.has(cursor)) return true;

    visited.add(cursor);
    cursor =
      categories.find((category) => category.id === cursor)?.parent_id ?? null;
  }

  return false;
}

export async function getCategories() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("categories")
    .select(
      `
      *,
      parent:parent_id (
        id,
        name
      )
    `,
    )
    .order("name");

  if (error) {
    throw new Error(error.message);
  }

  return data as Category[];
}

export async function getCategoryById(categoryId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("categories")
    .select(
      `
      *,
      parent:parent_id (
        id,
        name
      )
    `,
    )
    .eq("id", categoryId)
    .single();

  if (error) {
    return {
      success: false,
      message: error.message,
      data: null,
    };
  }

  const { data: children, error: childrenError } = await supabase
    .from("categories")
    .select(
      `
      *,
      parent:parent_id (
        id,
        name
      )
    `,
    )
    .eq("parent_id", categoryId)
    .order("name");

  if (childrenError) {
    return {
      success: false,
      message: childrenError.message,
      data: null,
    };
  }

  return {
    success: true,
    data: {
      ...data,
      children: children ?? [],
    } as Category,
  };
}

export async function createCategory(formData: FormData) {
  const supabase = await createClient();
  const parsed = getCategoryInput(formData);

  if (!parsed.success) {
    return validationError(parsed.error.issues[0]?.message ?? "Invalid category");
  }

  const image = formData.get("image") as File;
  let imageUrl: string | null = null;
  let imagePath: string | null = null;

  if (image?.size) {
    const uploaded = await uploadCategoryImage(image);

    if (!uploaded.success) return uploaded;

    imageUrl = uploaded.imageUrl;
    imagePath = uploaded.imagePath;
  }

  const { error } = await supabase.from("categories").insert({
    name: parsed.data.name,
    slug: parsed.data.slug,
    parent_id: parsed.data.parent_id,
    image_url: imageUrl,
    image_path: imagePath,
  });

  if (error) {
    if (imagePath) {
      await removeCategoryImage(imagePath);
    }

    return validationError(error.message);
  }

  revalidatePath("/admin/categories");

  const { data: newCat } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", parsed.data.slug)
    .single();

  await createAuditLog({
    action: "Created Category",
    tableName: "categories",
    recordId: newCat?.id || "unknown",
    entityName: parsed.data.name,
    metadata: {
      slug: parsed.data.slug,
      parent_id: parsed.data.parent_id,
    },
  });

  return {
    success: true,
    message: "Category created successfully",
  };
}

export async function updateCategory(categoryId: string, formData: FormData) {
  const supabase = await createClient();
  const parsed = getCategoryInput(formData);

  if (!parsed.success) {
    return validationError(parsed.error.issues[0]?.message ?? "Invalid category");
  }

  if (parsed.data.parent_id === categoryId) {
    return validationError("Category cannot be its own parent");
  }

  const { data: allCategories, error: categoriesError } = await supabase
    .from("categories")
    .select("id, parent_id");

  if (categoriesError) {
    return validationError(categoriesError.message);
  }

  if (
    parsed.data.parent_id &&
    (await isDescendantCategory(categoryId, parsed.data.parent_id, allCategories ?? []))
  ) {
    return validationError("Category cannot use one of its child categories as parent");
  }

  const { data: currentCategory, error: currentError } = await supabase
    .from("categories")
    .select("image_path")
    .eq("id", categoryId)
    .single();

  if (currentError) {
    return validationError(currentError.message);
  }

  const image = formData.get("image") as File;
  const removeImage = formData.get("remove_image") === "true";
  const updateData: {
    name: string;
    slug: string;
    parent_id: string | null;
    image_url?: string | null;
    image_path?: string | null;
  } = {
    name: parsed.data.name,
    slug: parsed.data.slug,
    parent_id: parsed.data.parent_id,
  };
  let oldImagePathToRemove: string | null = null;

  if (image?.size) {
    const uploaded = await uploadCategoryImage(image);

    if (!uploaded.success) return uploaded;

    updateData.image_url = uploaded.imageUrl;
    updateData.image_path = uploaded.imagePath;
    oldImagePathToRemove = currentCategory?.image_path ?? null;
  } else if (removeImage) {
    updateData.image_url = null;
    updateData.image_path = null;
    oldImagePathToRemove = currentCategory?.image_path ?? null;
  }

  const { error } = await supabase
    .from("categories")
    .update(updateData)
    .eq("id", categoryId);

  if (error) {
    if (updateData.image_path) {
      await removeCategoryImage(updateData.image_path);
    }

    return validationError(error.message);
  }

  if (oldImagePathToRemove) {
    await removeCategoryImage(oldImagePathToRemove);
  }

  revalidatePath("/admin/categories");

  await createAuditLog({
    action: "Updated Category",
    tableName: "categories",
    recordId: categoryId,
    entityName: parsed.data.name,
    metadata: {
      slug: parsed.data.slug,
      parent_id: parsed.data.parent_id,
    },
  });

  return {
    success: true,
    message: "Category updated successfully",
  };
}

export async function deleteCategory(categoryId: string) {
  const supabase = await createClient();

  const { count: childrenCount } = await supabase
    .from("categories")
    .select("*", {
      count: "exact",
      head: true,
    })
    .eq("parent_id", categoryId);

  if ((childrenCount ?? 0) > 0) {
    return validationError("Delete child categories before deleting this category.");
  }

  const { count: productsCount } = await supabase
    .from("products")
    .select("*", {
      count: "exact",
      head: true,
    })
    .eq("category_id", categoryId);

  if ((productsCount ?? 0) > 0) {
    return validationError("Remove assigned products before deleting this category.");
  }

  const { data: category } = await supabase
    .from("categories")
    .select("name, image_path")
    .eq("id", categoryId)
    .single();

  const entityName = category?.name || "Unknown Category";

  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("id", categoryId);

  if (error) {
    return validationError(error.message);
  }

  if (category?.image_path) {
    await removeCategoryImage(category.image_path);
  }

  revalidatePath("/admin/categories");

  await createAuditLog({
    action: "Deleted Category",
    tableName: "categories",
    recordId: categoryId,
    entityName: entityName,
    metadata: {
      id: categoryId,
    },
  });

  return {
    success: true,
    message: "Category deleted successfully",
  };
}

export async function uploadCategoryImage(image: File) {
  const supabase = await createClient();
  const extension = image.name.split(".").pop();
  const filePath = `${crypto.randomUUID()}.${extension}`;

  const { error } = await supabase.storage
    .from("categories")
    .upload(filePath, image, {
      cacheControl: "3600",
      upsert: false,
      contentType: image.type,
    });

  if (error) {
    return validationError(error.message);
  }

  const { data } = supabase.storage.from("categories").getPublicUrl(filePath);

  return {
    success: true,
    imageUrl: data.publicUrl,
    imagePath: filePath,
  };
}

export async function removeCategoryImage(imagePath: string) {
  const supabase = await createClient();

  const { error } = await supabase.storage
    .from("categories")
    .remove([imagePath]);

  if (error) {
    return validationError(error.message);
  }

  return {
    success: true,
  };
}

export async function getCategoryOptions() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("categories")
    .select("id, name, parent_id")
    .order("name");

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function getCategoriesPaginated({
  page = 1,
  limit = 10,
  search,
}: {
  page?: number;
  limit?: number;
  search?: string;
}) {
  const supabase = await createClient();
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase.from("categories").select(
    `
    id,
    name,
    slug,
    image_url,
    image_path,
    parent_id,
    created_at,
    parent:parent_id (
      id,
      name
    )
  `,
    {
      count: "exact",
    },
  );

  if (search) {
    query = query.ilike("name", `%${search}%`);
  }

  const { data, count, error } = await query
    .order("created_at", {
      ascending: false,
    })
    .range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  const { data: allCategories } = await supabase
    .from("categories")
    .select("id, parent_id");

  const total = count ?? 0;
  const rootCategories =
    allCategories?.filter((category) => !category.parent_id).length ?? 0;
  const subCategories =
    allCategories?.filter((category) => category.parent_id).length ?? 0;

  return {
    data: (data ?? []) as Category[],
    stats: {
      total,
      rootCategories,
      subCategories,
    },
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}
