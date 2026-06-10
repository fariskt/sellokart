"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { GetProductsParams } from "./types";

function generateSlug(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
}

export async function createProduct(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      message: "Unauthorized",
    };
  }

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const categoryId = formData.get("categoryId") as string;
  const price = Number(formData.get("price"));
  const salePrice = formData.get("sale_price");
  const stock = Number(formData.get("stock"));
  const sku = formData.get("sku") as string;
  const featured = formData.get("featured") === "true";

  const slug = generateSlug(name);

  const { error } = await supabase
    .from("products")
    .insert({
      seller_id: user.id,
      category_id: categoryId || null,
      name,
      slug,
      description,
      price,
      sale_price: salePrice
        ? Number(salePrice)
        : null,
      stock,
      sku: sku || null,
      featured,
      status: "draft",
    });

  if (error) {
    return {
      success: false,
      message: error.message,
    };
  }

  revalidatePath("/admin/products");

  return {
    success: true,
    message: "Product created successfully",
  };
}

export async function updateProduct(
  productId: string,
  formData: FormData
) {
  const supabase = await createClient();

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const categoryId = formData.get("categoryId") as string;
  const price = Number(formData.get("price"));
  const salePrice = formData.get("sale_price");
  const stock = Number(formData.get("stock"));
  const sku = formData.get("sku") as string;
  const featured = formData.get("featured") === "true";
  const status = formData.get("status") as string;

  const slug = generateSlug(name);

  const { error } = await supabase
    .from("products")
    .update({
      name,
      slug,
      description,
      category_id: categoryId || null,
      price,
      sale_price: salePrice
        ? Number(salePrice)
        : null,
      stock,
      sku: sku || null,
      featured,
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", productId);

  if (error) {
    return {
      success: false,
      message: error.message,
    };
  }

  revalidatePath("/admin/products");

  return {
    success: true,
    message: "Product updated successfully",
  };
}

export async function deleteProduct(
  productId: string
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", productId);

  if (error) {
    return {
      success: false,
      message: error.message,
    };
  }

  revalidatePath("/admin/products");

  return {
    success: true,
    message: "Product deleted successfully",
  };
}

export async function getProducts() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      categories (
        id,
        name
      )
    `)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function toggleFeatured(
  productId: string,
  featured: boolean
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("products")
    .update({
      featured,
    })
    .eq("id", productId);

  if (error) {
    return {
      success: false,
      message: error.message,
    };
  }

  revalidatePath("/admin/products");

  return {
    success: true,
  };
}

export async function updateProductStatus(
  productId: string,
  status:
    | "draft"
    | "active"
    | "archived"
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("products")
    .update({
      status,
    })
    .eq("id", productId);

  if (error) {
    return {
      success: false,
      message: error.message,
    };
  }

  revalidatePath("/admin/products");

  return {
    success: true,
  };
}

export async function getProductsPaginated({
  page = 1,
  limit = 10,
  search,
  categoryId,
  status,
  featured,
}: GetProductsParams) {
  const supabase = await createClient();

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("products")
    .select(
      `
      *,
      categories (
        id,
        name
      )
    `,
      {
        count: "exact",
      }
    );

  if (search) {
    query = query.ilike(
      "name",
      `%${search}%`
    );
  }

  if (categoryId) {
    query = query.eq(
      "category_id",
      categoryId
    );
  }

  if (status) {
    query = query.eq(
      "status",
      status
    );
  }

  if (featured !== undefined) {
    query = query.eq(
      "featured",
      featured
    );
  }

  const {
    data,
    count,
    error,
  } = await query
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
      totalPages: Math.ceil(
        (count ?? 0) / limit
      ),
    },
  };
}