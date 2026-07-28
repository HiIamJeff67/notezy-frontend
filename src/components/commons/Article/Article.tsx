import { cn } from "@shared/util/utils";
import type { HTMLAttributes, ReactNode, RefObject } from "react";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { useLocalPreferences } from "@/hooks/localPreferences";

type ArticleNavigationItem = {
  id: string;
  title: string;
  description: string;
  weight?: 1 | 2 | 3 | 4 | 5;
  children?: ArticleNavigationItem[];
};

const ArticleScrollContext =
  createContext<RefObject<HTMLElement | null> | null>(null);

const Article = ({ className, ...props }: HTMLAttributes<HTMLElement>) => {
  const { preferences } = useLocalPreferences();
  const articleRef = useRef<HTMLElement>(null);

  return (
    <ArticleScrollContext.Provider value={articleRef}>
      <article
        ref={articleRef}
        className={cn(
          "flex h-full min-h-0 w-full flex-col gap-8 overflow-y-auto lg:flex-row",
          preferences.density === "compact"
            ? "lg:gap-4"
            : preferences.density === "comfortable"
              ? "lg:gap-8"
              : "lg:gap-6",
          className
        )}
        {...props}
      />
    </ArticleScrollContext.Provider>
  );
};

const ArticleContent = ({
  className,
  ...props
}: HTMLAttributes<HTMLElement>) => {
  const { preferences } = useLocalPreferences();

  return (
    <main
      className={cn(
        "min-w-0 max-w-6xl flex-1 py-2 pr-4 sm:pr-6 lg:py-5",
        preferences.density === "compact"
          ? "lg:pr-4"
          : preferences.density === "comfortable"
            ? "lg:pr-8"
            : "lg:pr-6",
        className
      )}
      {...props}
    />
  );
};

const ArticleParagraph = ({
  className,
  ...props
}: HTMLAttributes<HTMLElement>) => (
  <section className={cn("scroll-mt-8", className)} {...props} />
);

const ArticleParagraphHeader = ({
  className,
  ...props
}: HTMLAttributes<HTMLElement>) => (
  <header
    className={cn("min-w-0 max-w-2xl whitespace-normal break-words", className)}
    {...props}
  />
);

const ArticleParagraphContent = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "mt-8 min-w-0 max-w-2xl space-y-8 whitespace-normal break-words text-sm leading-7 text-muted-foreground",
      className
    )}
    {...props}
  />
);

const ArticleParagraphRight = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex shrink-0 items-center justify-end gap-2 self-start",
      className
    )}
    {...props}
  />
);

const ArticleParagraphSeparator = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div
    role="separator"
    className={cn("my-14 h-px w-full bg-border/60", className)}
    {...props}
  />
);

const ArticleSubParagraph = ({
  className,
  ...props
}: HTMLAttributes<HTMLElement>) => (
  <section
    className={cn(
      "scroll-mt-8 before:mx-4 before:my-8 before:block before:h-px before:bg-border/35 [&:first-of-type]:before:hidden",
      className
    )}
    {...props}
  />
);

const ArticleSubParagraphHeader = ({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) => (
  <h3
    className={cn(
      "min-w-0 whitespace-normal break-words text-xl font-semibold tracking-tight",
      className
    )}
    {...props}
  >
    {children}
  </h3>
);

const ArticleSubParagraphContent = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "mt-3 min-w-0 space-y-6 whitespace-normal break-words",
      className
    )}
    {...props}
  />
);

const ArticleSubParagraphSeparator = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div
    role="separator"
    className={cn("my-8 h-px bg-border/35", className)}
    {...props}
  />
);

interface ArticleNavigationSidebarProps {
  items: ArticleNavigationItem[];
  className?: string;
  paragraphBaseHeight?: number;
  subParagraphBaseHeight?: number;
  onNavigate?: (item: ArticleNavigationItem) => void;
}

