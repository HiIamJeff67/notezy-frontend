"use client";

import { useSearchShelvesLazyQuery } from "@/graphql/generated/hooks";
import {
  SearchShelfInput,
  SearchShelfSortBy,
  SearchSortOrder,
} from "@/graphql/generated/types";
import { useState } from "react";

export function ExampleSearchShelves() {
  const [searchInput, setSearchInput] = useState<SearchShelfInput>({
    query: "",
    first: 10,
    after: null,
    sortBy: SearchShelfSortBy.Relevance,
    sortOrder: SearchSortOrder.Asc,
  });

  const [executeSearch, { data, loading, error, fetchMore }] =
    useSearchShelvesLazyQuery({
      notifyOnNetworkStatusChange: true,
      onCompleted: data => {
        console.log("✅ Search completed:", data);
      },
      onError: error => {
        console.error("❌ Search error:", error);
      },
    });

  const handleSearch = () => {
    console.log("🔍 Executing search with input:", searchInput);

    executeSearch({
      variables: { input: searchInput },
    });
  };

  const loadMore = () => {
    if (!data?.searchShelves.searchPageInfo.hasNextPage) return;

    console.log("📄 Loading more...");
    fetchMore({
      variables: {
        input: {
          ...searchInput,
          after: data.searchShelves.searchPageInfo.endEncodedSearchCursor,
        },
      },
    });
  };

  if (data) {
    console.log("📊 Current search results:", {
      totalCount: data.searchShelves.totalCount,
      searchTime: data.searchShelves.searchTime,
      results: data.searchShelves.searchEdges.map(edge => edge.node),
    });
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 搜尋控制面板 */}
        <div className="bg-card text-card-foreground rounded-lg border p-6">
          <h2 className="text-2xl font-bold mb-4">搜尋 Shelves</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* 搜尋查詢 */}
            <div>
              <input
                type="text"
                value={searchInput.query}
                onChange={e =>
                  setSearchInput(prev => ({ ...prev, query: e.target.value }))
                }
                placeholder="搜尋關鍵字..."
                className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                onKeyDown={e => e.key === "Enter" && handleSearch()}
              />
            </div>

            {/* 排序方式 */}
            <div>
              <select
                value={searchInput.sortBy || "RELEVANCE"}
                onChange={e =>
                  setSearchInput(prev => ({
                    ...prev,
                    sortBy: e.target.value as any,
                  }))
                }
                className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="RELEVANCE">相關性</option>
                <option value="CREATED_AT">建立時間</option>
                <option value="LAST_UPDATE">更新時間</option>
                <option value="NAME">名稱</option>
              </select>
            </div>

            {/* 排序順序 */}
            <div>
              <select
                value={searchInput.sortOrder || "DESC"}
                onChange={e =>
                  setSearchInput(prev => ({
                    ...prev,
                    sortOrder: e.target.value as any,
                  }))
                }
                className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="DESC">降序</option>
                <option value="ASC">升序</option>
              </select>
            </div>
          </div>

          {/* 搜尋按鈕 */}
          <button
            onClick={handleSearch}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            搜尋
          </button>
        </div>

        {/* 簡化的結果顯示 */}
        {data && (
          <div className="bg-card text-card-foreground rounded-lg border p-6">
            <h3 className="text-xl font-semibold mb-4">
              搜尋結果 ({data.searchShelves.totalCount})
            </h3>

            <div className="space-y-3">
              {data.searchShelves.searchEdges.map(({ node: shelf }) => (
                <div
                  key={shelf.id}
                  className="border border-border rounded-lg p-4"
                >
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">{shelf.name}</h4>
                    <span className="text-sm text-muted-foreground">
                      {shelf.totalShelfNodes} 節點 | {shelf.totalMaterials} 材料
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* 載入更多 */}
            {data.searchShelves.searchPageInfo.hasNextPage && (
              <button
                onClick={loadMore}
                className="mt-4 px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80"
              >
                載入更多
              </button>
            )}
          </div>
        )}

        {/* 載入狀態 */}
        {loading && (
          <div className="bg-card text-card-foreground rounded-lg border p-6 text-center">
            <div className="text-muted-foreground">載入中...</div>
          </div>
        )}
      </div>
    </div>
  );
}
