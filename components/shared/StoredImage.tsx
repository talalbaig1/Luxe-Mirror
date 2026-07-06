"use client";

import Image, { type ImageProps } from "next/image";
import { cn } from "@/lib/utils";

interface Props extends Omit<ImageProps, "src"> {
  src: string;
}

/** Renders stored photos (signed URLs, data URLs, or remote) without Next.js optimizer issues. */
export function StoredImage({ src, alt, className, ...props }: Props) {
  const inline = src.startsWith("data:") || src.startsWith("blob:");

  return (
    <Image
      src={src}
      alt={alt}
      unoptimized={inline || src.includes("/storage/v1/object/sign/")}
      className={cn(className)}
      {...props}
    />
  );
}
