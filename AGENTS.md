# AGENTS.md

## Project Overview

This is a production-grade ecommerce application built with:

* Next.js App Router
* TypeScript
* Supabase
* Shadcn UI
* Server Actions
* Zustand
* React Hook Form
* Zod

The codebase follows a feature-based architecture.

Always follow existing patterns before introducing new ones.

---

# Architecture Rules

## Feature First

Business logic belongs inside:

```text
features/
```

Examples:

```text
features/products
features/orders
features/customers
features/cart
features/auth
```

Never place business logic inside page files.

Pages should remain thin.

---

# App Router Rules

Pages should only:

* Fetch data
* Call feature actions
* Render feature components

Example:

```text
app/(admin)/admin/products/page.tsx
```

Should render:

```text
ProductPageClient
```

and not contain large amounts of logic.

---

# Supabase Rules

All Supabase operations must remain inside:

```text
features/**/lib/*.action.ts
```

Examples:

```text
features/products/lib/product.action.ts

features/products/lib/categories.action.ts

features/auth/actions.ts
```

Never call Supabase directly from:

```text
components/
page.tsx
client components
```

Bad:

```tsx
const supabase = createClient();

await supabase.from("products").select("*");
```

inside components.

Good:

```tsx
await getProducts();
```

through actions.

---

# Product Module Rules

Location:

```text
features/products
```

Actions:

```text
features/products/lib/product.action.ts
```

Responsible for:

* Product CRUD
* Product Images
* Product Attributes
* Product Variants
* Product Variant Attributes
* Product Search
* Product Pagination
* Product Filters
* Featured Toggle
* Status Update

Keep existing image architecture.

Do not rewrite image upload logic.

Preserve:

* Primary Image
* Sort Order
* Image Replacement
* Image Deletion
* Supabase Storage Integration

---

# Category Module Rules

Location:

```text
features/products
```

Actions:

```text
features/products/lib/categories.action.ts
```

Responsible for:

* Category CRUD
* Parent Categories
* Nested Categories
* Category Images
* Storage Upload
* Storage Delete

Schema:

```text
id
name
slug
parent_id
image_url
image_path
created_at
```

Support hierarchy.

Example:

Electronics
├── Mobile Phones
├── Laptops
└── Accessories

---

# Component Rules

Reusable components belong in:

```text
components/
```

Feature-specific components belong in:

```text
features/*/components/
```

Examples:

```text
features/products/components/ProductForm.tsx

features/products/components/ProductTable.tsx

features/products/components/ProductDialog.tsx
```

Never move feature-specific components into global components.

---

# Form Rules

Use:

* React Hook Form
* Zod

All forms require validation.

Validation files should live in:

```text
validations/
```

or

```text
features/*/schemas/
```

---

# Dialog Rules

Use:

```text
AppDialog
DialogActions
```

before creating new dialog patterns.

Maintain consistent UX across admin pages.

---

# Table Rules

Use:

```text
TanStack Table
```

for admin listings.

Support:

* Search
* Pagination
* Sorting
* Loading States
* Empty States
* Error States

All admin tables should follow the same design language.

---

# Loading States

Use:

```text
TableSkeleton
```

for table loading.

Use:

```text
loading.tsx
```

for route loading.

Never leave blank screens.

---

# Image Upload Rules

Use existing upload pattern.

Common component:

```text
components/common/ImageUploader.tsx
```

Product-specific:

```text
features/products/components/ProductImageUpload.tsx
```

Requirements:

* Preview
* Multiple Upload
* Replace
* Delete
* Reorder
* Primary Selection

---

# Styling Rules

Use:

* Tailwind CSS
* Shadcn UI

Do not introduce:

* Material UI
* Ant Design
* Bootstrap

Maintain existing design system.

---

# Server Actions Rules

Always:

```ts
"use server";
```

Actions should:

* Validate input
* Handle Supabase operations
* Return typed responses
* Revalidate paths

Example:

```ts
return {
  success: true,
  message: "Saved successfully",
};
```

---

# File Naming

Actions:

```text
product.action.ts
categories.action.ts
orders.action.ts
```

Components:

```text
ProductTable.tsx
ProductDialog.tsx
CategoryDialog.tsx
```

Types:

```text
types.ts
```

Avoid:

```text
ProductTableNew.tsx
ProductTable2.tsx
finalProduct.tsx
```

---

# Folder Structure

Products:

```text
features/products
├── components
├── lib
│   ├── product.action.ts
│   ├── categories.action.ts
│   └── types.ts
```

Admin Pages:

```text
app/(admin)/admin/products
app/(admin)/admin/categories
```

Pages consume actions and components.

---

# Preferred Development Flow

1. Define database schema.
2. Create types.
3. Create server actions.
4. Create validation schema.
5. Create form components.
6. Create dialogs.
7. Create tables.
8. Create page client.
9. Create page.

Never start from UI without defining actions and types first.

---

# Before Creating New Code

Always check for:

* Existing components
* Existing dialogs
* Existing table patterns
* Existing actions
* Existing upload logic
* Existing hooks

Reuse before creating new abstractions.

Follow existing project conventions over introducing new patterns.
