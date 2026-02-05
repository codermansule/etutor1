"use client";

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
    className?: string;
    width?: number;
    height?: number;
}

export default function Logo({ className, width = 140, height = 40 }: LogoProps) {
    return (
        <Link href="/" className={cn("flex items-center gap-2 transition hover:opacity-90", className)}>
            <Image
                src="/logo.png"
                alt="ETUTOR"
                width={width}
                height={height}
                priority
                className="h-10 w-auto object-contain"
                // Fallback for when the image is not found during dev
                onError={(e) => {
                    // If image fails to load, we can show text or just hide it
                    console.warn("Logo image failed to load. Ensure /public/logo.png exists.");
                }}
            />
        </Link>
    );
}
