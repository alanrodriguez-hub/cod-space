import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath: string;
  searchParams?: Record<string, string | undefined>;
}

export function Pagination({ currentPage, totalPages, basePath, searchParams = {} }: PaginationProps) {
  if (totalPages <= 1) return null;

  function buildHref(page: number) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(searchParams)) {
      if (value && key !== "page") params.set(key, value);
    }
    if (page > 1) params.set("page", String(page));
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  }

  const pages: number[] = [];
  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, currentPage + 2);
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <nav className="flex items-center justify-center gap-1 mt-8">
      {currentPage > 1 ? (
        <Link href={buildHref(currentPage - 1)} className={buttonVariants({ variant: "outline", size: "icon" })}>
          <ChevronLeft className="h-4 w-4" />
        </Link>
      ) : (
        <span className={buttonVariants({ variant: "outline", size: "icon" }) + " pointer-events-none opacity-50"}>
          <ChevronLeft className="h-4 w-4" />
        </span>
      )}

      {start > 1 && (
        <>
          <Link href={buildHref(1)} className={buttonVariants({ variant: "outline", size: "icon" })}>1</Link>
          {start > 2 && <span className="px-1 text-muted-foreground">...</span>}
        </>
      )}

      {pages.map((p) => (
        <Link
          key={p}
          href={buildHref(p)}
          className={buttonVariants({ variant: p === currentPage ? "default" : "outline", size: "icon" })}
        >
          {p}
        </Link>
      ))}

      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className="px-1 text-muted-foreground">...</span>}
          <Link href={buildHref(totalPages)} className={buttonVariants({ variant: "outline", size: "icon" })}>{totalPages}</Link>
        </>
      )}

      {currentPage < totalPages ? (
        <Link href={buildHref(currentPage + 1)} className={buttonVariants({ variant: "outline", size: "icon" })}>
          <ChevronRight className="h-4 w-4" />
        </Link>
      ) : (
        <span className={buttonVariants({ variant: "outline", size: "icon" }) + " pointer-events-none opacity-50"}>
          <ChevronRight className="h-4 w-4" />
        </span>
      )}
    </nav>
  );
}
