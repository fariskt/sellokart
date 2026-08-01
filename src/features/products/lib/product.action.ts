"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { createAuditLog } from "@/features/audit-logs/lib/audit-log.action";
import {
  GetProductsParams,
  ProductAttribute,
  ProductVariant,
  ProductVariantAttribute,
} from "./types";

type ProductImageMetadata = {
  id?: string;
  is_primary: boolean;
  sort_order: number;
  is_deleted?: boolean;
};

type ProductVariantInput = Omit<ProductVariant, "product_id" | "created_at">;
type SortableProductImage = {
  sort_order: number;
};
type ProductDetailsVariant = ProductVariant & {
  product_variant_attributes?: ProductVariantAttribute[];
};

function generateSlug(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
}

function parseJsonField<T>(formData: FormData, field: string, fallback: T): T {
  try {
    return JSON.parse((formData.get(field) as string) || "") as T;
  } catch {
    return fallback;
  }
}

function normalizeProductAttributes(attributes: ProductAttribute[]) {
  return attributes
    .map((attribute) => ({
      id: attribute.id,
      attribute_name: attribute.attribute_name?.trim() ?? "",
      attribute_value: attribute.attribute_value?.trim() ?? "",
    }))
    .filter(
      (attribute) =>
        attribute.attribute_name.length > 0 || attribute.attribute_value.length > 0,
    );
}

function normalizeVariantAttributes(attributes: ProductVariantAttribute[]) {
  return attributes
    .map((attribute) => ({
      id: attribute.id,
      attribute_name: attribute.attribute_name?.trim() ?? "",
      attribute_value: attribute.attribute_value?.trim() ?? "",
    }))
    .filter(
      (attribute) =>
        attribute.attribute_name.length > 0 || attribute.attribute_value.length > 0,
    );
}

