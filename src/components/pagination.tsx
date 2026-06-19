import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  hasPrev: boolean;
  hasNext: boolean;
  prevCursor?: string;
  nextCursor?: string;
  basePath: string;
  searchParams?: Record<string, string | undefined>;
}

export function Pagination({ hasPrev, hasNext, prevCursor, nextCursor, basePath, searchParams = {} }: PaginationProps) {
  const totalVisible = hasPrev || hasNext;

  if (!totalVisible) return null;

  function buildHref(cursor: string, dir: "after" | "before") {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(searchParams)) {
      if (value && key !== "after" && key !== "before") params.set(key, value);
    }
    params.set(dir, cursor);
    return `${basePath}?${params.toString()}`;
  }

  return (
    <nav className="flex items-center justify-center gap-2 mt-8">
      {hasPrev ? (
        <Link
          href={buildHref(prevCursor!, "before")}
          className={buttonVariants({ variant: "outline", size: "default" })}
        >
          <ChevronLeft className="h-4 w-4 mr-1" /> Anterior
        </Link>
      ) : (
        <span className={buttonVariants({ variant: "outline", size: "default" }) + " pointer-events-none opacity-50"}>
          <ChevronLeft className="h-4 w-4 mr-1" /> Anterior
        </span>
      )}

      {hasNext ? (
        <Link
          href={buildHref(nextCursor!, "after")}
          className={buttonVariants({ variant: "outline", size: "default" })}
        >
          Siguiente <ChevronRight className="h-4 w-4 ml-1" />
        </Link>
      ) : (
        <span className={buttonVariants({ variant: "outline", size: "default" }) + " pointer-events-none opacity-50"}>
          Siguiente <ChevronRight className="h-4 w-4 ml-1" />
        </span>
      )}
    </nav>
  );
}
