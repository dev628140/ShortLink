"use server";

import { ApiResponse } from "@/lib/types";
import { auth } from "@/server/auth";
import { db } from "@/server/db";

export type UrlWithUser = {
  id: number;
  originalUrl: string;
  shortCode: string;
  createdAt: Date;
  clicks: number;
  userId: string | null;
  userName: string | null;
  userEmail: string | null;
};

type GetAllUrlsOptions = {
  page?: number;
  limit?: number;
  sortBy?: "originalUrl" | "shortCode" | "createdAt" | "clicks" | "userName";
  sortOrder?: "asc" | "desc";
  search?: string;
  filter?: "all";
};

export async function getAllUrls(
  options: GetAllUrlsOptions = {}
): Promise<ApiResponse<{ urls: UrlWithUser[]; total: number }>> {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    if (session.user.role !== "admin") {
      return { success: false, error: "Unauthorized" };
    }

    const {
      page = 1,
      limit = 10,
      search = "",
      filter = "all",
    } = options;

    const offset = (page - 1) * limit;

    const allUrls = await db.query.urls.findMany({
      with: { user: true },
    });

    // transform data to include user info
    let transformedUrls: UrlWithUser[] = allUrls.map((url) => ({
      id: url.id,
      originalUrl: url.originalUrl,
      shortCode: url.shortCode,
      createdAt: url.createdAt,
      clicks: url.clicks,
      userId: url.userId,
      userName: url.user?.name || null,
      userEmail: url.user?.email || null,
    }));

    // apply search filter
    if (search) {
      transformedUrls = transformedUrls.filter(
        (url) =>
          url.originalUrl.toLowerCase().includes(search.toLowerCase()) ||
          url.shortCode.toLowerCase().includes(search.toLowerCase()) ||
          (url.userName?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
          (url.userEmail?.toLowerCase().includes(search.toLowerCase()) ?? false)
      );
    }

    // apply filter - only 'all' is supported now
    if (filter !== "all") {
      transformedUrls = [];
    }

    const total = transformedUrls.length;

    // apply pagination
    const paginatedUrls = transformedUrls.slice(offset, offset + limit);

    return {
      success: true,
      data: {
        urls: paginatedUrls,
        total: total,
      },
    };
  } catch (error) {
    console.error("Error getting all URLs:", error);
    return { success: false, error: "Internal Server Error" };
  }
}
