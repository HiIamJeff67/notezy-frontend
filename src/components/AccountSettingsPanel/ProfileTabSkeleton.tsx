import { memo } from "react";

const ProfileTabSkeleton = memo(() => {
  return (
    <div className="w-full h-full overflow-y-scroll">
      {/* 背景區域骨架 */}
      <div
        className="relative w-full group"
        style={{ minHeight: 180, background: "var(--foreground)" }}
      >
        {/* 簡化的背景提示 */}
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
          <div className="bg-background/10 rounded-lg px-6 py-3">
            <div className="h-6 w-48 bg-background/30 rounded" />
          </div>
        </div>

        {/* Avatar 骨架 */}
        <div className="absolute right-8 bottom-[-64px] z-10">
          <div className="w-32 h-32 rounded-full border-4 border-border shadow-lg bg-background">
            <div className="w-full h-full bg-muted rounded-full" />
          </div>
        </div>

        <div style={{ height: 120 }} />
      </div>

      {/* 表單區域骨架 */}
      <div className="px-8 pt-12 pb-8 bg-secondary flex flex-col gap-4">
        {/* 個人標題欄位 */}
        <div className="space-y-2">
          <div className="h-4 w-20 bg-muted rounded" />
          <div className="h-10 w-full bg-background border border-input rounded-md" />
        </div>

        {/* 自我介紹欄位 */}
        <div className="space-y-2">
          <div className="h-4 w-20 bg-muted rounded" />
          <div className="h-24 w-full bg-background border border-input rounded-md" />
        </div>

        {/* 表單欄位網格 - 簡化版 */}
        <div className="flex flex-wrap gap-6 text-sm">
          {/* 4個簡單的欄位骨架 */}
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-12 bg-muted rounded" />
              <div className="h-10 w-32 bg-background border border-input rounded-md" />
            </div>
          ))}
        </div>

        {/* 按鈕組 */}
        <div className="flex justify-start gap-2 mt-4">
          <div className="h-10 w-32 bg-primary rounded-md" />
          <div className="h-10 w-32 bg-destructive rounded-md" />
        </div>
      </div>
    </div>
  );
});

export default ProfileTabSkeleton;
