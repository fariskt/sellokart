import Image from "next/image";
import Link from "next/link";

export const Logo = () => {
    return (
        <Link
            href="/"
            className="inline-flex items-center transition-transform hover:scale-105 duration-200"
        >
            <Image
                src="/logo4.png"
                alt="Sellokart"
                width={160}
                height={50}
                className="h-8 sm:h-9 w-auto object-contain"
                priority
            />
        </Link>
    );
};
