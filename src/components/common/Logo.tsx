import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface LogoProps {
    variant?: "landing" | "admin";
    className?: string;
    imageClassName?: string;
    href?: string;
    priority?: boolean;
}

export const Logo = ({
    variant = "landing",
    className,
    imageClassName,
    href = "/",
    priority = true,
}: LogoProps) => {
    // Original cropped logo dimensions: 845x150 (ratio 5.633:1)
    // Landing navbar: 32px icon height -> 180x32
    // Admin navbar: 28px icon height -> 158x28
    const isLanding = variant === "landing";

    return (
        <Link
            href={href}
            className={cn(
                "inline-flex items-center shrink-0 transition-opacity hover:opacity-90 duration-200 select-none",
                className
            )}
        >
            <Image
                src="/logo-cropped.png"
                alt="Sellokart"
                width={isLanding ? 160 : 140}
                height={isLanding ? 28 : 24}
                className={cn(
                    "object-contain w-auto block shrink-0",
                    isLanding ? "h-[28px] max-h-[28px]" : "h-[20px] max-h-[20px]",
                    imageClassName
                )}
                style={{
                    aspectRatio: "845 / 150",
                }}
                priority={priority}
            />
        </Link>
    );
};
