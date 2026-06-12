"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { GetProductsParams } from "./types";

type ProductImageMetadata = {
  id?: string;
  is_primary: boolean;
  sort_order: number;
  is_deleted?: boolean;
};

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

  console.log(
  formData.getAll("images"),
);

  const metadata: ProductImageMetadata[] = JSON.parse(
    (formData.get("images_metadata") as string) || "[]",
  );

  const images = formData
    .getAll("images")
    .filter((file): file is File => file instanceof File && file.size > 0);

  const slug = generateSlug(name);

  const { data: product, error } = await supabase
    .from("products")
    .insert({
      seller_id: user.id,
      category_id: categoryId || null,
      name,
      slug,
      description,
      price,
      sale_price: salePrice ? Number(salePrice) : null,
      stock,
      sku: sku || null,
      featured,
      status: "draft",
    })
    .select("id")
    .single();

  if (error) {
    return {
      success: false,
      message: error.message,
    };
  }

  if (images.length) {
    const uploadedImages = await Promise.all(
      images.map((image) => uploadProductImage(supabase, image)),
    );

    await supabase.from("product_images").insert(
      uploadedImages.map((image, index) => ({
        product_id: product.id,
        image_url: image.imageUrl,
        image_path: image.imagePath,
        is_primary: metadata[index]?.is_primary ?? index === 0,
        sort_order: metadata[index]?.sort_order ?? index,
      })),
    );

    const { data: productImages } = await supabase
      .from("product_images")
      .select("*")
      .eq("product_id", product.id)
      .order("sort_order");

    if (productImages?.length) {
      const primary =
        productImages.find((image) => image.is_primary) ?? productImages[0];

      await supabase
        .from("product_images")
        .update({
          is_primary: false,
        })
        .eq("product_id", product.id);

      await supabase
        .from("product_images")
        .update({
          is_primary: true,
        })
        .eq("id", primary.id);
    }
  }
  revalidatePath("/admin/products");

  return {
    success: true,
    message: "Product created successfully",
  };
}

export async function updateProduct(productId: string, formData: FormData) {
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
      sale_price: salePrice ? Number(salePrice) : null,
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

  const metadata = JSON.parse(
    (formData.get("images_metadata") as string) || "[]",
  );

  const newImages = formData
    .getAll("images")
    .filter((file): file is File => file instanceof File && file.size > 0);

  /**
   * Delete removed images
   */
  const deletedImages = metadata.filter(
    (image: ProductImageMetadata) => image.id && image.is_deleted,
  );

  for (const image of deletedImages) {
    const { data } = await supabase
      .from("product_images")
      .select("image_path")
      .eq("id", image.id)
      .single();

    if (data?.image_path) {
      await supabase.storage.from("products").remove([data.image_path]);
    }

    await supabase.from("product_images").delete().eq("id", image.id);
  }

  /**
   * Update existing image settings
   */
  const existingImages = metadata.filter(
    (image: ProductImageMetadata) => image.id && !image.is_deleted,
  );

  for (const image of existingImages) {
    await supabase
      .from("product_images")
      .update({
        is_primary: image.is_primary,
        sort_order: image.sort_order,
      })
      .eq("id", image.id);
  }

  /**
   * Upload newly added images
   */
  if (newImages.length) {
    const uploadedImages = await Promise.all(
      newImages.map((image) => uploadProductImage(supabase, image)),
    );

    const activeImages = metadata.filter(
      (image: ProductImageMetadata) => !image.is_deleted,
    );

    const maxSortOrder =
      activeImages.length > 0
        ? Math.max(
            ...activeImages.map(
              (image: ProductImageMetadata) => image.sort_order ?? 0,
            ),
          )
        : -1;

    await supabase.from("product_images").insert(
      uploadedImages.map((image, index) => ({
        product_id: productId,
        image_url: image.imageUrl,
        image_path: image.imagePath,
        is_primary: false,
        sort_order: maxSortOrder + index + 1,
      })),
    );

    const { data: productImages } = await supabase
      .from("product_images")
      .select("*")
      .eq("product_id", productId)
      .order("sort_order");

    if (productImages?.length) {
      const primary =
        productImages.find((image) => image.is_primary) ?? productImages[0];

      await supabase
        .from("product_images")
        .update({
          is_primary: false,
        })
        .eq("product_id", productId);

      await supabase
        .from("product_images")
        .update({
          is_primary: true,
        })
        .eq("id", primary.id);
    }
  }

  /**
   * Ensure exactly one primary image exists
   */
  const { data: images } = await supabase
    .from("product_images")
    .select("*")
    .eq("product_id", productId)
    .order("sort_order");

  if (images && images.length > 0) {
    const primary = images.find((image) => image.is_primary) ?? images[0];

    await supabase
      .from("product_images")
      .update({
        is_primary: false,
      })
      .eq("product_id", productId);

    await supabase
      .from("product_images")
      .update({
        is_primary: true,
      })
      .eq("id", primary.id);
  }

  revalidatePath("/admin/products");

  return {
    success: true,
    message: "Product updated successfully",
  };
}

export async function deleteProduct(productId: string) {
  const supabase = await createClient();

  const { data: images } = await supabase
    .from("product_images")
    .select("image_path")
    .eq("product_id", productId);

  if (images?.length) {
    await supabase.storage
      .from("products")
      .remove(images.map((image) => image.image_path));
  }

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
    .select(
      `
      *,
      categories (
        id,
        name
      ),
      product_images (
  id,
  image_url,
  image_path,
  is_primary,
  sort_order
)
    `,
    )
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw new Error(error.message);
  }

  return data?.map((product) => ({
    ...product,
    product_images:
      product.product_images?.sort((a, b) => a.sort_order - b.sort_order) ?? [],
  }));
}

export async function toggleFeatured(productId: string, featured: boolean) {
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
  status: "draft" | "active" | "archived",
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

  let query = supabase.from("products").select(
    `
    *,
    categories (
      id,
      name
    ),
    product_images (
    id,
  image_url,
  image_path,
  is_primary,
  sort_order
    )
  `,
    {
      count: "exact",
    },
  );

  if (search) {
    query = query.ilike("name", `%${search}%`);
  }

  if (categoryId) {
    query = query.eq("category_id", categoryId);
  }

  if (status) {
    query = query.eq("status", status);
  }

  if (featured !== undefined) {
    query = query.eq("featured", featured);
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
    data: data?.map((product) => ({
      ...product,
      product_images:
        product.product_images?.sort((a, b) => a.sort_order - b.sort_order) ??
        [],
    })),
    pagination: {
      page,
      limit,
      total: count ?? 0,
      totalPages: Math.ceil((count ?? 0) / limit),
    },
  };
}

async function uploadProductImage(
  supabase: Awaited<ReturnType<typeof createClient>>,
  image: File,
) {
  const extension = image.name.split(".").pop();

  const fileName = `${crypto.randomUUID()}.${extension}`;

  const filePath = fileName;

  const { error } = await supabase.storage
    .from("products")
    .upload(filePath, image, {
      cacheControl: "3600",
      upsert: false,
      contentType: image.type,
    });

  if (error) {
    throw new Error(error.message);
  }

  const { data } = supabase.storage.from("products").getPublicUrl(filePath);

  return {
    imageUrl: data.publicUrl,
    imagePath: filePath,
  };
}
