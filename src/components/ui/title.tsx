"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// Title variants using CVA based on design tokens
const titleVariants = cva(
  "font-sans font-bold tracking-tight transition-colors duration-200",
  {
    variants: {
      variant: {
        default: "text-black",
        primary: "text-primary",
        secondary: "text-secondary-foreground",
        muted: "text-muted-foreground",
        gradient: "bg-linear-to-r from-primary to-primary-hover bg-clip-text text-transparent",
      },
      size: {
        xs: "text-lg md:text-xl",
        sm: "text-xl md:text-2xl",
        md: "text-2xl md:text-3xl",
        lg: "text-3xl md:text-4xl",
        xl: "text-4xl md:text-5xl lg:text-6xl",
        "2xl": "text-5xl md:text-6xl lg:text-7xl",
      },
      align: {
        left: "text-left",
        center: "text-center",
        right: "text-right",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      align: "left",
    },
  }
);

export interface TitleProps
  extends React.HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof titleVariants> {
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
}

export function Title({
  className,
  variant,
  size,
  align,
  as: Component = "h2",
  ...props
}: TitleProps) {
  return (
    <Component
      className={cn(titleVariants({ variant, size, align }), className)}
      {...props}
    />
  );
}

// Section Title wrapper variants using CVA based on design tokens
const sectionTitleVariants = cva(
  "flex flex-col gap-2 md:gap-3",
  {
    variants: {
      align: {
        left: "items-start text-left",
        center: "items-center text-center",
        right: "items-end text-right",
      },
      spacing: {
        default: "mb-8 md:mb-12",
        sm: "mb-6 md:mb-8",
        lg: "mb-12 md:mb-16",
        none: "mb-0",
      },
    },
    defaultVariants: {
      align: "center",
      spacing: "default",
    },
  }
);

export interface SectionTitleProps extends VariantProps<typeof sectionTitleVariants> {
  title: string;
  subtitle?: string;
  badge?: string;
  titleAs?: "h1" | "h2" | "h3";
  titleSize?: "md" | "lg" | "xl";
  titleVariant?: "default" | "gradient" | "primary" | "secondary";
  className?: string;
}

export function SectionTitle({
  title,
  subtitle,
  badge,
  align,
  spacing,
  titleAs = "h2",
  titleSize = "lg",
  titleVariant = "default",
  className,
}: SectionTitleProps) {
  return (
    <div className={cn(sectionTitleVariants({ align, spacing }), className)}>
      {badge && (
        <span className="inline-flex items-center px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary bg-secondary rounded-full border border-accent/30 animate-pulse">
          {badge}
        </span>
      )}
      <Title as={titleAs} size={titleSize} variant={titleVariant} align={align}>
        {title}
      </Title>
      {subtitle && (
        <p className="max-w-2xl text-sm md:text-base text-muted-foreground font-normal leading-relaxed mt-1">
          {subtitle}
        </p>
      )}
    </div>
  );
}
