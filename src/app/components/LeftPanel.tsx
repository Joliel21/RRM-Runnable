import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import type {
  MagazinePage,
  TOCEntry,
} from "@/app/data/magazine-data";
import {
  LAYOUT_REGISTRY,
  type ContentBlock,
} from "@/app/components/MagazinePageLayouts";
import type { SearchEntry } from "@/app/components/SearchPanel";

const THUMBNAIL_PAGE_WIDTH = 480;
const THUMBNAIL_PAGE_HEIGHT = 660;

const normalizeSearchText = (value: string) =>
  value.toLowerCase().replace(/\s+/g, " ").trim();

const buildSearchSnippet = (text: string, query: string) => {
  const cleanText = text.replace(/\s+/g, " ").trim();
  const normalizedText = normalizeSearchText(cleanText);
  const normalizedQuery = normalizeSearchText(query);
  const matchIndex = normalizedText.indexOf(normalizedQuery);

  if (matchIndex < 0) {
    return cleanText.length > 120
      ? `${cleanText.slice(0, 120).trim()}...`
      : cleanText;
  }

  const start = Math.max(0, matchIndex - 45);
  const end = Math.min(
    cleanText.length,
    matchIndex + normalizedQuery.length + 70,
  );
  const prefix = start > 0 ? "..." : "";
  const suffix = end < cleanText.length ? "..." : "";

  return `${prefix}${cleanText.slice(start, end).trim()}${suffix}`;
};

interface ThumbnailPreviewProps {
  thumbnail: {
    pageNumber: number;
    imageUrl?: string;
    page?: MagazinePage;
    blocks?: ContentBlock[];
  };
}

