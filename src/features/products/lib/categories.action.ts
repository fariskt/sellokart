"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

function generateSlug(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
}

export async function createCategory(formData: FormData) {
  const supabase = await createClient();

  const name = formData.get("name") as string;
  const parentId = formData.get("parent_id") as string;

  const image = formData.get("image") as File;

  let imageUrl: string | null = null;
  let imagePath: string | null = null;

  if (image?.size) {
    const uploaded = await uploadCategoryImage(supabase, image);

    imageUrl = uploaded.imageUrl;
    imagePath = uploaded.imagePath;
  }

  const slug = generateSlug(name);

  const { error } = await supabase.from("categories").insert({
    name,
    slug,
    parent_id: parentId || null,
    image_url: imageUrl,
    image_path: imagePath,
  });

  if (error) {
    return {
      success: false,
      message: error.message,
    };
  }

  revalidatePath("/admin/categories");

  return {
    success: true,
    message: "Category created successfully",
  };
}

export async function updateCategory(categoryId: string, formData: FormData) {
  const supabase = await createClient();

  const name = formData.get("name") as string;
  const parentId = formData.get("parent_id") as string;

  const slug = generateSlug(name);

  const { data: currentCategory } = await supabase
    .from("categories")
    .select("image_path")
    .eq("id", categoryId)
    .single();

  const image = formData.get("image") as File;

  const updateData: Record<string, any> = {
    name,
    slug,
    parent_id: parentId || null,
  };

  if (image?.size) {
    const uploaded = await uploadCategoryImage(supabase, image);

    updateData.image_url = uploaded.imageUrl;
    updateData.image_path = uploaded.imagePath;
  }

  const { error } = await supabase
    .from("categories")
    .update(updateData)
    .eq("id", categoryId);
  if (error) {
    return {
      success: false,
      message: error.message,
    };
  }

  if (image?.size && currentCategory?.image_path) {
    await supabase.storage
      .from("categories")
      .remove([currentCategory.image_path]);
  }

  revalidatePath("/admin/categories");

  return {
    success: true,
    message: "Category updated successfully",
  };
}

export async function deleteCategory(categoryId: string) {
  const supabase = await createClient();

  const { data: category } = await supabase
    .from("categories")
    .select("image_path")
    .eq("id", categoryId)
    .single();

  if (category?.image_path) {
    await supabase.storage.from("categories").remove([category.image_path]);
  }

  const { count: productsCount } = await supabase
    .from("products")
    .select("*", {
      count: "exact",
      head: true,
    })
    .eq("category_id", categoryId);

  if ((productsCount ?? 0) > 0) {
    return {
      success: false,
      message: "Category contains products",
    };
  }

  const { count: childrenCount } = await supabase
    .from("categories")
    .select("*", {
      count: "exact",
      head: true,
    })
    .eq("parent_id", categoryId);

  if ((childrenCount ?? 0) > 0) {
    return {
      success: false,
      message: "Category contains subcategories",
    };
  }

  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("id", categoryId);

  if (error) {
    return {
      success: false,
      message: error.message,
    };
  }

  revalidatePath("/admin/categories");

  return {
    success: true,
    message: "Category deleted successfully",
  };
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

  return data;
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
    throw new Error(error.message);
  }

  return data;
}

export async function getCategoryOptions() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("categories")
    .select("id, name")
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

  return {
    data,
    pagination: {
      page,
      limit,
      total: count ?? 0,
      totalPages: Math.ceil((count ?? 0) / limit),
    },
  };
}

async function uploadCategoryImage(
  supabase: Awaited<ReturnType<typeof createClient>>,
  image: File,
) {
  const filePath = `categories/${crypto.randomUUID()}-${image.name}`;

  const { error } = await supabase.storage
    .from("categories")
    .upload(filePath, image);

  if (error) {
    throw new Error(error.message);
  }

  const { data } = supabase.storage
    .from("categories")
    .getPublicUrl(filePath);

  return {
    imageUrl: data.publicUrl,
    imagePath: filePath,
  };
}
