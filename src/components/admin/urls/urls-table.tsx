"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UrlWithUser } from "@/server/actions/admin/urls/get-all-urls";
import { formatDistanceToNow } from "date-fns";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Copy,
  ExternalLink,
  Loader2,
  MoreHorizontal,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface UrlsTableProps {
  urls: UrlWithUser[];
  total: number;
  currentPage: number;
  currentSearch: string;
  currentSortBy: string;
  currentSortOrder: string;
}

export function UrlsTable({
  urls,
  total,
  currentPage,
  currentSearch,
  currentSortBy,
  currentSortOrder,
}: UrlsTableProps) {
  const router = useRouter();
  const [copyingId, setCopyingId] = useState<number | null>(null);

  // Get the current path from window location or default to /admin/urls
  const basePath =
    typeof window !== "undefined" ? window.location.pathname : "/admin/urls";

  // Extract any additional query parameters that should be preserved
  const preserveParams = () => {
    if (typeof window === "undefined") return "";

    const url = new URL(window.location.href);
    const params = new URLSearchParams(url.search);
    let paramString = "";

    // Preserve filter parameter if it exists
    if (params.has("filter")) {
      paramString += `&filter=${params.get("filter")}`;
    }

    return paramString;
  };

  const limit = 10;
  const totalPage = Math.ceil(total / limit);

  const handleSort = (column: string) => {
    const params = new URLSearchParams();

    if (currentSearch) {
      params.set("search", currentSearch);
    }

    params.set("sortBy", column);

    if (currentSortBy === column) {
      params.set("sortOrder", currentSortOrder === "asc" ? "desc" : "asc");
    } else {
      params.set("sortOrder", "asc");
    }

    params.set("page", "1");

    router.push(`${basePath}?${params.toString()}`);
  };

  const getPaginationItems = () => {
    const items = [];
    const additionalParams = preserveParams();

    // always show first page
    items.push(
      <PaginationItem key={"first"}>
        <PaginationLink
          href={`${basePath}?page=1${
            currentSearch ? `&search=${currentSearch}` : ""
          }${
            currentSortBy
              ? `&sortBy=${currentSortBy}&sortOrder=${currentSortOrder}`
              : ""
          }${additionalParams}`}
          isActive={currentPage === 1}
        >
          1
        </PaginationLink>
      </PaginationItem>
    );

    if (currentPage > 3) {
      items.push(
        <PaginationItem key={"ellipsis-1"}>
          <PaginationEllipsis />
        </PaginationItem>
      );
    }

    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPage - 1, currentPage + 1);
      i++
    ) {
      if (i === 1 || i === totalPage) continue;

      items.push(
        <PaginationItem key={i}>
          <PaginationLink
            href={`${basePath}?page=${i}${
              currentSearch ? `&search=${currentSearch}` : ""
            }${
              currentSortBy
                ? `&sortBy=${currentSortBy}&sortOrder=${currentSortOrder}`
                : ""
            }${additionalParams}`}
            isActive={currentPage === i}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }

    if (currentPage < totalPage - 2) {
      items.push(
        <PaginationItem key={"ellipsis-2"}>
          <PaginationEllipsis />
        </PaginationItem>
      );
    }

    if (totalPage > 1) {
      items.push(
        <PaginationItem key={"last"}>
          <PaginationLink
            href={`${basePath}?page=${totalPage}${
              currentSearch ? `&search=${currentSearch}` : ""
            }${
              currentSortBy
                ? `&sortBy=${currentSortBy}&sortOrder=${currentSortOrder}`
                : ""
            }${additionalParams}`}
            isActive={currentPage === totalPage}
          >
            {totalPage}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return items;
  };

  const getSortIcon = (column: string) => {
    if (currentSortBy !== column) {
      return <ArrowUpDown className="ml-2 size-4" />;
    }

    return currentSortOrder === "asc" ? (
      <ArrowUp className="ml-2 size-4" />
    ) : (
      <ArrowDown className="ml-2 size-4" />
    );
  };

  const truncateUrl = (url: string, maxLenght = 50) => {
    if (url.length <= maxLenght) return url;
    return url.substring(0, maxLenght) + "...";
  };

  const copyToClipboard = async (id: number, shortCode: string) => {
    try {
      setCopyingId(id);
      const shortUrl = `${window.location.origin}/r/${shortCode}`;
      await navigator.clipboard.writeText(shortUrl);
      toast.success("Short URL copied to clipboard.");
    } catch (error) {
      console.error("Error copying URL to clipboard", error);
      toast.error("Failed to copy short URL to clipboard.");
    } finally {
      setTimeout(() => {
        setCopyingId(null);
      }, 1000);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">
                <button
                  className="flex items-center font-medium"
                  onClick={() => handleSort("originalUrl")}
                >
                  Original URL
                  {getSortIcon("originalUrl")}
                </button>
              </TableHead>
              <TableHead className="w-[150px]">
                <button
                  className="flex items-center font-medium"
                  onClick={() => handleSort("shortCode")}
                >
                  Short Code
                  {getSortIcon("shortCode")}
                </button>
              </TableHead>
              <TableHead className="w-[100px]">
                <button
                  className="flex items-center font-medium"
                  onClick={() => handleSort("clicks")}
                >
                  Clicks
                  {getSortIcon("clicks")}
                </button>
              </TableHead>
              <TableHead className="w-[150px]">
                <button
                  className="flex items-center font-medium"
                  onClick={() => handleSort("userName")}
                >
                  Created By
                  {getSortIcon("userName")}
                </button>
              </TableHead>
              <TableHead className="w-[150px]">
                <button
                  className="flex items-center font-medium"
                  onClick={() => handleSort("createdAt")}
                >
                  Created
                  {getSortIcon("createdAt")}
                </button>
              </TableHead>
              <TableHead className="w-[80px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {urls.length === 0 ? (
              <TableRow>
                <TableCell>
                  {currentSearch
                    ? "No URLs found with the search term."
                    : "No URLs found."}
                </TableCell>
              </TableRow>
            ) : (
              urls.map((url) => (
                <TableRow key={url.id}>
                  <TableCell className="font-medium">
                    <a
                      href={url.originalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex items-center gap-1 max-w-[250px] truncate"
                    >
                      {truncateUrl(url.originalUrl)}
                      <ExternalLink className="size-3" />
                    </a>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <code className="bg-muted px-1 py-0.5 rounded text-sm">
                        {url.shortCode}
                      </code>
                      <Button
                        variant={"ghost"}
                        size={"icon"}
                        className="size-6"
                        onClick={() => copyToClipboard(url.id, url.shortCode)}
                        disabled={copyingId === url.id}
                      >
                        {copyingId === url.id ? (
                          <Loader2 className="size-3 animate-spin" />
                        ) : (
                          <Copy className="size-3" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={"secondary"}>{url.clicks}</Badge>
                  </TableCell>
                  <TableCell>
                    {url.userId ? (
                      <div className="flex items-center gap-2">
                        <Avatar className="size-6">
                          <AvatarImage
                            src={undefined}
                            alt={url.userName || "User"}
                          />
                          <AvatarFallback className="text-xs">
                            {url.userName?.substring(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <span>
                          {url.userName || url.userEmail || "Unknown User"}
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">
                        Anyonymous
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {formatDistanceToNow(new Date(url.createdAt), {
                      addSuffix: true,
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant={"ghost"} size={"icon"}>
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => copyToClipboard(url.id, url.shortCode)}
                        >
                          Copy Short URL
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <a
                            href={url.originalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Visit Original URL
                          </a>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