function ThumbnailPreview({
  thumbnail,
}: ThumbnailPreviewProps) {
  const previewRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.28);

  useEffect(() => {
    const element = previewRef.current;
    if (!element) return;

    const updateScale = () => {
      const rect = element.getBoundingClientRect();
      const nextScale = Math.min(
        rect.width / THUMBNAIL_PAGE_WIDTH,
        rect.height / THUMBNAIL_PAGE_HEIGHT,
      );

      if (Number.isFinite(nextScale) && nextScale > 0) {
        setScale(nextScale);
      }
    };

    updateScale();

    const resizeObserver = new ResizeObserver(updateScale);
    resizeObserver.observe(element);

    return () => resizeObserver.disconnect();
  }, []);

  const page = thumbnail.page;
  const LayoutComponent =
    page?.type === "layout" &&
    page.layoutId &&
    LAYOUT_REGISTRY[page.layoutId]
      ? LAYOUT_REGISTRY[page.layoutId]
      : null;

  return (
    <div
      ref={previewRef}
      className="aspect-[3/4] bg-[var(--brand-primary)] rounded-lg overflow-hidden shadow-md group-hover:shadow-lg group-hover:shadow-[var(--brand-secondary)]/20 transition-shadow border border-[var(--brand-secondary)]/30 flex items-center justify-center"
    >
      {thumbnail.imageUrl ? (
        <img
          src={thumbnail.imageUrl}
          alt={`Page ${thumbnail.pageNumber}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
        />
      ) : LayoutComponent && page ? (
        <div
          className="relative pointer-events-none select-none"
          style={{
            width: THUMBNAIL_PAGE_WIDTH,
            height: THUMBNAIL_PAGE_HEIGHT,
            transform: `scale(${scale})`,
            transformOrigin: "center center",
          }}
        >
          <LayoutComponent
            page={page}
            isEditable={false}
            blocks={thumbnail.blocks}
          />
        </div>
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-[var(--brand-surface)] text-[var(--brand-primary)] text-sm font-sans select-none">
          Page {thumbnail.pageNumber}
        </div>
      )}
    </div>
  );
}

interface LeftPanelProps {
  isOpen: boolean;
  type: "toc" | "thumbnails" | null;
  tocEntries?: TOCEntry[];
  thumbnails?: {
    pageNumber: number;
    imageUrl?: string;
    page?: MagazinePage;
    blocks?: ContentBlock[];
  }[];
  onClose: () => void;
  onNavigate: (pageNumber: number) => void;
  searchEntries?: SearchEntry[];
  searchQuery?: string;
  onSearchQueryChange?: (query: string) => void;
  topOffset?: number;
}

export function LeftPanel({
  isOpen,
  type,
  tocEntries = [],
  thumbnails = [],
  onClose,
  onNavigate,
  searchEntries = [],
  searchQuery = "",
  onSearchQueryChange,
  topOffset = 0,
}: LeftPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      closeButtonRef.current?.focus();

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          onClose();
        }
      };

      document.addEventListener("keydown", handleKeyDown);
      return () =>
        document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen || !type) {
    return null;
  }

  const handleNavigate = (pageNumber: number) => {
    onNavigate(pageNumber);
    onClose();
  };

  const normalizedSearchQuery =
    normalizeSearchText(searchQuery);
  const searchResults =
    type === "toc" && normalizedSearchQuery.length >= 2
      ? searchEntries
          .map((entry) => {
            const searchable = normalizeSearchText(
              `${entry.articleTitle || ""} ${entry.pageTitle || ""} ${entry.title} ${entry.chapter || ""} ${entry.text}`,
            );
            const terms = normalizedSearchQuery
              .split(" ")
              .map((term) => term.trim())
              .filter(Boolean);
            const hasExactMatch = searchable.includes(
              normalizedSearchQuery,
            );
            const matchedTerms = terms.filter((term) =>
              searchable.includes(term),
            );

            if (!hasExactMatch && matchedTerms.length === 0) {
              return null;
            }

            const score =
              (hasExactMatch ? 100 : 0) +
              matchedTerms.length * 10 +
              (normalizeSearchText(
                entry.articleTitle || entry.title,
              ).includes(normalizedSearchQuery)
                ? 60
                : 0) +
              (normalizeSearchText(
                entry.pageTitle || "",
              ).includes(normalizedSearchQuery)
                ? 35
                : 0) +
              (entry.chapter &&
              normalizeSearchText(entry.chapter).includes(
                normalizedSearchQuery,
              )
                ? 25
                : 0);

            return {
              ...entry,
              score,
              snippet: buildSearchSnippet(
                entry.text,
                hasExactMatch
                  ? searchQuery
                  : matchedTerms[0] || searchQuery,
              ),
            };
          })
          .filter(
            (
              result,
            ): result is SearchEntry & {
              score: number;
              snippet: string;
            } => Boolean(result),
          )
          .sort(
            (a, b) =>
              b.score - a.score || a.pageNumber - b.pageNumber,
          )
          .slice(0, 40)
      : [];

  const showSearchResults =
    type === "toc" && normalizedSearchQuery.length >= 2;

  return (
    <>
      <div
        className="absolute left-0 right-0 bottom-0 bg-[#2D2D2D]/30 z-40 backdrop-blur-sm"
        style={{ top: topOffset }}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        ref={panelRef}
        className="absolute left-0 bottom-0 w-[min(100vw,20rem)] md:w-96 bg-[var(--brand-ink)] z-50 shadow-2xl flex flex-col border-r border-[var(--brand-secondary)]/30 font-sans"
        style={{ top: topOffset }}
        role="complementary"
        aria-label={
          type === "toc"
            ? "Table of contents"
            : "Page thumbnails"
        }
      >
        <div className="border-b border-[var(--brand-secondary)]/30 bg-[var(--brand-ink)]">
          <div className="flex items-center justify-between p-4 pb-3">
            {type === "toc" ? (
              <h2
                className="text-lg font-medium select-none tracking-wide font-sans"
                style={{ color: "var(--brand-surface)" }}
              >
                Table of Contents
              </h2>
            ) : (
              <h2 className="text-lg font-medium select-none tracking-wide font-sans text-[var(--brand-accent-light)]">
                Thumbnails
              </h2>
            )}

            <Button
              ref={closeButtonRef}
              variant="ghost"
              size="sm"
              onClick={onClose}
              aria-label="Close panel"
              className="text-[var(--brand-accent-light)] hover:bg-[var(--brand-primary)]/50 hover:text-[var(--brand-surface)]"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {type === "toc" && (
            <div className="px-4 pb-4">
              <label
                className="sr-only"
                htmlFor="toc-magazine-search"
              >
                Search magazine topics
              </label>
              <div className="flex h-10 items-center gap-2 rounded-full border border-[var(--brand-border)]/60 bg-[var(--brand-surface)] px-4 text-[var(--brand-ink)] shadow-sm">
                <Search className="h-4 w-4 flex-shrink-0 text-[var(--brand-secondary)]" />
                <input
                  id="toc-magazine-search"
                  type="search"
                  value={searchQuery}
                  onChange={(event) =>
                    onSearchQueryChange?.(event.target.value)
                  }
                  placeholder="Search topics..."
                  className="min-w-0 flex-1 bg-transparent text-sm text-[var(--brand-ink)] outline-none placeholder:text-[var(--brand-secondary)]/70"
                />
              </div>
            </div>
          )}
        </div>

        <div
          className="flex-1 overflow-y-auto overscroll-contain"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {type === "toc" &&
            (showSearchResults ? (
              <section
                className="p-4"
                aria-label="Search results"
              >
                {searchResults.length === 0 ? (
                  <div className="rounded-xl border border-[var(--brand-secondary)]/30 bg-[var(--brand-primary)]/55 px-4 py-8 text-center text-sm text-[var(--brand-accent)]/80">
                    No matches found for “{searchQuery.trim()}”.
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="px-1 text-xs text-[var(--brand-accent)]/75">
                      {searchResults.length}{" "}
                      {searchResults.length === 1
                        ? "result"
                        : "results"}
                    </div>

                    {searchResults.map((result) => {
                      const articleName =
                        result.articleTitle || result.title;
                      const pageLabel = `p${result.pageNumber}`;

                      return (
                        <article
                          key={`${result.id}-${result.pageNumber}`}
                          className="rounded-xl border border-[var(--brand-border)]/60 bg-[var(--brand-surface)] p-4 text-[var(--brand-ink)] shadow-sm"
                        >
                          <button
                            type="button"
                            onClick={() =>
                              handleNavigate(result.pageNumber)
                            }
                            className="flex w-full items-start justify-between gap-3 text-left focus:outline-none focus:ring-1 focus:ring-[var(--brand-accent-light)]"
                            aria-label={`Open ${articleName} on page ${result.pageNumber}`}
                          >
                            <span className="min-w-0 flex-1 text-sm font-medium leading-snug text-[var(--brand-ink)] underline-offset-4 hover:underline">
                              {articleName}
                            </span>
                            <span className="flex-shrink-0 rounded-full px-2 py-0.5 text-sm font-medium text-[var(--brand-secondary)] underline-offset-4 hover:bg-[var(--brand-secondary)]/10 hover:underline">
                              {pageLabel}
                            </span>
                          </button>

                          {result.pageTitle &&
                            result.pageTitle !==
                              articleName && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleNavigate(
                                    result.pageNumber,
                                  )
                                }
                                className="mt-1 block max-w-full truncate text-left text-xs text-[var(--brand-secondary)] underline-offset-4 hover:underline focus:outline-none"
                              >
                                {result.pageTitle}
                              </button>
                            )}

                          {result.snippet && (
                            <button
                              type="button"
                              onClick={() =>
                                handleNavigate(
                                  result.pageNumber,
                                )
                              }
                              className="mt-2 block w-full text-left text-xs leading-relaxed text-[var(--brand-ink)]/75 focus:outline-none"
                            >
                              <span className="line-clamp-3">
                                {result.snippet}
                              </span>
                            </button>
                          )}
                        </article>
                      );
                    })}
                  </div>
                )}
              </section>
            ) : (
              <nav aria-label="Magazine sections">
                <ul className="p-4 space-y-3">
                  {tocEntries.map((entry) => {
                    const isChapter =
                      entry.id.startsWith("toc-chapter-");

                    return (
                      <li key={entry.id}>
                        <button
                          onClick={() =>
                            handleNavigate(entry.pageNumber)
                          }
                          className={`w-full text-left rounded-xl transition-colors select-none flex items-start gap-3 border focus:outline-none focus:ring-1 focus:ring-[var(--brand-accent-light)] shadow-sm p-4 font-sans ${
                            isChapter
                              ? "bg-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/80 focus:bg-[var(--brand-primary)]/80 border-[var(--brand-accent-light)]/50"
                              : "bg-[var(--brand-surface)] hover:bg-[var(--brand-hover)] focus:bg-[var(--brand-hover)] border-[var(--brand-border)]/60"
                          }`}
                        >
                          <div className="flex flex-col flex-1 gap-1">
                            <div className="flex items-start justify-between gap-3">
                              <span
                                className={`tracking-wide ${
                                  isChapter
                                    ? "font-semibold text-[var(--brand-surface)]"
                                    : "font-normal text-[var(--brand-ink)]"
                                }`}
                                style={{
                                  fontSize:
                                    "calc(0.875rem + 1pt)",
                                }}
                              >
                                {entry.title}
                              </span>

                              <span
                                className={`flex-shrink-0 ${
                                  isChapter
                                    ? "font-medium text-[var(--brand-surface)]/85"
                                    : "font-normal text-[var(--brand-secondary)]"
                                }`}
                                style={{
                                  fontSize:
                                    "calc(0.75rem + 1pt)",
                                }}
                              >
                                {entry.pageRange ||
                                  `p${entry.pageNumber}`}
                              </span>
                            </div>
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            ))}

          {type === "thumbnails" && (
            <div className="p-4">
              <div
                className="grid grid-cols-2 gap-4"
                role="list"
                aria-label="Page thumbnails"
              >
                {thumbnails.map((thumb) => (
                  <div key={thumb.pageNumber} role="listitem">
                    <div
                      onClick={() =>
                        handleNavigate(thumb.pageNumber)
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleNavigate(thumb.pageNumber);
                        }
                      }}
                      className="relative group focus:outline-none focus:ring-2 focus:ring-[var(--brand-accent-light)] focus:ring-offset-2 focus:ring-offset-[var(--brand-ink)] rounded-lg select-none cursor-pointer block w-full text-left"
                      aria-label={`Go to page ${thumb.pageNumber}`}
                      role="button"
                      tabIndex={0}
                    >
                      <ThumbnailPreview thumbnail={thumb} />

                      <div className="absolute bottom-2 right-2 bg-[var(--brand-ink)]/90 text-[var(--brand-accent-light)] text-xs px-2 py-1 rounded shadow border border-[var(--brand-secondary)]/30 select-none font-sans">
                        {thumb.pageNumber}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}