Create reusable typography components for my existing Sellokart Next.js App Router project using TypeScript, Tailwind CSS v4, and the existing Plus Jakarta Sans + Playfair Display font setup.

**Goal:** Avoid repeating font utility classes throughout the application while maintaining consistent, production-quality typography.

### Requirements

1. Create a reusable typography module, for example `components/ui/typography.tsx`.

2. Implement these components:
   - `Heading` — semantic headings (`h1`–`h6`), with configurable level and size.
   - `Text` — body text with variants such as `default`, `muted`, `small`, `large`, and `lead`.
   - `Display` — prominent storefront/editorial headings using the display font.
   - `Label` — consistent form labels.
   - `Caption` — secondary metadata and helper text.

3. Use Plus Jakarta Sans as the default interface font and Playfair Display for editorial/display typography, using the existing CSS font variables. Do not introduce another font or redefine the font configuration.

4. Use TypeScript, semantic HTML, accessible markup, and typed props. Support `className` overrides and sensible defaults.

5. Use `class-variance-authority` if it is already installed; otherwise use a lightweight typed variant approach rather than adding unnecessary dependencies.

6. Integrate with the existing Tailwind CSS v4 theme and design tokens. Preserve responsive typography, readable line heights, and consistent spacing. Avoid hardcoded styles that conflict with the existing design system.

7. Refactor representative existing storefront components to use the new typography components, including product cards, product details, and checkout where appropriate. Update admin typography only where it improves consistency.

8. Do not blindly replace every `<p>` or heading across the entire project. Preserve existing layouts, functionality, responsive behavior, and intentional one-off styling. Avoid unnecessary abstraction.

9. Export all components and their prop types from a single module. Add concise usage examples and run TypeScript checks and linting where available.

### Expected usage

```tsx
<Heading level={1} size="xl">
  Shop the Collection
</Heading>

<Display size="hero">
  Discover Your Style
</Display>

<Text variant="muted">
  Explore our latest arrivals.
</Text>

<Label htmlFor="email">Email address</Label>

<Caption>Inclusive of applicable taxes</Caption>
```

First inspect the existing font configuration, Tailwind theme, and component conventions. Then implement the smallest maintainable solution that fits the existing project. Do not redesign the website or introduce duplicate typography systems.