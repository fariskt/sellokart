import Image from "next/image";

interface TableImageProps {
  src?: string | null;
  alt: string;
}

export function TableImage({
  src,
  alt,
}: TableImageProps) {
  if (!src) {
    return (
      <div className="size-12 rounded-lg border bg-muted" />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={48}
      height={48}
      className="size-12 rounded-lg border object-cover"
    />
  );
}