function normalizeProductVariants(variants: ProductVariantInput[]) {
  return variants
    .map((variant) => ({
      id: variant.id,
      name: variant.name?.trim() ?? "",
      sku: variant.sku?.trim() || null,
      price: Number(variant.price || 0),
      sale_price:
        variant.sale_price === undefined ||
        variant.sale_price === null ||
        String(variant.sale_price) === ""
          ? null
          : Number(variant.sale_price),
      stock: Number(variant.stock || 0),
      product_variant_attributes: normalizeVariantAttributes(
        variant.product_variant_attributes ?? [],
      ),
    }))
    .filter((variant) => variant.name.length > 0);
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
  const submittedSlug = formData.get("slug") as string;
  const price = Number(formData.get("price"));
  const salePrice = formData.get("sale_price");
  const stock = Number(formData.get("stock"));
  const sku = formData.get("sku") as string;
  const featured = formData.get("featured") === "true";
  const status = formData.get("status") as string;

  const metadata: ProductImageMetadata[] = JSON.parse(
    (formData.get("images_metadata") as string) || "[]",
  );
  const attributes = parseJsonField<ProductAttribute[]>(
    formData,
    "attributes",
    [],
  );
  const variants = parseJsonField<ProductVariantInput[]>(
    formData,
    "variants",
    [],
  );

  const images = formData
    .getAll("images")
    .filter((file): file is File => file instanceof File && file.size > 0);

  const slug = submittedSlug ? generateSlug(submittedSlug) : generateSlug(name);

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
      status: status || "draft",
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

  const attributesResult = await saveProductAttributes(product.id, attributes);

  if (!attributesResult.success) {
    return attributesResult;
  }

  const variantsResult = await saveProductVariants(product.id, variants);

  if (!variantsResult.success) {
    return variantsResult;
  }

  revalidatePath("/admin/products");

  // Log product creation administrative action
  await createAuditLog({
    action: "Created Product",
    tableName: "products",
    recordId: product.id,
    entityName: name,
    metadata: {
      price,
      stock,
      sku,
      status: status || "draft",
      featured,
    },
  });

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
  const submittedSlug = formData.get("slug") as string;
  const price = Number(formData.get("price"));
  const salePrice = formData.get("sale_price");
  const stock = Number(formData.get("stock"));
  const sku = formData.get("sku") as string;
  const featured = formData.get("featured") === "true";
  const status = formData.get("status") as string;

  const slug = submittedSlug ? generateSlug(submittedSlug) : generateSlug(name);

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
  const attributes = parseJsonField<ProductAttribute[]>(
    formData,
    "attributes",
    [],
  );
  const variants = parseJsonField<ProductVariantInput[]>(
    formData,
    "variants",
    [],
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

  const attributesResult = await saveProductAttributes(productId, attributes);

  if (!attributesResult.success) {
    return attributesResult;
  }

  const variantsResult = await saveProductVariants(productId, variants);

  if (!variantsResult.success) {
    return variantsResult;
  }

  revalidatePath("/admin/products");

  // Log product update administrative action
  await createAuditLog({
    action: "Updated Product",
    tableName: "products",
    recordId: productId,
    entityName: name,
    metadata: {
      price,
      stock,
      sku,
      status,
      featured,
    },
  });

  return {
    success: true,
    message: "Product updated successfully",
  };
}

export async function deleteProduct(productId: string) {
  const supabase = await createClient();

  // Fetch product name for logging
  const { data: productToDelete } = await supabase
    .from("products")
    .select("name")
    .eq("id", productId)
    .single();
  const entityName = productToDelete?.name || "Unknown Product";

  const { data: images } = await supabase
    .from("product_images")
    .select("image_path")
    .eq("product_id", productId);

  const { data: variants } = await supabase
    .from("product_variants")
    .select("id")
    .eq("product_id", productId);

  if (images?.length) {
    await supabase.storage
      .from("products")
      .remove(images.map((image) => image.image_path));
  }

  const variantIds = variants?.map((variant) => variant.id) ?? [];

  if (variantIds.length) {
    await supabase
      .from("product_variant_attributes")
      .delete()
      .in("variant_id", variantIds);
  }

  await supabase.from("product_variants").delete().eq("product_id", productId);
  await supabase
    .from("product_attributes")
    .delete()
    .eq("product_id", productId);

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

  // Log product deletion administrative action
  await createAuditLog({
    action: "Deleted Product",
    tableName: "products",
    recordId: productId,
    entityName: entityName,
    metadata: {
      id: productId,
    },
  });

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
),
product_attributes (
  id,
  attribute_name,
  attribute_value,
  created_at
),
product_variants (
  id,
  name,
  sku,
  price,
  sale_price,
  stock,
  created_at,
  product_variant_attributes (
    id,
    attribute_name,
    attribute_value,
    created_at
  )
)
    `,
    )
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw new Error(error.message);
  }

  return data?.map((product: any) => ({
    ...product,
    product_images:
      product.product_images?.sort(
        (a: SortableProductImage, b: SortableProductImage) =>
          a.sort_order - b.sort_order,
      ) ?? [],
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

  // Fetch product details for logging
  const { data: prod } = await supabase
    .from("products")
    .select("name")
    .eq("id", productId)
    .single();

  await createAuditLog({
    action: "Updated Product",
    tableName: "products",
    recordId: productId,
    entityName: prod?.name || "Unknown Product",
    metadata: {
      featured,
      change: "featured_toggle",
    },
  });

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

  // Fetch product details for logging
  const { data: prod } = await supabase
    .from("products")
    .select("name")
    .eq("id", productId)
    .single();

  await createAuditLog({
    action: "Updated Product",
    tableName: "products",
    recordId: productId,
    entityName: prod?.name || "Unknown Product",
    metadata: {
      status,
      change: "status_update",
    },
  });

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
    ),
    product_attributes (
      id,
      attribute_name,
      attribute_value,
      created_at
    ),
    product_variants (
      id,
      name,
      sku,
      price,
      sale_price,
      stock,
      created_at,
      product_variant_attributes (
        id,
        attribute_name,
        attribute_value,
        created_at
      )
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
        product.product_images?.sort(
          (a: SortableProductImage, b: SortableProductImage) =>
            a.sort_order - b.sort_order,
        ) ?? [],
    })),
    pagination: {
      page,
      limit,
      total: count ?? 0,
      totalPages: Math.ceil((count ?? 0) / limit),
    },
  };
}

export async function getProductDetails(productId: string) {
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
        sort_order,
        created_at
      ),
      product_attributes (
        id,
        attribute_name,
        attribute_value,
        created_at
      ),
      product_variants (
        id,
        name,
        sku,
        price,
        sale_price,
        stock,
        created_at,
        product_variant_attributes (
          id,
          attribute_name,
          attribute_value,
          created_at
        )
      )
    `,
    )
    .eq("id", productId)
    .single();

  if (error) {
    return {
      success: false,
      message: error.message,
      data: null,
    };
  }

  return {
    success: true,
    data: {
      ...data,
      categoryId: data.category_id,
      salePrice: data.sale_price,
      product_images:
        data.product_images?.sort(
          (a: SortableProductImage, b: SortableProductImage) =>
            a.sort_order - b.sort_order,
        ) ?? [],
      product_variants:
        data.product_variants?.map((variant: ProductDetailsVariant) => ({
          ...variant,
          product_variant_attributes:
            variant.product_variant_attributes?.sort(
              (a: ProductVariantAttribute, b: ProductVariantAttribute) =>
                a.attribute_name.localeCompare(b.attribute_name),
            ) ?? [],
        })) ?? [],
    },
  };
}