const ArticleNavigationSidebar = ({
  items,
  className,
  paragraphBaseHeight = 24,
  subParagraphBaseHeight = 12,
  onNavigate,
}: ArticleNavigationSidebarProps) => {
  const { t } = useTranslation();
  const { preferences } = useLocalPreferences();
  const [activeId, setActiveId] = useState<string | undefined>();
  const articleRef = useContext(ArticleScrollContext);
  const itemIds = useMemo(() => {
    const ids: string[] = [];
    const addItemIds = (navigationItems: ArticleNavigationItem[]) => {
      for (const item of navigationItems) {
        ids.push(item.id);
        if (item.children) addItemIds(item.children);
      }
    };

    addItemIds(items);
    return ids;
  }, [items]);

  useEffect(() => {
    const articleElement = articleRef?.current;
    if (!articleElement) return;

    let animationFrame: number | undefined;
    const updateActiveItem = () => {
      const articleTop = articleElement.getBoundingClientRect().top;
      const sections = Array.from(
        articleElement.querySelectorAll<HTMLElement>("section[id]")
      ).filter(section => itemIds.includes(section.id));
      const activeSection =
        sections
          .filter(
            section => section.getBoundingClientRect().top <= articleTop + 96
          )
          .at(-1) ?? sections[0];

      setActiveId(activeSection?.id);
    };
    const onScroll = () => {
      if (animationFrame !== undefined) cancelAnimationFrame(animationFrame);
      animationFrame = requestAnimationFrame(updateActiveItem);
    };

    updateActiveItem();
    articleElement.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      if (animationFrame !== undefined) cancelAnimationFrame(animationFrame);
      articleElement.removeEventListener("scroll", onScroll);
    };
  }, [articleRef, itemIds]);

  const renderItem = (
    item: ArticleNavigationItem,
    depth: number
  ): ReactNode => {
    const isRoot = depth === 0;
    const visualHeight = Math.max(
      1,
      Math.round(
        (isRoot ? paragraphBaseHeight : subParagraphBaseHeight) *
          (isRoot
            ? [2 / 3, 1, 1, 4 / 3, 5 / 3]
            : [1 / 6, 2 / 3, 1, 4 / 3, 7 / 3])[(item.weight ?? 3) - 1]
      )
    );
    const isActive = activeId === item.id;

    return (
      <div
        key={item.id}
        className={cn(
          "flex flex-col items-center",
          isRoot ? "space-y-0.5" : "space-y-0"
        )}
      >
        <HoverCard openDelay={150} closeDelay={100}>
          <HoverCardTrigger asChild>
            <button
              type="button"
              className={cn(
                "group/article-node flex w-full items-center justify-center outline-none",
                isRoot ? "h-2" : "h-1.5"
              )}
              aria-current={isActive ? "location" : undefined}
              aria-label={item.title}
              onClick={() => {
                setActiveId(item.id);
                onNavigate?.(item);
                if (typeof document !== "undefined") {
                  document.getElementById(item.id)?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  });
                }
              }}
            >
              <span
                style={{ width: visualHeight }}
                className={cn(
                  "h-px origin-center transition-[transform,background-color] duration-200 group-hover/article-node:scale-x-150 group-focus-visible/article-node:scale-x-150",
                  isActive
                    ? "bg-foreground"
                    : isRoot
                      ? "bg-foreground/35 group-hover/article-node:bg-foreground/70 group-focus-visible/article-node:bg-foreground/70"
                      : "bg-foreground/15 group-hover/article-node:bg-foreground/70 group-focus-visible/article-node:bg-foreground/70"
                )}
              />
            </button>
          </HoverCardTrigger>
          <HoverCardContent side="right" align="center" className="w-60">
            <p className="font-medium">{item.title}</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {item.description}
            </p>
          </HoverCardContent>
        </HoverCard>
        {item.children && item.children.length > 0 && (
          <div className="flex flex-col items-center gap-0">
            {item.children.map(child => renderItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside
      className={cn(
        "hidden shrink-0 lg:sticky lg:block lg:top-1/2 lg:h-fit lg:-translate-y-1/2",
        preferences.density === "compact"
          ? "lg:w-12"
          : preferences.density === "comfortable"
            ? "lg:w-20"
            : "lg:w-16",
        className
      )}
    >
      <nav
        aria-label={t("workspace.accessibility.articleNavigation")}
        className={
          items.some(item => item.children?.length) ? "space-y-7" : "space-y-3"
        }
      >
        {items.map(item => renderItem(item, 0))}
      </nav>
    </aside>
  );
};

export type { ArticleNavigationItem };
export {
  Article,
  ArticleContent,
  ArticleNavigationSidebar,
  ArticleParagraph,
  ArticleParagraphContent,
  ArticleParagraphHeader,
  ArticleParagraphRight,
  ArticleParagraphSeparator,
  ArticleSubParagraph,
  ArticleSubParagraphContent,
  ArticleSubParagraphHeader,
  ArticleSubParagraphSeparator,
};
