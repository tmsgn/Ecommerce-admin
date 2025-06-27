'use client'
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { ChevronRight, MoreHorizontal } from "lucide-react"
import { usePathname } from 'next/navigation'

import { cn } from "@/lib/utils"

function Breadcrumb({ ...props }: React.ComponentProps<"nav">) {
  return <nav aria-label="breadcrumb" data-slot="breadcrumb" {...props} />
}

function BreadcrumbList({ className, ...props }: React.ComponentProps<"ol">) {
  return (
    <ol
      data-slot="breadcrumb-list"
      className={cn(
        "text-muted-foreground flex flex-wrap items-center gap-1.5 text-sm break-words sm:gap-2.5",
        className
      )}
      {...props}
    />
  )
}

function BreadcrumbItem({ className, ...props }: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="breadcrumb-item"
      className={cn("inline-flex items-center gap-1.5", className)}
      {...props}
    />
  )
}

function BreadcrumbLink({
  asChild,
  className,
  ...props
}: React.ComponentProps<"a"> & {
  asChild?: boolean
}) {
  const Comp = asChild ? Slot : "a"

  return (
    <Comp
      data-slot="breadcrumb-link"
      className={cn("hover:text-foreground transition-colors", className)}
      {...props}
    />
  )
}

function BreadcrumbPage({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="breadcrumb-page"
      role="link"
      aria-disabled="true"
      aria-current="page"
      className={cn("text-foreground font-normal", className)}
      {...props}
    />
  )
}

function BreadcrumbSeparator({
  children,
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="breadcrumb-separator"
      role="presentation"
      aria-hidden="true"
      className={cn("[&>svg]:size-3.5", className)}
      {...props}
    >
      {children ?? <ChevronRight />}
    </span>
  )
}

function BreadcrumbEllipsis({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="breadcrumb-ellipsis"
      role="presentation"
      aria-hidden="true"
      className={cn("flex size-9 items-center justify-center", className)}
      {...props}
    >
      <MoreHorizontal className="size-4" />
      <span className="sr-only">More</span>
    </span>
  )
}

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
}

export function DynamicBreadcrumbs() {
  'use client';
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  // Map for friendly names
  const segmentLabelMap: Record<string, string> = {
    dashboard: 'Dashboard',
    products: 'Products',
    // Add more mappings as needed
  };

  // Optionally skip these segments
  const skipSegments = ['app', '(admin)'];

  let path = '';
  const crumbs = segments
    .filter((seg: string) => !skipSegments.includes(seg))
    .map((segment: string, idx: number) => {
      path += `/${segment}`;
      let label = segmentLabelMap[segment] || segment;
      // Replace storeid (if it's the first segment and not mapped)
      if (idx === 0 && !segmentLabelMap[segment]) {
        label = 'Store';
      } else if (!segmentLabelMap[segment]) {
        label = segment.replace(/[-_]/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());
      }
      const isLast = idx === segments.filter((seg: string) => !skipSegments.includes(seg)).length - 1;
      return (
        <BreadcrumbItem key={path}>
          {isLast ? (
            <BreadcrumbPage>{label}</BreadcrumbPage>
          ) : (
            <BreadcrumbLink href={path}>{label}</BreadcrumbLink>
          )}
          {!isLast && <BreadcrumbSeparator />}
        </BreadcrumbItem>
      );
    });

  return (
    <Breadcrumb>
      <BreadcrumbList>{crumbs}</BreadcrumbList>
    </Breadcrumb>
  );
}