export async function saveProductAttributes(
  productId: string,
  attributes: ProductAttribute[],
) {
  const supabase = await createClient();
  const normalizedAttributes = normalizeProductAttributes(attributes);
  const retainedIds = normalizedAttributes
    .map((attribute) => attribute.id)
    .filter((id): id is string => Boolean(id));

  let deleteQuery = supabase
    .from("product_attributes")
    .delete()
    .eq("product_id", productId);

  if (retainedIds.length) {
    deleteQuery = deleteQuery.not("id", "in", `(${retainedIds.join(",")})`);
  }

  const { error: deleteError } = await deleteQuery;

  if (deleteError) {
    return {
      success: false,
      message: deleteError.message,
    };
  }

  for (const attribute of normalizedAttributes) {
    if (attribute.id) {
      const { error } = await supabase
        .from("product_attributes")
        .update({
          attribute_name: attribute.attribute_name,
          attribute_value: attribute.attribute_value,
        })
        .eq("id", attribute.id)
        .eq("product_id", productId);

      if (error) {
        return {
          success: false,
          message: error.message,
        };
      }
    } else {
      const { error } = await supabase.from("product_attributes").insert({
        product_id: productId,
        attribute_name: attribute.attribute_name,
        attribute_value: attribute.attribute_value,
      });

      if (error) {
        return {
          success: false,
          message: error.message,
        };
      }
    }
  }

  revalidatePath("/admin/products");

  return {
    success: true,
  };
}

export async function saveVariantAttributes(
  variantId: string,
  attributes: ProductVariantAttribute[],
) {
  const supabase = await createClient();
  const normalizedAttributes = normalizeVariantAttributes(attributes);
  const retainedIds = normalizedAttributes
    .map((attribute) => attribute.id)
    .filter((id): id is string => Boolean(id));

  let deleteQuery = supabase
    .from("product_variant_attributes")
    .delete()
    .eq("variant_id", variantId);

  if (retainedIds.length) {
    deleteQuery = deleteQuery.not("id", "in", `(${retainedIds.join(",")})`);
  }

  const { error: deleteError } = await deleteQuery;

  if (deleteError) {
    return {
      success: false,
      message: deleteError.message,
    };
  }

  for (const attribute of normalizedAttributes) {
    if (attribute.id) {
      const { error } = await supabase
        .from("product_variant_attributes")
        .update({
          attribute_name: attribute.attribute_name,
          attribute_value: attribute.attribute_value,
        })
        .eq("id", attribute.id)
        .eq("variant_id", variantId);

      if (error) {
        return {
          success: false,
          message: error.message,
        };
      }
    } else {
      const { error } = await supabase
        .from("product_variant_attributes")
        .insert({
          variant_id: variantId,
          attribute_name: attribute.attribute_name,
          attribute_value: attribute.attribute_value,
        });

      if (error) {
        return {
          success: false,
          message: error.message,
        };
      }
    }
  }

  revalidatePath("/admin/products");

  return {
    success: true,
  };
}

export async function saveProductVariants(
  productId: string,
  variants: ProductVariantInput[],
) {
  const supabase = await createClient();
  const normalizedVariants = normalizeProductVariants(variants);
  const retainedIds = normalizedVariants
    .map((variant) => variant.id)
    .filter((id): id is string => Boolean(id));
  const { data: existingVariants, error: existingVariantsError } = await supabase
    .from("product_variants")
    .select("id")
    .eq("product_id", productId);

  if (existingVariantsError) {
    return {
      success: false,
      message: existingVariantsError.message,
    };
  }

  const removedVariantIds =
    existingVariants
      ?.map((variant) => variant.id)
      .filter((variantId) => !retainedIds.includes(variantId)) ?? [];

  if (removedVariantIds.length) {
    const { error } = await supabase
      .from("product_variant_attributes")
      .delete()
      .in("variant_id", removedVariantIds);

    if (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  let deleteQuery = supabase
    .from("product_variants")
    .delete()
    .eq("product_id", productId);

  if (retainedIds.length) {
    deleteQuery = deleteQuery.not("id", "in", `(${retainedIds.join(",")})`);
  }

  const { error: deleteError } = await deleteQuery;

  if (deleteError) {
    return {
      success: false,
      message: deleteError.message,
    };
  }

  for (const variant of normalizedVariants) {
    let variantId = variant.id;

    if (variant.id) {
      const { error } = await supabase
        .from("product_variants")
        .update({
          name: variant.name,
          sku: variant.sku,
          price: variant.price,
          sale_price: variant.sale_price,
          stock: variant.stock,
        })
        .eq("id", variant.id)
        .eq("product_id", productId);

      if (error) {
        return {
          success: false,
          message: error.message,
        };
      }
    } else {
      const { data, error } = await supabase
        .from("product_variants")
        .insert({
          product_id: productId,
          name: variant.name,
          sku: variant.sku,
          price: variant.price,
          sale_price: variant.sale_price,
          stock: variant.stock,
        })
        .select("id")
        .single();

      if (error) {
        return {
          success: false,
          message: error.message,
        };
      }

      variantId = data.id;
    }

    if (variantId) {
      const attributesResult = await saveVariantAttributes(
        variantId,
        variant.product_variant_attributes ?? [],
      );

      if (!attributesResult.success) {
        return attributesResult;
      }
    }
  }

  revalidatePath("/admin/products");

  return {
    success: true,
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
