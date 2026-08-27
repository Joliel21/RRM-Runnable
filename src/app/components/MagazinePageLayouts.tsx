import { MagazinePage } from "@/app/data/magazine-data";
import { useDrag, useDrop } from "react-dnd";
import {
  useRef,
  useState,
  useEffect,
  useCallback,
  useLayoutEffect,
  type CSSProperties,
} from "react";
import { CollageBlock } from "./CollageBlock";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Resizable } from "re-resizable";
import Draggable from "react-draggable";
import ReactMarkdown from "react-markdown";
import {
  CommunityGalleryPage98,
  CommunityGalleryPage99,
  CommunityGalleryPage100,
  CommunityGalleryPage101,
  CommunityGalleryPage102,
  CommunityGalleryPage103,
} from "./community-gallery";

import { resolveRepositoryAssetUrl, resolveRepositoryRootAssetUrl } from "@/app/config/repository-assets";
import travelSeriesJoeRumneyImage from "@/assets/travel-series-joe-rumney.png";

const brandLogo = resolveRepositoryRootAssetUrl("/images/brand/rare-revolution-trademark-logo.png");

const GrainOverlay = () => (
  <div
    className="absolute inset-0 opacity-[0.04] pointer-events-none mix-blend-multiply z-0"
    style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
    }}
  ></div>
);

interface DraggableBlockProps {
  id: string;
  index: number;
  moveBlock: (
    index: number,
    pos: { x: number; y: number },
  ) => void;
  resizeBlock: (
    index: number,
    size: { width: string; height: string },
    pos?: { x: number; y: number },
  ) => void;
  onInteractionStart?: () => void;
  width?: string;
  height?: string;
  x?: number;
  y?: number;
  isEditable?: boolean;
  children: React.ReactNode;
}

const DraggableBlock = ({
  id,
  index,
  moveBlock,
  resizeBlock,
  onInteractionStart,
  width,
  height,
  x,
  y,
  isEditable,
  children,
}: DraggableBlockProps) => {
  const nodeRef = useRef<HTMLDivElement>(null);

  const handleCommonClass =
    "bg-blue-500 w-4 h-4 rounded-full shadow-md border-2 border-white z-[60] opacity-60 hover:opacity-100 transition-opacity absolute";
  const handleClasses = {
    top: "hidden",
    right: "hidden",
    bottom: "hidden",
    left: "hidden",
    topRight: isEditable
      ? `${handleCommonClass} right-0 top-0 translate-x-1/2 -translate-y-1/2`
      : "hidden",
    bottomRight: isEditable
      ? `${handleCommonClass} right-0 bottom-0 translate-x-1/2 translate-y-1/2`
      : "hidden",
    bottomLeft: isEditable
      ? `${handleCommonClass} left-0 bottom-0 -translate-x-1/2 translate-y-1/2`
      : "hidden",
    topLeft: isEditable
      ? `${handleCommonClass} left-0 top-0 -translate-x-1/2 -translate-y-1/2`
      : "hidden",
  };

  const enableConfig = isEditable
    ? {
        top: false,
        right: true,
        bottom: true,
        left: false,
        topRight: true,
        bottomRight: true,
        bottomLeft: true,
        topLeft: true,
      }
    : false;

  // If no position is provided (initial render or flow mode), render relatively
  if (x === undefined || y === undefined) {
    return (
      <div
        ref={nodeRef}
        className={`relative ${isEditable ? "hover:ring-2 hover:ring-blue-400" : ""}`}
        style={{ width: width || "100%" }}
        onMouseDownCapture={(e) => {
          if (isEditable && onInteractionStart) {
            onInteractionStart();
          }
        }}
      >
        <Resizable
          size={{
            width: width || "100%",
            height: height || "auto",
          }}
          onResizeStop={(e, direction, ref, d) => {
            if (onInteractionStart) onInteractionStart();
            resizeBlock(index, {
              width: ref.style.width,
              height: ref.style.height,
            });
          }}
          enable={enableConfig}
          handleClasses={handleClasses}
        >
          {children}
        </Resizable>
      </div>
    );
  }

  // Absolute positioning mode
  return (
    <Draggable
      nodeRef={nodeRef}
      position={{ x, y }}
      onStop={(e, data) =>
        moveBlock(index, { x: data.x, y: data.y })
      }
      disabled={!isEditable}
    >
      <div
        ref={nodeRef}
        className={`absolute ${isEditable ? "cursor-move hover:ring-2 hover:ring-blue-400 hover:ring-offset-2 z-50" : "z-10"}`}
        style={{ width: width || "100%" }}
      >
        {isEditable && (
          <div className="absolute -top-3 right-0 p-1 opacity-0 group-hover:opacity-100 bg-blue-500 text-white text-[10px] rounded px-2 z-[60] pointer-events-none">
            Drag
          </div>
        )}

        <Resizable
          size={{
            width: width || "100%",
            height: height || "auto",
          }}
          onResizeStop={(e, direction, ref, d) => {
            const newPos = { x, y };
            if (direction.includes("Left")) {
              newPos.x -= d.width;
            }
            if (direction.includes("Top")) {
              newPos.y -= d.height;
            }
            resizeBlock(
              index,
              {
                width: ref.style.width,
                height: ref.style.height,
              },
              newPos,
            );
          }}
          enable={enableConfig}
          handleClasses={handleClasses}
        >
          {children}
        </Resizable>
      </div>
    </Draggable>
  );
};

export interface PageLayoutProps {
  page: MagazinePage;
  onNavigate?: (pageNumber: number | "back-cover") => void;
  isEditable?: boolean;
  blocks?: ContentBlock[];
  onUpdateBlocks?: (blocks: ContentBlock[]) => void;
}

const MarginGuides = ({
  isRightPage,
}: {
  isRightPage: boolean;
}) => (
  <div className="absolute inset-0 pointer-events-none z-50">
    {/* Margins: Top 60px, Bottom 40px */}
    <div className="absolute left-0 right-0 top-[60px] border-b border-blue-600 opacity-20 border-dashed"></div>
    <div className="absolute left-0 right-0 bottom-[40px] border-t border-blue-600 opacity-20 border-dashed"></div>

    {/* Side Margins depends on Left/Right Page 
        Right Page (Odd): Left 56px (Inner/Gutter), Right 48px (Outer)
        Left Page (Even): Left 48px (Outer), Right 56px (Inner/Gutter)
    */}
    <div
      className={`absolute top-0 bottom-0 border-r border-red-600 opacity-20 border-dashed ${isRightPage ? "left-[56px]" : "left-[48px]"}`}
    ></div>
    <div
      className={`absolute top-0 bottom-0 border-l border-red-600 opacity-20 border-dashed ${isRightPage ? "right-[48px]" : "right-[56px]"}`}
    ></div>

    {/* Safe Area Content Box */}
    <div
      className="absolute border border-green-600 opacity-10 border-dashed"
      style={{
        top: "60px",
        bottom: "40px",
        left: isRightPage ? "56px" : "48px",
        right: isRightPage ? "48px" : "56px",
      }}
    ></div>
  </div>
);

// --- MASTER COMPONENT STRUCTURE ---

// Theme Helper
export type PageTheme = "light" | "dark" | "olive";

export const getPageTheme = (pageNumber: number): PageTheme => {
  return "light";
};

const PageMasterBase = ({
  children,
  pageNumber,
  className = "bg-ivory",
  dark = false,
  showGuides = false,
}: {
  children: React.ReactNode;
  pageNumber: number;
  className?: string;
  dark?: boolean;
  showGuides?: boolean;
}) => {
  // Determine if Right (Odd) or Left (Even) Page
  // Note: Usually Page 1 is Right.
  const isRightPage = pageNumber % 2 !== 0;

  // Margins per spec
  // Top: 60px
  // Bottom: 40px
  // Inner (Gutter): 56px
  // Outer: 48px

  const paddingLeft = isRightPage ? "56px" : "48px";
  const paddingRight = isRightPage ? "48px" : "56px";
  const paddingTop = "60px";
  const paddingBottom = "40px";
  return (
    <div
      className={`h-[660px] w-[480px] ${className} flex flex-col relative overflow-hidden`}
      style={{
        paddingTop,
        paddingBottom,
        paddingLeft,
        paddingRight,
      }}
    >
      {showGuides && <MarginGuides isRightPage={isRightPage} />}
      {/* 
         Content Wrapper to enforce safe area width.
         Safe Width = 480 - 56 - 48 = 376px.
      */}
      <div className="flex-1 flex flex-col w-full h-full relative">
        {children}
      </div>
    </div>
  );
};

const getMarkdownContentFromBlocks = (blocks?: ContentBlock[]) => {
  const markdownBlock = blocks?.find(
    (block) => block.type === "markdown" && typeof (block as any).content === "string",
  ) as { type: "markdown"; content: string } | undefined;

  return markdownBlock?.content || "";
};

const githubMarkdownComponents = {
  h1: ({ children }: any) => (
    <h1 className="font-serif-primary text-[19px] leading-tight font-bold mb-4 text-[#021A2B]">
      {children}
    </h1>
  ),
  h2: ({ children }: any) => (
    <h2 className="font-serif-primary text-[14px] font-bold mb-2 text-[#021A2B]">
      {children}
    </h2>
  ),
  p: ({ children }: any) => <p className="mb-2">{children}</p>,
  strong: ({ children }: any) => <strong className="font-bold">{children}</strong>,
  em: ({ children }: any) => <em className="italic">{children}</em>,
  a: ({ href, children }: any) => (
    <a href={href} target="_blank" rel="noreferrer" className="text-[#6F7552] underline underline-offset-[2px]">
      {children}
    </a>
  ),
};

export const InsideCoverLayout = ({
  page,
  blocks,
}: PageLayoutProps) => {
  const markdownContent = getMarkdownContentFromBlocks(blocks);

  return (
    <div className="h-[660px] w-[480px] relative overflow-hidden bg-[#F6F5F2] text-charcoal">
      <div
        className="absolute top-0 bottom-0 right-0 w-[36px] z-30 pointer-events-none"
        style={{
          background:
            "linear-gradient(to left, rgba(0,0,0,0.06) 0%, rgba(0,0,0,0.03) 60%, transparent 100%)",
          mixBlendMode: "multiply",
          opacity: 1,
        }}
      />

      <div className="absolute top-0 bottom-0 right-0 w-[1px] bg-black/10 z-40 pointer-events-none" />

      <div className="absolute inset-0 px-[42px] z-10">
        <div className="pt-[72px] pb-[64px] h-full overflow-hidden text-[9.5px] leading-[1.35] text-[#2D2D2D]">
          {markdownContent ? (
            <ReactMarkdown components={githubMarkdownComponents}>
              {markdownContent}
            </ReactMarkdown>
          ) : null}
        </div>
      </div>
    </div>
  );
};


const splitInsideBackCoverMarkdown = (markdown = "") => {
  const sections = String(markdown)
    .split(/\n\s*\n/)
    .map((section) => section.trim())
    .filter(Boolean);

  let title = "Carry This Forward";
  const leftSections: string[] = [];
  const centerSections: string[] = [];
  let signUpSection = "";
  let copyrightSection = "";

  let isCenteredPart = false;

  sections.forEach((section) => {
    if (/^#*\s*Carry This Forward/i.test(section)) {
      isCenteredPart = true;
      title = section.replace(/^#+\s+/, "").trim();
      return;
    }

    if (!signUpSection && /^##\s+/.test(section)) {
      signUpSection = section;
      return;
    }

    if (!copyrightSection && /^©/.test(section)) {
      copyrightSection = section;
      return;
    }

    if (isCenteredPart) {
      centerSections.push(section);
    } else {
      leftSections.push(section);
    }
  });

  return {
    title,
    leftSections,
    centerSections,
    signUpSection,
    copyrightSection,
  };
};

const stripMarkdownLinkLabel = (value = "") =>
  String(value)
    .replace(/^#+\s*/gm, "")
    .replace(/\[(.*?)\]\((.*?)\)/g, "$1")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .trim();

const getFirstMarkdownLink = (value = "") => {
  const match = String(value).match(/\[(.*?)\]\((.*?)\)/);

  return {
    label: match?.[1] || stripMarkdownLinkLabel(value),
    href: match?.[2] || "#",
  };
};

export const InsideBackCoverLayout = ({
  page,
  blocks: propBlocks,
}: PageLayoutProps) => {
  const data = contentMap[page.id] || { blocks: [] };
  const items = (propBlocks || data.blocks || []) as Array<{
    type?: string;
    content?: string;
  }>;
  const markdownBlock = items.find(
    (item) => item?.type === "markdown" && typeof item.content === "string",
  );
  const markdownContent = markdownBlock?.content || "";
  const { title, leftSections, centerSections, signUpSection, copyrightSection } =
    splitInsideBackCoverMarkdown(markdownContent);
  const signupLink = getFirstMarkdownLink(signUpSection);

  return (
    <div className="h-[660px] w-[480px] relative overflow-hidden bg-[#F6F5F2] text-charcoal">
      <div
        className="absolute top-0 bottom-0 left-0 w-[36px] z-30 pointer-events-none"
        style={{
          background:
            "linear-gradient(to right, rgba(0,0,0,0.06) 0%, rgba(0,0,0,0.03) 60%, transparent 100%)",
          mixBlendMode: "multiply",
          opacity: 1,
        }}
      />

      <div className="absolute top-0 bottom-0 left-0 w-[1px] bg-black/10 z-40 pointer-events-none" />

      <div className="absolute inset-0 px-[42px] z-10">
        <div className="flex h-full flex-col pt-[72px] pb-[28px]">
          {leftSections.length > 0 && (
            <div className="w-full text-left mb-8 space-y-1.5 text-[9.5px] leading-[1.35] text-[#2D2D2D]">
              {leftSections.map((section, index) => (
                <ReactMarkdown
                  key={`inside-back-left-${index}`}
                  components={{
                    p: ({ children }) => <p>{children}</p>,
                    strong: ({ children }) => <strong className="font-bold">{children}</strong>,
                    em: ({ children }) => <em className="italic">{children}</em>,
                    a: ({ href, children }) => (
                      <a
                        href={href}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#6F7552] underline underline-offset-[2px] decoration-[1px]"
                      >
                        {children}
                      </a>
                    ),
                  }}
                >
                  {section}
                </ReactMarkdown>
              ))}
            </div>
          )}

          <div className="w-full text-left">
            <h1 className="font-serif-primary text-[19px] leading-tight font-bold mb-4 text-[#021A2B] text-left">
              {title}
            </h1>

            <div className="w-full max-w-[330px] space-y-2.5 text-[9.5px] leading-[1.35] text-[#2D2D2D] text-left">
              {centerSections.map((section, index) => (
                <ReactMarkdown
                  key={`inside-back-center-${index}`}
                  components={{
                    p: ({ children }) => <p>{children}</p>,
                    strong: ({ children }) => <strong className="font-bold">{children}</strong>,
                    em: ({ children }) => <em className="italic">{children}</em>,
                    a: ({ href, children }) => (
                      <a
                        href={href}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#6F7552] underline underline-offset-[2px] decoration-[1px]"
                      >
                        {children}
                      </a>
                    ),
                  }}
                >
                  {section}
                </ReactMarkdown>
              ))}
            </div>
          </div>

          <div className="mt-6 flex flex-col items-center">
            <img
              src={brandLogo}
              alt=""
              className="w-[170px] h-auto object-contain opacity-95"
              draggable={false}
            />
          </div>

          {signUpSection ? (
            <div className="mt-5 w-full max-w-[310px] border-y border-[var(--brand-accent)]/45 py-4 text-left">
              <a
                href={signupLink.href}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-w-[210px] items-center justify-center rounded-full border border-[var(--brand-accent)]/70 bg-[#F9F5EA] px-5 py-2 font-serif-primary text-[14px] font-bold leading-tight text-[#6F7552] no-underline shadow-sm transition-colors hover:bg-[#F3EBD7]"
              >
                {signupLink.label || "Sign Up for Updates"}
              </a>
              <p className="mt-2 text-[8.5px] leading-[1.3] text-[#4C4C4C]">
                Future issues, article updates, podcast news, and advocacy resources.
              </p>
            </div>
          ) : null}

          <div className="flex-1" />

          {copyrightSection ? (
            <div className="border-t border-[var(--brand-accent)]/35 pt-4 text-left">
              <ReactMarkdown
                components={{
                  p: ({ children }) => (
                    <p className="text-[8.6px] leading-[1.32] text-[#4C4C4C]">{children}</p>
                  ),
                  a: ({ href, children }) => (
                    <a
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#6F7552] underline underline-offset-[2px] decoration-[1px]"
                    >
                      {children}
                    </a>
                  ),
                }}
              >
                {copyrightSection}
              </ReactMarkdown>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export const Page1Layout = ({
  page,
  title = "Untitled",
  subtitle = "",
  summary = "",
  byline = "",
}: PageLayoutProps & {
  title?: string;
  subtitle?: string;
  summary?: string;
  byline?: string;
}) => {
  // Page 1 is always Right Page (Odd)
  const isRightPage = true;

  return (
    <div className="h-[660px] w-[480px] relative overflow-hidden bg-ivory text-charcoal select-none">
      {/* Grain Overlay */}
      <GrainOverlay />

      {/* Spine Shadow (Left Side for Right Page) */}
      <div
        className="absolute top-0 bottom-0 left-0 w-[36px] z-20 pointer-events-none"
        style={{
          background:
            "linear-gradient(to right, rgba(0,0,0,0.06) 0%, rgba(0,0,0,0.03) 60%, transparent 100%)",
          mixBlendMode: "multiply",
          opacity: 1,
        }}
      />
      {/* SPINE LINE - Left Edge */}
      <div className="absolute top-0 bottom-0 left-0 w-[1px] bg-black/10 z-30 pointer-events-none" />

      {/* Content Container - Centered in Safe Area
                Safe Area: Top 60, Bottom 40, Left 56 (Inner), Right 48 (Outer).
            */}
      <div
        className="absolute flex flex-col justify-center items-center text-center z-10"
        style={{
          top: "60px",
          bottom: "40px",
          left: "56px",
          right: "48px",
        }}
      >
        <h1 className="type-major-opener text-charcoal w-full mb-[20px]">
          {title}
        </h1>

        <h2
          className="type-subhead text-charcoal font-sans-accent font-normal w-full mb-[18px]"
          style={{
            fontFamily:
              "Inter, Avenir Next, Helvetica Neue, Arial, sans-serif",
            fontWeight: 300,
          }}
        >
          {subtitle}
        </h2>

        <div className="w-full flex justify-center mb-[28px]">
          <p className="type-minor-head italic text-forest max-w-[340px]">
            {summary}
          </p>
        </div>

        <p className="type-kicker text-forest">{byline}</p>
      </div>
    </div>
  );
};

export const GenericPageLayout = ({
  page,
}: PageLayoutProps) => (
  <div className="h-[660px] w-[480px] bg-ivory relative overflow-hidden">
    <GrainOverlay />
  </div>
);

export type ContentBlock =
  | {
      type: "paragraph";
      content: React.ReactNode;
      className?: string;
      width?: string;
      height?: string;
      x?: number;
      y?: number;
      _id?: string;
      dropCap?: boolean;
    }
  | {
      type: "kicker";
      content: string;
      className?: string;
      width?: string;
      height?: string;
      x?: number;
      y?: number;
      _id?: string;
    }
  | {
      type: "byline";
      content: string;
      className?: string;
      width?: string;
      height?: string;
      x?: number;
      y?: number;
      _id?: string;
    }
  | {
      type: "subheading";
      content: string;
      className?: string;
      width?: string;
      height?: string;
      x?: number;
      y?: number;
      _id?: string;
    }
  | {
      type: "list";
      content: React.ReactNode[];
      className?: string;
      width?: string;
      height?: string;
      x?: number;
      y?: number;
      _id?: string;
    }
  | {
      type: "signoff";
      content: React.ReactNode;
      width?: string;
      height?: string;
      x?: number;
      y?: number;
      _id?: string;
    }
  | {
      type: "link-button";
      text: string;
      href: string;
      width?: string;
      height?: string;
      x?: number;
      y?: number;
      _id?: string;
    }
  | {
      type: "references";
      content: string[];
      width?: string;
      height?: string;
      x?: number;
      y?: number;
      _id?: string;
    }
  | {
      type: "pull-quote";
      content: string;
      style?: "standard" | "oversized-marks";
      width?: string;
      height?: string;
      x?: number;
      y?: number;
      _id?: string;
    }
  | {
      type: "qa";
      question: string;
      answer: string;
      width?: string;
      height?: string;
      x?: number;
      y?: number;
      _id?: string;
    }
  | {
      type: "image";
      src: string;
      alt: string;
      className?: string;
      credit?: string;
      fullPage?: boolean;
      width?: string;
      height?: string;
      x?: number;
      y?: number;
      _id?: string;
    }
  | {
      type: "image-collage";
      images: {
        src: string;
        alt: string;
        className: string;
        credit?: string;
      }[];
      containerClassName?: string;
      width?: string;
      height?: string;
      x?: number;
      y?: number;
      _id?: string;
    }
  | {
      type: "collage-block";
      items: {
        src: string;
        alt: string;
        title?: string;
        subtitle?: string;
      }[];
      width?: string;
      height?: string;
      x?: number;
      y?: number;
      _id?: string;
    }
  | {
      type: "fact-box";
      title?: string;
      content: string;
      className?: string;
      width?: string;
      height?: string;
      x?: number;
      y?: number;
      _id?: string;
    }
  | {
      type: "toc-section";
      title: string;
      className?: string;
      width?: string;
      height?: string;
      x?: number;
      y?: number;
      _id?: string;
    }
  | {
      type: "toc-entry";
      title: string;
      pageNumber: string;
      showDivider?: boolean;
      className?: string;
      width?: string;
      height?: string;
      x?: number;
      y?: number;
      _id?: string;
    }
  | {
      type: "team-grid";
      members: {
        name: string;
        title: string;
        imageUrl: string;
      }[];
      width?: string;
      height?: string;
      x?: number;
      y?: number;
      _id?: string;
    }
  | {
      type: "markdown";
      content: string;
      width?: string;
      height?: string;
      x?: number;
      y?: number;
      _id?: string;
    }
  | {
      type: "chapter-divider";
      title: string;
      subtitle?: string;
      eyebrow?: string;
      width?: string;
      height?: string;
      x?: number;
      y?: number;
      _id?: string;
    }
  | {
      type: "share";
      articleId: string;
      articleTitle: string;
      articleUrl?: string;
      width?: string;
      height?: string;
      x?: number;
      y?: number;
      _id?: string;
    };

export const contentMap: Record<
  string,
  {
    title?: string;
    byline?: string;
    backgroundColor?: string;
    backgroundImage?: string;
    blocks: ContentBlock[];
  }
> = {};

export const SectionDividerLayout = ({
  page,
}: PageLayoutProps) => {
  const data = contentMap[page.id] || { title: "", blocks: [] };
  const title = data.title || "";
  const bodyBlock = data.blocks?.find(
    (b) => b.type === "paragraph",
  );
  const bodyText =
    bodyBlock && typeof bodyBlock.content === "string"
      ? bodyBlock.content
      : "";

  const isRightPage = page.pageNumber % 2 !== 0;
  const paddingLeft = isRightPage ? "56px" : "48px";
  const paddingRight = isRightPage ? "48px" : "56px";
  const paddingTop = "60px";
  const paddingBottom = "40px";
  return (
    <div
      className="h-[660px] w-[480px] bg-ivory flex flex-col justify-center items-center text-center relative overflow-hidden"
      style={{
        paddingLeft,
        paddingRight,
        paddingTop,
        paddingBottom,
      }}
    >
      <div className="flex flex-col items-center w-full">
        <h1
          className="type-prestige-opener mb-8"
          style={{ color: "#021A2B" }}
        >
          {title}
        </h1>
        {bodyText && (
          <p className="type-body text-charcoal opacity-80 max-w-[65%] mx-auto">
            {bodyText}
          </p>
        )}
      </div>
    </div>
  );
};

export const ChristinaFeatureLayout = ({
  page,
  onNavigate,
  isEditable,
  blocks: propBlocks,
  onUpdateBlocks,
}: PageLayoutProps) => {
  const data = contentMap[page.id] || { title: "", blocks: [] };

  const [localItems, setLocalItems] = useState(() => {
    const blocks =
      data && data.blocks
        ? data.blocks.filter(
            (b) => !(b.type === "image" && b.fullPage),
          )
        : [];
    return blocks.map((b, i) => ({
      ...b,
      _id:
        b._id ||
        `block-${page.id}-${i}-${Math.random().toString(36).substr(2, 9)}`,
    }));
  });

  const items = propBlocks || localItems;
  const containerRef = useRef<HTMLDivElement>(null);

  const convertLayout = useCallback(() => {
    if (!containerRef.current) return;
    const unpositionedIndices = items
      .map((b, i) => ({ b, i }))
      .filter(({ b }) => b.x === undefined || b.y === undefined)
      .map(({ i }) => i);

    if (unpositionedIndices.length === 0) return;

    const containerRect =
      containerRef.current.getBoundingClientRect();
    const children = Array.from(containerRef.current.children);

    const updates: {
      index: number;
      x: number;
      y: number;
      width: string;
      height: string;
    }[] = [];

    unpositionedIndices.forEach((index) => {
      const child = children[index] as HTMLElement;
      if (!child) return;

      const rect = child.getBoundingClientRect();

      const x = Math.round(rect.left - containerRect.left);
      const y = Math.round(rect.top - containerRect.top);

      const width = child.style.width || `${rect.width}px`;
      const height = child.style.height || `${rect.height}px`;

      updates.push({ index, x, y, width, height });
    });

    if (updates.length > 0) {
      if (onUpdateBlocks && propBlocks) {
        const newItems = [...propBlocks];
        updates.forEach((u) => {
          newItems[u.index] = {
            ...newItems[u.index],
            x: u.x,
            y: u.y,
            width: newItems[u.index].width || u.width,
          };
        });
        onUpdateBlocks(newItems);
      } else {
        setLocalItems((prev: any) => {
          const newItems = [...prev];
          updates.forEach((u) => {
            newItems[u.index] = {
              ...newItems[u.index],
              x: u.x,
              y: u.y,
              width: newItems[u.index].width || u.width,
            };
          });
          return newItems;
        });
      }
    }
  }, [items, onUpdateBlocks, propBlocks]);

  const moveBlock = useCallback(
    (index: number, pos: { x: number; y: number }) => {
      if (onUpdateBlocks && propBlocks) {
        const newItems = [...propBlocks];
        newItems[index] = { ...newItems[index], ...pos };
        onUpdateBlocks(newItems);
      } else {
        setLocalItems((prevItems: any) => {
          const newItems = [...prevItems];
          newItems[index] = { ...newItems[index], ...pos };
          return newItems;
        });
      }
    },
    [onUpdateBlocks, propBlocks],
  );

  const resizeBlock = useCallback(
    (
      index: number,
      size: { width: string; height: string },
      pos?: { x: number; y: number },
    ) => {
      if (onUpdateBlocks && propBlocks) {
        const newItems = [...propBlocks];
        newItems[index] = {
          ...newItems[index],
          ...size,
          ...(pos || {}),
        };
        onUpdateBlocks(newItems);
      } else {
        setLocalItems((prevItems: any) => {
          const newItems = [...prevItems];
          newItems[index] = {
            ...newItems[index],
            ...size,
            ...(pos || {}),
          };
          return newItems;
        });
      }
    },
    [onUpdateBlocks, propBlocks],
  );

  if (!data) {
    return (
      <div className="h-[660px] w-[480px] bg-ivory px-16 pt-10 pb-16 flex flex-col relative overflow-hidden"></div>
    );
  }

  // Inside Cover (Page 0)
  if (page.pageNumber === 0) {
    return (
      <div className="h-[660px] w-[480px] bg-[#F5F2EA] relative flex flex-col items-center justify-center">
        {/* Shadow for spine */}
        <div
          className="absolute top-0 bottom-0 right-0 w-[6px] z-30 pointer-events-none"
          style={{
            background:
              "linear-gradient(to left, rgba(0,0,0,0.08), transparent)",
            mixBlendMode: "multiply",
          }}
        />
      </div>
    );
  }

  return (
    <div className="h-[660px] w-[480px] bg-ivory relative overflow-hidden flex flex-col">
      <GrainOverlay />
      {/* Spine Shadow based on page side */}
      <div
        className="absolute top-0 bottom-0 w-[6px] z-30 pointer-events-none"
        style={{
          left: page.pageNumber % 2 !== 0 ? 0 : "auto",
          right: page.pageNumber % 2 === 0 ? 0 : "auto",
          background:
            page.pageNumber % 2 !== 0
              ? "linear-gradient(to right, rgba(0,0,0,0.08), transparent)"
              : "linear-gradient(to left, rgba(0,0,0,0.08), transparent)",
          mixBlendMode: "multiply",
        }}
      />

      <div ref={containerRef} className="absolute inset-0">
        {items.map((block, index) => (
          <DraggableBlock
            key={block._id || index}
            id={block._id || `${index}`}
            index={index}
            moveBlock={moveBlock}
            resizeBlock={resizeBlock}
            width={block.width}
            height={block.height}
            x={block.x}
            y={block.y}
            isEditable={isEditable}
          >
            {/* Content Rendering based on Type */}
            {block.type === "paragraph" && (
              <div
                className={`type-body text-charcoal ${block.className || ""}`}
              >
                {block.dropCap &&
                typeof block.content === "string" ? (
                  <>
                    <span className="float-left type-prestige-opener leading-[0.8] mr-2 mt-[-2px] font-serif-primary">
                      {block.content[0]}
                    </span>
                    {block.content.substring(1)}
                  </>
                ) : (
                  block.content
                )}
              </div>
            )}
            {block.type === "kicker" && (
              <div
                className={`type-kicker text-charcoal border-b border-charcoal/20 pb-1 mb-4 inline-block ${block.className || ""}`}
              >
                {block.content}
              </div>
            )}
            {block.type === "subheading" && (
              <h3
                className={`type-subhead text-charcoal mb-2 ${block.className || ""}`}
              >
                {block.content}
              </h3>
            )}
            {block.type === "image" && (
              <div className="w-full h-full relative group overflow-hidden">
                <ImageWithFallback
                  src={block.src}
                  alt={block.alt}
                  className={`w-full h-full object-cover ${block.className || ""}`}
                />
                {block.credit && (
                  <div className="absolute bottom-0 right-0 bg-white/80 px-1 type-caption text-charcoal/60">
                    {block.credit}
                  </div>
                )}
              </div>
            )}
            {block.type === "collage-block" && (
              <CollageBlock items={block.items} />
            )}
            {block.type === "pull-quote" && (
              <blockquote
                className={`type-subhead italic text-charcoal pl-4 my-4 ${block.style === "oversized-marks" ? "relative" : ""}`}
              >
                {block.style === "oversized-marks" && (
                  <span className="absolute -left-4 -top-4 text-4xl text-gold/30">
                    “
                  </span>
                )}
                {block.content}
              </blockquote>
            )}
            {block.type === "fact-box" && (
              <div
                className={`bg-linen p-4 border border-gold/30 ${block.className || ""}`}
              >
                {block.title && (
                  <h4 className="type-minor-head text-charcoal mb-2">
                    {block.title}
                  </h4>
                )}
                <p className="type-body text-charcoal">
                  {block.content}
                </p>
              </div>
            )}
            {block.type === "list" && (
              <ul className="list-disc pl-5 type-body text-charcoal space-y-1">
                {block.content.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            )}
            {block.type === "byline" && (
              <div
                className={`type-kicker text-charcoal ${block.className || ""}`}
              >
                {block.content}
              </div>
            )}
            {block.type === "signoff" && (
              <div className="type-body italic text-charcoal mt-4 flex items-center gap-2">
                <span className="w-8 h-[1px] bg-charcoal/30"></span>
                {block.content}
              </div>
            )}
            {block.type === "qa" && (
              <div className="mb-4">
                <p className="type-body font-bold text-charcoal mb-1">
                  {block.question}
                </p>
                <p className="type-body text-charcoal">
                  {block.answer}
                </p>
              </div>
            )}
            {block.type === "references" && (
              <div className="mt-8 pt-4 border-t border-charcoal/10">
                <h5 className="type-kicker mb-2">References</h5>
                <ul className="type-caption text-charcoal/70 space-y-1 list-none">
                  {block.content.map((ref, i) => (
                    <li key={i}>{ref}</li>
                  ))}
                </ul>
              </div>
            )}
            {block.type === "link-button" && (
              <a
                href={block.href}
                className="inline-block px-4 py-2 border border-charcoal type-kicker hover:bg-charcoal hover:text-ivory transition-colors text-center no-underline"
              >
                {block.text}
              </a>
            )}
            {block.type === "toc-section" && (
              <h3 className="type-section-head text-charcoal mb-4 border-b border-charcoal pb-2">
                {block.title}
              </h3>
            )}
            {block.type === "toc-entry" && (
              <div className="flex justify-between items-baseline mb-2 group cursor-pointer">
                <span className="type-body text-charcoal font-serif-primary">
                  {block.title}
                </span>
                {block.showDivider && (
                  <span className="flex-1 mx-2 border-b border-charcoal/20 border-dotted h-1"></span>
                )}
                <span className="type-body text-charcoal font-sans-accent">
                  {block.pageNumber}
                </span>
              </div>
            )}
            {block.type === "team-grid" && (
              <div className="grid grid-cols-2 gap-4">
                {block.members.map((member, i) => (
                  <div
                    key={i}
                    className="flex flex-col items-center text-center"
                  >
                    <div className="w-16 h-16 rounded-full overflow-hidden mb-2 bg-gray-200">
                      <img
                        src={member.imageUrl}
                        alt={member.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h4 className="type-minor-head leading-tight">
                      {member.name}
                    </h4>
                    <p className="type-caption uppercase text-charcoal/60 mt-1">
                      {member.title}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </DraggableBlock>
        ))}
      </div>
    </div>
  );
};

export const ArticleLayout = ({
  page,
  blocks: propBlocks,
}: PageLayoutProps) => {
  const data = contentMap[page.id] || { blocks: [] };
  const items = propBlocks || data.blocks || [];
  const markdownBlock = items.find(
    (b) => b.type === "markdown",
  ) as { type: "markdown"; content: string } | undefined;

  const isRightPage = page.pageNumber % 2 !== 0;
  const paddingLeft = isRightPage ? "56px" : "48px";
  const paddingRight = isRightPage ? "48px" : "56px";
  const paddingTop = "60px";
  const paddingBottom = "40px";

  return (
    <div
      className="h-[660px] w-[480px] bg-ivory overflow-y-auto relative"
      style={{
        paddingLeft,
        paddingRight,
        paddingTop,
        paddingBottom,
      }}
    >
      <GrainOverlay />
      <div className="max-w-none text-charcoal">
        {markdownBlock ? (
          <ReactMarkdown
            components={{
              h1: ({ node, ...props }) => (
                <h1
                  className="type-prestige-opener mb-8 text-left font-normal leading-tight"
                  {...props}
                />
              ),
              h2: ({ node, ...props }) => (
                <h2
                  className="mt-6 mb-3 text-left font-serif-primary text-[18px] leading-tight font-normal text-[#021A2B]"
                  {...props}
                />
              ),
              h3: ({ node, ...props }) => (
                <h3
                  className="mt-5 mb-3 text-left font-serif-primary text-[16px] leading-tight font-normal text-[#021A2B]"
                  {...props}
                />
              ),
              h4: ({ node, ...props }) => (
                <h4
                  className="mt-5 mb-2 text-left font-serif-primary text-[15px] leading-tight font-normal text-[#021A2B]"
                  {...props}
                />
              ),
              h5: ({ node, ...props }) => (
                <h5
                  className="mt-4 mb-2 text-left font-serif-primary text-[14px] leading-tight font-normal text-[#021A2B]"
                  {...props}
                />
              ),
              h6: ({ node, ...props }) => (
                <h6
                  className="mt-4 mb-2 text-left font-serif-primary text-[13px] leading-tight font-normal text-[#021A2B]"
                  {...props}
                />
              ),
              strong: ({ node, ...props }) => (
                <span className="font-normal" {...props} />
              ),
              b: ({ node, ...props }) => (
                <span className="font-normal" {...props} />
              ),
              p: ({ node, ...props }) => (
                <p className="type-body mb-4" {...props} />
              ),
              a: ({ node, ...props }) => (
                <a className="text-rust underline" target="_blank" rel="noopener noreferrer" {...props} />
              ),
              ul: ({ node, ...props }) => (
                <ul
                  className="list-disc pl-6 mb-4 type-body"
                  {...props}
                />
              ),
              ol: ({ node, ...props }) => (
                <ol
                  className="list-decimal pl-6 mb-4 type-body"
                  {...props}
                />
              ),
              li: ({ node, ...props }) => (
                <li className="mb-1" {...props} />
              ),
              blockquote: ({ node, ...props }) => (
                <blockquote
                  className="pl-4 italic my-4 type-body"
                  {...props}
                />
              ),
              hr: () => <span className="block h-4"></span>,
            }}
          >
            {markdownBlock.content}
          </ReactMarkdown>
        ) : null}
      </div>

      {isWelcomePage && (
        <div className="absolute left-0 right-0 bottom-0 bg-[#19454B] px-[56px] py-5 text-[var(--brand-surface)]">
          <h2
            className="mb-2"
            style={{
              fontFamily: "var(--font-serif-primary)",
              fontSize: "15pt",
              lineHeight: 1.08,
              fontWeight: 700,
              color: "#8FC7D2",
            }}
          >
            Mission Statement
          </h2>

          <p className="text-[8.5px] leading-[1.35] text-[var(--brand-surface)]">
            
          </p>

          <p
            className="mt-3 text-center"
            style={{
              fontFamily:
                "var(--font-serif-primary), cursive",
              fontSize: "25pt",
              lineHeight: 1,
              color: "var(--brand-accent)",
              textShadow: "0 2px 8px rgba(0,0,0,0.35)",
            }}
          >
            
          </p>

          <p className="mt-2 text-center text-[8px] leading-tight text-[var(--brand-surface)]/90">
            
          </p>
        </div>
      )}
    </div>
  );
};

export const ArticleImageLayout = ({
  page,
  blocks: propBlocks,
}: PageLayoutProps) => {
  const data = contentMap[page.id] || { blocks: [] };
  const items = propBlocks || data.blocks || [];
  const imageBlock = items.find((b) => b.type === "image") as
    | { type: "image"; src: string; alt: string; caption?: string; href?: string }
    | undefined;

  return (
    <div className="h-[660px] w-[480px] bg-[#1a1a1a] relative overflow-hidden">
      {imageBlock && (
        <>
          {imageBlock.href ? (
            <a
              href={imageBlock.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={imageBlock.alt || "Open linked image"}
              className="block w-full h-full"
            >
              <ImageWithFallback
                src={imageBlock.src}
                alt={imageBlock.alt}
                className="w-full h-full object-cover opacity-90"
              />
            </a>
          ) : (
            <ImageWithFallback
              src={imageBlock.src}
              alt={imageBlock.alt}
              className="w-full h-full object-cover opacity-90"
            />
          )}
          {imageBlock.caption && (
            <div className="absolute left-6 right-6 bottom-5 rounded bg-black/55 px-3 py-2 text-center text-[11px] leading-snug text-white/90">
              {imageBlock.caption}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export const ArticleTitleLayout = ({
  page,
  blocks: propBlocks,
}: PageLayoutProps) => {
  const data = contentMap[page.id] || { blocks: [] };
  const items = (propBlocks || data.blocks || []) as Array<{
    type?: string;
    content?: string;
  }>;

  const toPlainText = (value = "") =>
    String(value)
      .replace(/^#+\s*/gm, "")
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/\*(.*?)\*/g, "$1")
      .replace(/\[(.*?)\]\((.*?)\)/g, "$1")
      .replace(/`([^`]+)`/g, "$1")
      .trim();

  const splitMarkdownTitlePage = (markdown = "") => {
    const lines = markdown
      .split(/\n+/)
      .map((line) => toPlainText(line))
      .filter(Boolean);

    return {
      title: lines[0] || page.title || "Untitled",
      subtitle:
        lines[1] &&
        !/^editorial$/i.test(lines[1]) &&
        !/^by\s+/i.test(lines[1])
          ? lines[1]
          : "",
      metaLines: lines.filter(
        (line, index) =>
          index > 0 &&
          !(
            index === 1 &&
            !/^editorial$/i.test(line) &&
            !/^by\s+/i.test(line)
          ),
      ),
    };
  };

  const markdownBlock = items.find(
    (block) => block.type === "markdown",
  );
  const markdownData = markdownBlock?.content
    ? splitMarkdownTitlePage(markdownBlock.content)
    : null;

  const kicker = toPlainText(
    items.find((block) => block.type === "kicker")?.content ||
      "",
  );

  const paragraphs = items
    .filter((block) => block.type === "paragraph")
    .map((block) => toPlainText(block.content || ""))
    .filter(Boolean);

  const title =
    markdownData?.title ||
    paragraphs[0] ||
    page.title ||
    "Untitled";
  const subtitle =
    markdownData?.subtitle || paragraphs[1] || "";
  const metaLines =
    markdownData?.metaLines ||
    paragraphs.slice(2).filter(Boolean);

  const isRightPage = page.pageNumber % 2 !== 0;
  const paddingLeft = isRightPage ? "54px" : "48px";
  const paddingRight = isRightPage ? "48px" : "54px";

  return (
    <div
      className="relative h-[660px] w-[480px] overflow-hidden"
      style={{
        background:
          "linear-gradient(180deg, #021A2B 0%, #0A2736 54%, #021A2B 100%)",
        paddingLeft,
        paddingRight,
        paddingTop: "64px",
        paddingBottom: "56px",
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 82% 16%, rgba(43,155,192,0.18), transparent 30%), radial-gradient(circle at 14% 88%, rgba(175,147,85,0.13), transparent 34%)",
        }}
      />

      <div className="absolute left-[42px] top-[48px] h-[1px] w-[122px] bg-[var(--brand-accent)]/70" />
      <div className="absolute right-[44px] top-[74px] h-[1px] w-[86px] bg-[#2B9BC0]/60" />
      <div className="absolute left-[-116px] bottom-[-120px] h-[300px] w-[300px] rounded-full border border-[#2B9BC0]/18" />
      <div className="absolute right-[-118px] top-[-112px] h-[280px] w-[280px] rounded-full border border-[var(--brand-accent)]/18" />
      <div className="absolute bottom-[72px] right-[-36px] h-[1px] w-[220px] rotate-[-32deg] bg-[var(--brand-accent)]/55" />

      <div className="absolute inset-[30px] border border-[var(--brand-accent)]/26 pointer-events-none" />

      <div className="relative z-10 flex h-full flex-col justify-between">
        <div>
          <div
            className="mb-8 uppercase tracking-[0.24em]"
            style={{
              fontFamily:
                "Inter, Avenir Next, Helvetica Neue, Arial, sans-serif",
              fontSize: "9pt",
              fontWeight: 400,
              lineHeight: 1.2,
              color: "var(--brand-accent)",
            }}
          >
            {kicker || ""}
          </div>

          <div className="max-w-[340px]">
            <h1
              style={{
                fontFamily: "var(--font-serif-primary)",
                fontSize: title.length > 92 ? "22pt" : "26pt",
                lineHeight: 1.05,
                fontWeight: 600,
                color: "var(--brand-surface)",
              }}
            >
              {title}
            </h1>

            {subtitle ? (
              <>
                <div className="mt-7 h-[2px] w-28 bg-[#2B9BC0]" />
                <p
                  className="mt-6"
                  style={{
                    fontFamily:
                      "Inter, Avenir Next, Helvetica Neue, Arial, sans-serif",
                    fontSize: "15pt",
                    lineHeight: 1.28,
                    fontWeight: 300,
                    color: "#F3E8D3",
                  }}
                >
                  {subtitle}
                </p>
              </>
            ) : (
              <div className="mt-7 h-[2px] w-28 bg-[#2B9BC0]" />
            )}
          </div>
        </div>

        <div className="pb-2">
          {metaLines.map((line, index) => (
            <p
              key={`${page.id}-meta-${index}`}
              className={index === 0 ? "" : "mt-2"}
              style={{
                fontFamily:
                  "Inter, Avenir Next, Helvetica Neue, Arial, sans-serif",
                fontSize: index === 0 ? "10pt" : "10.5pt",
                lineHeight: 1.35,
                fontWeight: index === 0 ? 500 : 300,
                letterSpacing:
                  index === 0 ? "0.14em" : "0.04em",
                textTransform:
                  index === 0 ? "uppercase" : "none",
                color:
                  index === 0
                    ? "var(--brand-accent)"
                    : "rgba(248,243,232,0.9)",
              }}
            >
              {line}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
};

const ChapterDividerBlock = ({
  title,
  subtitle,
  eyebrow,
}: {
  title: string;
  subtitle?: string;
  eyebrow?: string;
}) => {
  const normalizedTitle = title.trim().toLowerCase();
  const isPhlipSide = normalizedTitle === "the phlip-side";
  const isContributionsInWriting =
    normalizedTitle === "contributions in writing";
  const titleLines = isPhlipSide
    ? ["The", "PHlip-side"]
    : isContributionsInWriting
      ? ["Contributions", "in Writing"]
      : [title];
  const titleFontSize = isPhlipSide
    ? "47pt"
    : isContributionsInWriting
      ? "42pt"
      : title.length > 28
        ? "44pt"
        : "58pt";
  const chapterPaddingClass = isContributionsInWriting
    ? "pl-16 pr-10 py-12"
    : "px-10 py-12";

  return (
    <div
      className={`relative flex h-full w-full flex-col justify-center overflow-hidden bg-[#021A2B] ${chapterPaddingClass} text-ivory`}
    >
      <div
        className="absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(circle at 80% 20%, rgba(43,155,192,0.28), transparent 34%), radial-gradient(circle at 15% 85%, rgba(0,95,115,0.42), transparent 38%), linear-gradient(180deg, #01101C 0%, #021A2B 46%, #01101C 100%)",
        }}
      />
      <div className="absolute right-[-118px] bottom-[-96px] h-[320px] w-[320px] rounded-full border border-[var(--brand-accent)]/18" />
      <div className="absolute left-[-120px] top-[-110px] h-[290px] w-[290px] rounded-full border border-[#2B9BC0]/24" />
      <div className="absolute top-[118px] right-[-54px] h-[1px] w-[260px] rotate-[28deg] bg-[var(--brand-accent)]/58" />
      <div className="absolute left-10 top-10 h-[92px] w-[1px] bg-[var(--brand-border)]/45" />
      <div className="absolute left-10 top-10 h-[1px] w-[92px] bg-[var(--brand-border)]/45" />

      <div className="relative z-10">
        {eyebrow && (
          <p
            className="mb-8 font-sans-accent uppercase tracking-[0.28em] text-[var(--brand-border)]"
            style={{ fontSize: "14px" }}
          >
            {eyebrow}
          </p>
        )}

        <h1
          className="mb-5 text-left"
          style={{
            fontFamily: "var(--font-serif-primary)",
            fontSize: titleFontSize,
            lineHeight: isContributionsInWriting ? 0.92 : 0.86,
            fontWeight: 700,
            letterSpacing: "-0.035em",
            color: "var(--brand-accent)",
            textShadow: "0 3px 12px rgba(0,0,0,0.45)",
          }}
        >
          {titleLines.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </h1>

        <div className="mb-6 h-[2px] w-44 bg-[#2B9BC0]" />

        {subtitle && (
          <p
            className="text-left text-ivory/90"
            style={{
              fontFamily:
                "Inter, Avenir Next, Helvetica Neue, Arial, sans-serif",
              fontSize: "15pt",
              lineHeight: 1.3,
              fontWeight: 300,
            }}
          >
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};

const SHARE_COVER_LOGO_SOURCES = [
  resolveRepositoryRootAssetUrl("/images/brand/rare-revolution-trademark-logo.png"),
];

const ShareCoverLogo = () => {
  const [sourceIndex, setSourceIndex] = useState(0);
  const [isHidden, setIsHidden] = useState(false);

  const handleError = () => {
    if (sourceIndex < SHARE_COVER_LOGO_SOURCES.length - 1) {
      setSourceIndex((currentIndex) => currentIndex + 1);
      return;
    }

    setIsHidden(true);
  };

  if (isHidden) return null;

  return (
    <img
      src={SHARE_COVER_LOGO_SOURCES[sourceIndex]}
      alt=""
      className="h-[276px] w-auto object-contain"
      onError={handleError}
      draggable={false}
    />
  );
};

const EditorialShareBlock = ({
  articleId,
  articleTitle,
  articleUrl,
  articleExcerpt = "",
  articleImage = "",
  pageNumber = 1,
}: {
  articleId: string;
  articleTitle: string;
  articleUrl?: string;
  articleExcerpt?: string;
  articleImage?: string;
  pageNumber?: number;
}) => {
  const [copyStatus, setCopyStatus] = useState("");
  const [manualShareUrl, setManualShareUrl] = useState("");
  const [showShareOptions, setShowShareOptions] =
    useState(false);

  const getShareUrl = () => {
    if (articleUrl) return articleUrl;
    if (typeof window === "undefined") return "";

    const url = new URL(window.location.href);
    url.hash = "";

    // Keep the outward-facing URL clean. Remove reader/navigation-only params
    // so shared links do not open at odd page numbers.
    Array.from(url.searchParams.keys()).forEach((key) => {
      if (key !== "article") url.searchParams.delete(key);
    });

    url.searchParams.set("article", articleId);
    return url.toString();
  };

  const copyToClipboard = async (value: string) => {
    if (!value) return false;

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(value);
        return true;
      }
    } catch (error) {
      // Continue to the legacy fallback.
    }

    try {
      const textArea = document.createElement("textarea");
      textArea.value = value;
      textArea.setAttribute("readonly", "true");
      textArea.style.position = "fixed";
      textArea.style.left = "-9999px";
      textArea.style.top = "0";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      const copied = document.execCommand("copy");
      document.body.removeChild(textArea);

      return copied;
    } catch (error) {
      return false;
    }
  };

  const copyShareText = async () => {
    const shareUrl = getShareUrl();
    setManualShareUrl(shareUrl);

    const copied = await copyToClipboard(shareUrl);

    setCopyStatus(
      copied
        ? "Link copied"
        : "Copy blocked — use the visible link below",
    );
    window.setTimeout(() => setCopyStatus(""), 2600);
    return copied;
  };

  const openShareWindow = (url: string) => {
    if (typeof window === "undefined") return false;

    const popup = window.open(
      url,
      "_blank",
      "noopener,noreferrer,width=760,height=680",
    );

    if (popup) {
      popup.opener = null;
      return true;
    }

    return false;
  };

  const handleShare = async (
    platform: "linkedin" | "facebook" | "x" | "copy",
  ) => {
    updateSharePreviewMetadata();

    const shareUrl = getShareUrl();
    const encodedUrl = encodeURIComponent(shareUrl);

    if (platform === "copy") {
      const copied = await copyShareText();
      setShowShareOptions(false);

      if (!copied) {
        setManualShareUrl(shareUrl);
      }

      return;
    }

    setShowShareOptions(false);

    if (platform === "linkedin") {
      const opened = openShareWindow(
        `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      );

      if (!opened) {
        setManualShareUrl(shareUrl);
        setCopyStatus(
          "Popup blocked — use the visible link below",
        );
        window.setTimeout(() => setCopyStatus(""), 3200);
      }

      return;
    }

    if (platform === "facebook") {
      // Facebook pulls title, description, and image from the public share page's
      // Open Graph tags. This works best after the reader is published online.
      const opened = openShareWindow(
        `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      );

      if (!opened) {
        setManualShareUrl(shareUrl);
        setCopyStatus(
          "Popup blocked — use the visible link below",
        );
        window.setTimeout(() => setCopyStatus(""), 3200);
      }

      return;
    }

    if (platform === "x") {
      const encodedTitle = encodeURIComponent(
        articleTitle.trim(),
      );
      const opened = openShareWindow(
        `https://x.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
      );

      if (!opened) {
        setManualShareUrl(shareUrl);
        setCopyStatus(
          "Popup blocked — use the visible link below",
        );
        window.setTimeout(() => setCopyStatus(""), 3200);
      }

      return;
    }
  };

  const cleanArticleTitle =
    articleTitle.trim().replace(/[?!\.]+$/, "") ||
    "this editorial";
  const isRightPage = pageNumber % 2 !== 0;
  const shareBoxEdgeStyle = isRightPage
    ? { right: "78px" }
    : { left: "78px" };
  const logoCircleNudgeStyle = isRightPage
    ? { transform: "translateX(14px)" }
    : { transform: "translateX(-14px)" };

  const updateSharePreviewMetadata = () => {
    if (typeof document === "undefined") return;

    const upsertMeta = (
      selector: string,
      attributeName: "property" | "name",
      attributeValue: string,
      content: string,
    ) => {
      if (!content) return;

      let element = document.head.querySelector(
        selector,
      ) as HTMLMetaElement | null;

      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attributeName, attributeValue);
        document.head.appendChild(element);
      }

      element.setAttribute("content", content);
    };

    const shareUrl = getShareUrl();
    const description = articleExcerpt || articleTitle;

    upsertMeta(
      'meta[property="og:title"]',
      "property",
      "og:title",
      articleTitle,
    );
    upsertMeta(
      'meta[property="og:description"]',
      "property",
      "og:description",
      description,
    );
    upsertMeta(
      'meta[property="og:url"]',
      "property",
      "og:url",
      shareUrl,
    );
    upsertMeta(
      'meta[property="og:type"]',
      "property",
      "og:type",
      "article",
    );
    upsertMeta(
      'meta[property="og:image"]',
      "property",
      "og:image",
      articleImage,
    );
    upsertMeta(
      'meta[name="twitter:card"]',
      "name",
      "twitter:card",
      "summary_large_image",
    );
    upsertMeta(
      'meta[name="twitter:title"]',
      "name",
      "twitter:title",
      articleTitle,
    );
    upsertMeta(
      'meta[name="twitter:description"]',
      "name",
      "twitter:description",
      description,
    );
    upsertMeta(
      'meta[name="twitter:image"]',
      "name",
      "twitter:image",
      articleImage,
    );
  };

  const buttonClass =
    "rounded-full border px-5 py-2.5 text-[13px] uppercase tracking-[0.12em] transition-colors focus:outline-none focus:ring-2" +
    " border-[#2B9BC0]/55 text-[var(--brand-surface)] hover:bg-[#2B9BC0]/20 hover:border-[#2B9BC0] hover:text-white focus:ring-[#2B9BC0]/40";

  const shareUrlForMenu = getShareUrl();
  const encodedShareUrlForMenu =
    encodeURIComponent(shareUrlForMenu);
  const encodedTitleForMenu = encodeURIComponent(
    articleTitle.trim(),
  );
  const linkedinShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedShareUrlForMenu}`;
  const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedShareUrlForMenu}`;
  const xShareUrl = `https://x.com/intent/tweet?text=${encodedTitleForMenu}&url=${encodedShareUrlForMenu}`;

  const handleNativeShareLinkClick = () => {
    updateSharePreviewMetadata();
    setShowShareOptions(false);
  };

  return (
    <div
      className="relative h-full w-full text-center"
      style={{
        background:
          "radial-gradient(circle at 82% 18%, rgba(43,155,192,0.18) 0%, rgba(43,155,192,0.05) 28%, transparent 42%), linear-gradient(180deg, #01101C 0%, #021A2B 42%, #01101C 100%)",
        color: "var(--brand-surface)",
      }}
    >
      <div
        className="absolute top-[34%] z-20 flex w-[326px] max-w-[68%] -translate-y-1/2 flex-col items-center text-center"
        style={{
          ...shareBoxEdgeStyle,
          border: "1.35px solid rgba(201,164,92,0.78)",
          padding: "26px 22px 24px",
          boxShadow:
            "0 0 0 1px rgba(201,164,92,0.18), 0 18px 42px rgba(0,0,0,0.22)",
          background:
            "linear-gradient(180deg, rgba(1,16,28,0.18) 0%, rgba(2,26,43,0.28) 100%)",
        }}
      >
        <div
          className="absolute left-4 top-4 h-[22px] w-[22px] border-l border-t border-[var(--brand-border)]/70"
          aria-hidden="true"
        />
        <div
          className="absolute right-4 top-4 h-[22px] w-[22px] border-r border-t border-[var(--brand-border)]/70"
          aria-hidden="true"
        />
        <div
          className="absolute bottom-4 left-4 h-[22px] w-[22px] border-b border-l border-[var(--brand-border)]/70"
          aria-hidden="true"
        />
        <div
          className="absolute bottom-4 right-4 h-[22px] w-[22px] border-b border-r border-[var(--brand-border)]/70"
          aria-hidden="true"
        />

        <div className="mb-5 h-[1px] w-14 bg-[#2B9BC0]/80" />
        <p
          className="type-minor-head mb-1.5"
          style={{ color: "var(--brand-border)" }}
        >
          Enjoyed
        </p>
        <h2
          className="mb-4 max-w-[280px]"
          style={{
            fontFamily: "var(--font-serif-primary)",
            fontSize:
              cleanArticleTitle.length > 76
                ? "14.5pt"
                : cleanArticleTitle.length > 62
                  ? "16pt"
                  : "18.5pt",
            lineHeight: 1.14,
            fontWeight: 700,
            color: "var(--brand-surface)",
            overflowWrap: "break-word",
            wordBreak: "normal",
          }}
        >
          {cleanArticleTitle}?
        </h2>
        <div className="relative flex w-full max-w-[300px] flex-col items-center justify-center">
          <button
            type="button"
            className={`${buttonClass} min-w-[142px]`}
            aria-expanded={showShareOptions}
            aria-controls={`share-options-${articleId}`}
            onClick={() =>
              setShowShareOptions((current) => !current)
            }
          >
            Share
          </button>

          {showShareOptions && (
            <div
              id={`share-options-${articleId}`}
              className="absolute top-[40px] z-[9999] flex w-[188px] flex-col overflow-hidden rounded-lg border border-[var(--brand-border)]/70 bg-[#021A2B] shadow-xl"
            >
              <a
                href={linkedinShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 text-left text-[11px] font-semibold tracking-[0.08em] text-[var(--brand-surface)] transition-colors hover:bg-[#0B3A4F] no-underline"
                onClick={handleNativeShareLinkClick}
              >
                LinkedIn
              </a>
              <a
                href={facebookShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="border-t border-[var(--brand-border)]/25 px-4 py-2.5 text-left text-[11px] font-semibold tracking-[0.08em] text-[var(--brand-surface)] transition-colors hover:bg-[#0B3A4F] no-underline"
                onClick={handleNativeShareLinkClick}
              >
                Facebook
              </a>
              <a
                href={xShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="border-t border-[var(--brand-border)]/25 px-4 py-2.5 text-left text-[11px] font-semibold tracking-[0.08em] text-[var(--brand-surface)] transition-colors hover:bg-[#0B3A4F] no-underline"
                onClick={handleNativeShareLinkClick}
              >
                X-Twitter
              </a>
              <button
                type="button"
                className="border-t border-[var(--brand-border)]/25 px-4 py-2.5 text-left text-[11px] font-semibold tracking-[0.08em] text-[var(--brand-surface)] transition-colors hover:bg-[#0B3A4F]"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  handleShare("copy");
                }}
              >
                Copy Link
              </button>
            </div>
          )}
        </div>

        {copyStatus && (
          <p
            className="type-caption mt-4"
            style={{ color: "#2B9BC0" }}
            role="status"
          >
            {copyStatus}
          </p>
        )}

        {manualShareUrl && (
          <div className="mt-3 w-full max-w-[280px]">
            <label
              className="sr-only"
              htmlFor={`share-url-${articleId}`}
            >
              Share URL
            </label>
            <input
              id={`share-url-${articleId}`}
              readOnly
              value={manualShareUrl}
              onFocus={(event) => event.currentTarget.select()}
              className="w-full rounded-md border border-[var(--brand-border)]/60 bg-[var(--brand-surface)] px-3 py-2 text-center text-[9px] leading-tight text-[#021A2B]"
            />
          </div>
        )}
      </div>

      <div
        className="pointer-events-none absolute top-[75%] z-0 flex w-[326px] max-w-[68%] -translate-y-1/2 items-center justify-center"
        style={shareBoxEdgeStyle}
        aria-hidden="true"
      >
        <div style={logoCircleNudgeStyle}>
          <ShareCoverLogo />
        </div>
      </div>
    </div>
  );
};

export const ArticleTextLayout = ({
  page,
  blocks: propBlocks,
}: PageLayoutProps) => {
  const data = contentMap[page.id] || { blocks: [] };
  const items = propBlocks || data.blocks || [];
  const markdownBlock = items.find(
    (b) => b.type === "markdown",
  ) as { type: "markdown"; content: string } | undefined;
  const shareBlock = items.find((b) => b.type === "share") as
    | {
        type: "share";
        articleId: string;
        articleTitle: string;
        articleUrl?: string;
        articleExcerpt?: string;
        articleImage?: string;
      }
    | undefined;
  const chapterDividerBlock = items.find(
    (b) => b.type === "chapter-divider",
  ) as
    | {
        type: "chapter-divider";
        title: string;
        subtitle?: string;
        eyebrow?: string;
      }
    | undefined;
  const isGeneratedTitlePage =
    Boolean(
      markdownBlock?.content?.includes("By "),
    ) && page.id.includes("-title");
  const isWelcomePage =
    page.id === "welcome-to-breathtaking-awareness";
  const isMissionStatementPage =
    page.id === "mission-statement-page";
  const isHowToUsePage =
    page.id === "how-to-use-this-volume-page";
  const isAboutBreathtakingAwarenessPage =
    page.id === "about-breathtaking-awareness-page";
  const showWelcomeHeader = isAboutBreathtakingAwarenessPage;
  const isFrontOpenerPage = false;
  const isVolumeOnePage = page.id === "volume-one-page";
  const isChapterDescriptionPage =
    page.id.startsWith("chapter-") &&
    page.id.endsWith("-description");
  const isStoryTextPage =
    !chapterDividerBlock &&
    !shareBlock &&
    !isGeneratedTitlePage &&
    !isWelcomePage &&
    !isMissionStatementPage &&
    !showWelcomeHeader &&
    !isHowToUsePage &&
    !isFrontOpenerPage &&
    !isVolumeOnePage &&
    !isChapterDescriptionPage;

  const isRightPage = page.pageNumber % 2 !== 0;
  const paddingLeft = isRightPage ? "56px" : "48px";
  const paddingRight = isRightPage ? "48px" : "56px";
  const articleStoryPaddingX = "58px";
  const articleStoryPaddingTop = "64px";
  const articleStoryPaddingBottom = "78px";
  const paddingTop = "60px";
  const paddingBottom = "40px";

  const titleHeadingStyle = {
    fontFamily: "var(--font-serif-primary)",
    fontWeight: 700,
    lineHeight: 1.08,
    letterSpacing: "-0.01em",
  } as CSSProperties;

  const titlePageComponents = {
    h1: ({ node, ...props }: any) => (
      <h1
        className="text-center text-charcoal mb-7"
        style={{ ...titleHeadingStyle, fontSize: "34pt" }}
        {...props}
      />
    ),
    h2: ({ node, ...props }: any) => (
      <h2
        className="text-center text-charcoal mb-7"
        style={{ ...titleHeadingStyle, fontSize: "30pt" }}
        {...props}
      />
    ),
    h3: ({ node, ...props }: any) => (
      <h3
        className="text-center text-charcoal mb-7"
        style={{ ...titleHeadingStyle, fontSize: "26pt" }}
        {...props}
      />
    ),
    h4: ({ node, ...props }: any) => (
      <h4
        className="text-center text-charcoal mb-7"
        style={{ ...titleHeadingStyle, fontSize: "22pt" }}
        {...props}
      />
    ),
    h5: ({ node, ...props }: any) => (
      <h5
        className="text-center text-charcoal mb-8"
        style={{
          fontFamily: "var(--font-serif-secondary)",
          fontSize: "12pt",
          lineHeight: 1.35,
          fontWeight: 600,
        }}
        {...props}
      />
    ),
    h6: ({ node, ...props }: any) => (
      <h6
        className="text-center text-charcoal mb-8"
        style={{
          fontFamily: "var(--font-serif-secondary)",
          fontSize: "11pt",
          lineHeight: 1.35,
          fontWeight: 600,
        }}
        {...props}
      />
    ),
    strong: ({ node, ...props }: any) => (
      <strong style={{ fontWeight: 700 }} {...props} />
    ),
    b: ({ node, ...props }: any) => (
      <strong style={{ fontWeight: 700 }} {...props} />
    ),
    p: ({ node, ...props }: any) => (
      <p
        className="text-center text-charcoal mb-4"
        style={{
          fontFamily: "var(--font-serif-secondary)",
          fontSize: "10pt",
          lineHeight: 1.4,
          fontWeight: 500,
        }}
        {...props}
      />
    ),
    a: ({ node, ...props }: any) => (
      <a
        className="text-forest underline font-sans-accent"
        {...props}
      />
    ),
    ul: ({ node, ...props }: any) => (
      <ul
        className="list-disc pl-6 mb-5 type-body"
        {...props}
      />
    ),
    ol: ({ node, ...props }: any) => (
      <ol
        className="list-decimal pl-6 mb-5 type-body"
        {...props}
      />
    ),
    li: ({ node, ...props }: any) => (
      <li className="mb-2" {...props} />
    ),
    blockquote: ({ node, ...props }: any) => (
      <blockquote
        className="pl-6 italic my-6 type-body text-charcoal/80"
        {...props}
      />
    ),
    hr: () => <span className="block h-6"></span>,
    img: ({ node, ...props }: any) => (
      <img
        className="w-full h-auto max-h-[300px] object-cover my-6"
        {...props}
      />
    ),
  };

  const storyComponents = {
    h1: ({ node, ...props }: any) => (
      <h1
        className={`text-left font-normal leading-tight ${
          isMissionStatementPage ? "mb-4" : "mb-8"
        }`}
        style={
          isWelcomePage
            ? { display: "none" }
            : isMissionStatementPage
              ? {
                  fontFamily: "var(--font-serif-primary)",
                  fontSize: "20pt",
                  lineHeight: 1.08,
                  color: "#021A2B",
                }
              : isHowToUsePage
                ? {
                    fontFamily: "var(--font-serif-primary)",
                    fontSize: "34pt",
                    lineHeight: 1.05,
                    color: "#021A2B",
                  }
                : {
                    fontFamily: "var(--font-serif-primary)",
                    fontSize: "34pt",
                    lineHeight: 1.05,
                    color: "#021A2B",
                  }
        }
        {...props}
      />
    ),
    h2: ({ node, ...props }: any) => (
      <h2
        className="mt-6 mb-3 text-left font-serif-primary text-[18px] leading-tight font-normal text-[#021A2B]"
        {...props}
      />
    ),
    h3: ({ node, ...props }: any) => (
      <h3
        className="mt-5 mb-3 text-left font-serif-primary text-[16px] leading-tight font-normal text-[#021A2B]"
        {...props}
      />
    ),
    h4: ({ node, ...props }: any) => (
      <h4
        className="mt-5 mb-2 text-left font-serif-primary text-[15px] leading-tight font-normal text-[#021A2B]"
        {...props}
      />
    ),
    h5: ({ node, ...props }: any) => (
      <h5
        className="mt-4 mb-2 text-left font-serif-primary text-[14px] leading-tight font-normal text-[#021A2B]"
        {...props}
      />
    ),
    h6: ({ node, ...props }: any) => (
      <h6
        className="mt-4 mb-2 text-left font-serif-primary text-[13px] leading-tight font-normal text-[#021A2B]"
        {...props}
      />
    ),
    strong: ({ node, ...props }: any) => (
      <span className="font-normal" {...props} />
    ),
    b: ({ node, ...props }: any) => (
      <span className="font-normal" {...props} />
    ),
    p: ({ node, ...props }: any) => (
      <p
        className="type-body mb-3 text-justify"
        style={
          isStoryTextPage
            ? {
                lineHeight: 1.42,
              }
            : undefined
        }
        {...props}
      />
    ),
    a: ({ node, ...props }: any) => (
      <a
        className="text-forest underline font-sans-accent"
        {...props}
      />
    ),
    ul: ({ node, ...props }: any) => (
      <ul
        className="list-disc pl-6 mb-5 type-body"
        {...props}
      />
    ),
    ol: ({ node, ...props }: any) => (
      <ol
        className="list-decimal pl-6 mb-5 type-body"
        {...props}
      />
    ),
    li: ({ node, ...props }: any) => (
      <li className="mb-2" {...props} />
    ),
    blockquote: ({ node, ...props }: any) => (
      <blockquote
        className="pl-6 italic my-6 type-body text-charcoal/80"
        {...props}
      />
    ),
    hr: () => <span className="block h-6"></span>,
    img: ({ node, ...props }: any) => (
      <img
        className="w-full h-auto max-h-[300px] object-cover my-6"
        {...props}
      />
    ),
  };

  if (isGeneratedTitlePage && markdownBlock) {
    const toPlainTitleText = (value = "") =>
      String(value)
        .replace(/^#+\s*/gm, "")
        .replace(/\*\*(.*?)\*\*/g, "$1")
        .replace(/\*(.*?)\*/g, "$1")
        .replace(/\[(.*?)\]\((.*?)\)/g, "$1")
        .replace(/`([^`]+)`/g, "$1")
        .trim();

    const titleLines = markdownBlock.content
      .split(/\n+/)
      .map((line) => toPlainTitleText(line))
      .filter(Boolean);

    const titleText = titleLines[0] || page.alt || "Untitled";
    const hasSubtitle =
      Boolean(titleLines[1]) &&
      !/^editorial$/i.test(titleLines[1]) &&
      !/^by\s+/i.test(titleLines[1]) &&
      !/^published\s+/i.test(titleLines[1]);

    const subtitleText = hasSubtitle ? titleLines[1] : "";
    const kicker = toPlainTitleText(
      items.find((block) => block.type === "kicker")?.content || ""
    );
    const metaLines = titleLines.filter(
      (line, index) =>
        index > 0 && !(hasSubtitle && index === 1),
    );

    const titleSize =
      page.pageNumber === 118 || page.pageNumber === 127
        ? titleText.length > 112
          ? "24pt"
          : titleText.length > 86
            ? "27pt"
            : "30pt"
        : titleText.length > 112
          ? "20pt"
          : titleText.length > 86
            ? "23pt"
            : "26pt";

    return (
      <div
        className="relative h-[660px] w-[480px] overflow-hidden"
        style={{
          background:
            "linear-gradient(180deg, #021A2B 0%, #0A2736 54%, #021A2B 100%)",
          paddingLeft,
          paddingRight,
          paddingTop: "64px",
          paddingBottom: "56px",
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 82% 16%, rgba(43,155,192,0.18), transparent 30%), radial-gradient(circle at 14% 88%, rgba(175,147,85,0.13), transparent 34%)",
          }}
        />

        <div className="absolute left-[42px] top-[48px] h-[1px] w-[122px] bg-[var(--brand-accent)]/70" />
        <div className="absolute right-[44px] top-[74px] h-[1px] w-[86px] bg-[#2B9BC0]/60" />
        <div className="absolute left-[-116px] bottom-[-120px] h-[300px] w-[300px] rounded-full border border-[#2B9BC0]/18" />
        <div className="absolute right-[-118px] top-[-112px] h-[280px] w-[280px] rounded-full border border-[var(--brand-accent)]/18" />
        <div className="absolute bottom-[72px] right-[-36px] h-[1px] w-[220px] rotate-[-32deg] bg-[var(--brand-accent)]/55" />
        <div className="absolute inset-[30px] border border-[var(--brand-accent)]/26 pointer-events-none" />

        <div className="relative z-10 flex h-full flex-col justify-between">
          <div>
            <div
              className="mb-8 uppercase tracking-[0.24em]"
              style={{
                fontFamily:
                  "Inter, Avenir Next, Helvetica Neue, Arial, sans-serif",
                fontSize: "9pt",
                fontWeight: 400,
                lineHeight: 1.2,
                color: "var(--brand-accent)",
              }}
            >
              {kicker || ""}
            </div>

            <div className="max-w-[340px]">
              <h1
                style={{
                  fontFamily: "var(--font-serif-primary)",
                  fontSize: titleSize,
                  lineHeight: 1.05,
                  fontWeight: 600,
                  color: "var(--brand-surface)",
                }}
              >
                {titleText}
              </h1>

              {subtitleText ? (
                <>
                  <div className="mt-7 h-[2px] w-28 bg-[#2B9BC0]" />
                  <p
                    className="mt-6"
                    style={{
                      fontFamily:
                        "Inter, Avenir Next, Helvetica Neue, Arial, sans-serif",
                      fontSize: "15pt",
                      lineHeight: 1.28,
                      fontWeight: 300,
                      color: "#F3E8D3",
                    }}
                  >
                    {subtitleText}
                  </p>
                </>
              ) : (
                <div className="mt-7 h-[2px] w-28 bg-[#2B9BC0]" />
              )}
            </div>
          </div>

          <div className="pb-2">
            {metaLines.map((line, index) => (
              <p
                key={`${page.id}-meta-${index}`}
                className={index === 0 ? "" : "mt-2"}
                style={{
                  fontFamily:
                    "Inter, Avenir Next, Helvetica Neue, Arial, sans-serif",
                  fontSize: index === 0 ? "10pt" : "10.5pt",
                  lineHeight: 1.35,
                  fontWeight: index === 0 ? 500 : 300,
                  letterSpacing:
                    index === 0 ? "0.14em" : "0.04em",
                  textTransform:
                    index === 0 ? "uppercase" : "none",
                  color:
                    index === 0
                      ? "var(--brand-accent)"
                      : "rgba(248,243,232,0.9)",
                }}
              >
                {line}
              </p>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isChapterDescriptionPage && markdownBlock) {
    return (
      <div className="relative h-[660px] w-[480px] overflow-hidden bg-[#021A2B] text-[var(--brand-surface)] select-none">
        <div
          className="absolute inset-0 opacity-95"
          style={{
            background:
              "radial-gradient(circle at 18% 22%, rgba(175,147,85,0.14), transparent 30%), radial-gradient(circle at 88% 76%, rgba(43,155,192,0.24), transparent 36%), linear-gradient(160deg, #01101C 0%, #021A2B 52%, #082B3A 100%)",
          }}
        />

        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -right-20 top-[-80px] h-[300px] w-[300px] rounded-full border border-[#2B9BC0]/25" />
          <div className="absolute -left-28 bottom-[-120px] h-[340px] w-[340px] rounded-full border border-[var(--brand-border)]/18" />
          <div className="absolute bottom-16 right-[-40px] h-[1px] w-[300px] rotate-[-32deg] bg-[var(--brand-border)]/60" />
          <div className="absolute left-10 top-10 h-[92px] w-[1px] bg-[var(--brand-border)]/45" />
          <div className="absolute left-10 top-10 h-[1px] w-[92px] bg-[var(--brand-border)]/45" />
        </div>

        <div
          className="relative z-10 flex h-full flex-col justify-center py-12"
          style={{
            paddingLeft:
              page.pageNumber === 117
                ? "72px"
                : page.pageNumber === 11
                  ? "56px"
                  : "40px",
            paddingRight:
              page.pageNumber === 117
                ? "24px"
                : page.pageNumber === 11
                  ? "24px"
                  : "40px",
          }}
        >
          <ReactMarkdown
            components={{
              h1: ({ node, ...props }: any) => (
                <h1
                  className="mb-8 text-left"
                  style={{
                    fontFamily: "var(--font-serif-primary)",
                    fontSize: "34pt",
                    lineHeight: 0.94,
                    fontWeight: 700,
                    letterSpacing: "-0.025em",
                    color: "var(--brand-accent)",
                    textShadow: "0 3px 12px rgba(0,0,0,0.45)",
                  }}
                  {...props}
                />
              ),
              h2: ({ node, ...props }: any) => (
                <h2
                  className="mb-8 text-left"
                  style={{
                    fontFamily: "var(--font-serif-primary)",
                    fontSize: "34pt",
                    lineHeight: 0.94,
                    fontWeight: 700,
                    letterSpacing: "-0.025em",
                    color: "var(--brand-accent)",
                    textShadow: "0 3px 12px rgba(0,0,0,0.45)",
                  }}
                  {...props}
                />
              ),
              p: ({ node, ...props }: any) => (
                <p
                  className="max-w-[360px] text-left"
                  style={{
                    fontFamily:
                      "Inter, Avenir Next, Helvetica Neue, Arial, sans-serif",
                    fontSize: "14pt",
                    lineHeight: 1.42,
                    fontWeight: 300,
                    color: "rgba(248,243,232,0.92)",
                  }}
                  {...props}
                />
              ),
              strong: ({ node, ...props }: any) => (
                <strong
                  style={{ fontWeight: 700 }}
                  {...props}
                />
              ),
              em: ({ node, ...props }: any) => (
                <em
                  style={{ fontStyle: "italic" }}
                  {...props}
                />
              ),
            }}
          >
            {markdownBlock.content}
          </ReactMarkdown>

          <div className="mt-8 h-[2px] w-44 bg-[#2B9BC0]" />
        </div>
      </div>
    );
  }

  if (isVolumeOnePage) {
    const volumeMarkdown = markdownBlock?.content || "";

    return (
      <div className="h-[660px] w-[480px] relative overflow-hidden bg-ivory text-charcoal select-none">
        <GrainOverlay />

        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -right-[86px] top-[-82px] h-[220px] w-[220px] rounded-full border border-[#19454B]/14" />
          <div className="absolute -left-[110px] bottom-[-92px] h-[250px] w-[250px] rounded-full border border-[#19454B]/10" />
          <div className="absolute left-[54px] top-[58px] h-[96px] w-[1px] bg-[var(--brand-accent)]/55" />
          <div className="absolute left-[54px] top-[58px] h-[1px] w-[132px] bg-[var(--brand-accent)]/55" />
          <div className="absolute right-[58px] bottom-[74px] h-[1px] w-[132px] bg-[var(--brand-accent)]/55" />
          <div className="absolute right-[58px] bottom-[74px] h-[96px] w-[1px] bg-[var(--brand-accent)]/55" />
        </div>

        <div className="absolute left-[56px] right-[48px] top-[132px] bottom-[96px] flex flex-col items-center justify-center text-center">
          {volumeMarkdown ? (
            <ReactMarkdown
              components={{
                p: ({ children }) => (
                  <p
                    className="uppercase mb-9 text-center"
                    style={{
                      fontFamily:
                        "Arial Narrow, Avenir Next Condensed, Roboto Condensed, Helvetica Neue, sans-serif",
                      fontSize: "8.5pt",
                      lineHeight: 1.2,
                      letterSpacing: "0.28em",
                      color: "#19454B",
                    }}
                  >
                    {children}
                  </p>
                ),
                h1: ({ children }) => (
                  <h1
                    className="text-center mb-8"
                    style={{
                      fontFamily: "var(--font-serif-primary)",
                      fontSize: "46pt",
                      lineHeight: 0.92,
                      fontWeight: 700,
                      letterSpacing: "-0.035em",
                      color: "#021A2B",
                    }}
                  >
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2
                    className="text-center"
                    style={{
                      fontFamily: "var(--font-serif-primary)",
                      fontSize: "19pt",
                      lineHeight: 1.1,
                      fontWeight: 700,
                      color: "#19454B",
                    }}
                  >
                    {children}
                  </h2>
                ),
                hr: () => <div className="w-[172px] h-[2px] bg-[var(--brand-accent)]/80 my-8" />,
              }}
            >
              {volumeMarkdown}
            </ReactMarkdown>
          ) : null}
        </div>

        <div className="absolute right-0 top-0 bottom-0 w-[34px] pointer-events-none bg-gradient-to-l from-black/[0.055] to-transparent" />
      </div>
    );
  }


  if (isFrontOpenerPage) {
    return (
      <div className="h-[660px] w-[480px] bg-ivory overflow-hidden relative text-charcoal">
        <GrainOverlay />

        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute left-[96px] bottom-[84px] h-[1px] w-[288px] bg-[var(--brand-accent)]/42" />
          <div className="absolute -right-[126px] top-[-104px] h-[260px] w-[260px] rounded-full border border-[var(--brand-accent)]/16" />
          <div className="absolute -left-[140px] bottom-[-128px] h-[280px] w-[280px] rounded-full border border-[var(--brand-accent)]/14" />
        </div>

        <div className="absolute left-[58px] right-[58px] top-[54px] bottom-[120px] flex flex-col items-center justify-center text-center">
          <div className="w-[210px] h-[2px] bg-[var(--brand-accent)]/70 mb-10" />

          <h1
            className="mb-8 text-center"
            style={{
              fontFamily: "var(--font-serif-primary)",
              fontSize: "42pt",
              lineHeight: 0.92,
              fontWeight: 700,
              letterSpacing: "-0.035em",
              color: "#021A2B",
            }}
          >
            
          </h1>

          <div className="w-[168px] h-[2px] bg-[var(--brand-accent)] mb-8" />

          <h2
            className="mb-6 text-center"
            style={{
              fontFamily: "var(--font-serif-primary)",
              fontSize: "21pt",
              lineHeight: 1.08,
              fontWeight: 700,
              color: "#021A2B",
            }}
          >
            
          </h2>

          <p
            className="uppercase mb-0 text-center"
            style={{
              fontFamily:
                "Arial Narrow, Avenir Next Condensed, Roboto Condensed, Helvetica Neue, sans-serif",
              fontSize: "13pt",
              lineHeight: 1.15,
              letterSpacing: "0.24em",
              color: "#5A5A5A",
            }}
          >
            
          </p>
        </div>

        <p
          className="absolute left-[48px] right-[48px] bottom-[38px] text-center uppercase"
          style={{
            fontFamily:
              "Arial Narrow, Avenir Next Condensed, Roboto Condensed, Helvetica Neue, sans-serif",
            fontSize: "7.25pt",
            lineHeight: 1.35,
            letterSpacing: "0.18em",
            color: "var(--brand-accent)",
          }}
        >
          
        </p>

        <div className="absolute right-0 top-0 bottom-0 w-[34px] pointer-events-none bg-gradient-to-l from-black/[0.055] to-transparent" />
      </div>
    );
  }

  return (
    <div
      className={`h-[660px] w-[480px] bg-ivory overflow-hidden relative ${isGeneratedTitlePage ? "flex items-center" : ""}`}
      style={
        chapterDividerBlock || shareBlock
          ? {
              paddingLeft: "0px",
              paddingRight: "0px",
              paddingTop: "0px",
              paddingBottom: "0px",
            }
          : isMissionStatementPage || showWelcomeHeader
            ? {
                paddingLeft: "0px",
                paddingRight: "0px",
                paddingTop: "0px",
                paddingBottom,
              }
            : isStoryTextPage
              ? {
                  paddingLeft: articleStoryPaddingX,
                  paddingRight: articleStoryPaddingX,
                  paddingTop: articleStoryPaddingTop,
                  paddingBottom: articleStoryPaddingBottom,
                }
              : {
                  paddingLeft,
                  paddingRight,
                  paddingTop: isWelcomePage
                    ? "76px"
                    : isHowToUsePage
                      ? "92px"
                      : paddingTop,
                  paddingBottom: isWelcomePage
                    ? "120px"
                    : paddingBottom,
                }
      }
    >
      <GrainOverlay />
      <div
        className={`max-w-none text-charcoal flex flex-col h-full ${isGeneratedTitlePage ? "justify-center w-full" : ""}`}
      >
        {showWelcomeHeader && (
          <h1
            className="mb-3 text-left"
            style={{
              fontFamily: "var(--font-serif-primary)",
              fontSize: "30pt",
              lineHeight: 1.05,
              color: "#021A2B",
              fontWeight: 400,
              paddingTop: "82px",
              paddingLeft,
              paddingRight,
            }}
          >
            
          </h1>
        )}

        {isWelcomePage && (
          <h1
            className="mb-7 text-left"
            style={{
              fontFamily: "var(--font-serif-primary)",
              fontSize: "20pt",
              lineHeight: 1.08,
              fontWeight: 400,
              color: "#021A2B",
            }}
          >
            Dear Reader,
          </h1>
        )}

        <div
          className={
            isMissionStatementPage || showWelcomeHeader
              ? "flex-1"
              : "contents"
          }
          style={
            isMissionStatementPage || showWelcomeHeader
              ? {
                  paddingLeft,
                  paddingRight,
                  paddingTop: isMissionStatementPage
                    ? "82px"
                    : "18px",
                }
              : undefined
          }
        >
          {chapterDividerBlock ? (
            <ChapterDividerBlock
              title={chapterDividerBlock.title}
              subtitle={chapterDividerBlock.subtitle}
              eyebrow={chapterDividerBlock.eyebrow}
            />
          ) : shareBlock ? (
            <EditorialShareBlock
              articleId={shareBlock.articleId}
              articleTitle={shareBlock.articleTitle}
              articleUrl={shareBlock.articleUrl}
              articleExcerpt={shareBlock.articleExcerpt}
              articleImage={shareBlock.articleImage}
              pageNumber={page.pageNumber}
            />
          ) : markdownBlock ? (
            <ReactMarkdown
              components={
                isGeneratedTitlePage
                  ? titlePageComponents
                  : storyComponents
              }
            >
              {markdownBlock.content}
            </ReactMarkdown>
          ) : null}
        </div>
      </div>

      {isWelcomePage && (
        <p
          className="absolute right-[56px] bottom-[54px] text-right"
          style={{
            fontFamily: "var(--font-serif-primary)",
            fontSize: "27pt",
            fontWeight: 400,
            fontStyle: "normal",
            letterSpacing: "0.01em",
            lineHeight: 1,
            color: "#021A2B",
            opacity: 0.88,
            textShadow: "none",
          }}
        >
          
        </p>
      )}
    </div>
  );
};

const BrandLogoArtwork = ({
  dark = false,
}: {
  dark?: boolean;
}) => (
  <div
    className="flex h-[86px] w-[86px] items-center justify-center rounded-full"
    style={{
      backgroundColor: dark
        ? "rgba(248,243,232,0.96)"
        : "rgba(255,255,255,0.82)",
      border: dark
        ? "1px solid rgba(175,147,85,0.62)"
        : "1px solid rgba(175,147,85,0.45)",
      boxShadow: dark
        ? "0 18px 42px rgba(0,0,0,0.28)"
        : "0 16px 38px rgba(2,26,43,0.12)",
    }}
  >
    <img
      src={brandLogo}
      alt=""
      className="h-[58px] w-[58px] object-contain"
      style={{ filter: dark ? "none" : "saturate(0.95)" }}
    />
  </div>
);

const CONTENTS_LOGO_DATA_URI = resolveRepositoryRootAssetUrl("/images/brand/rare-revolution-trademark-logo.png");

const ContentsLineIcon = ({
  kind,
}: {
  kind: string;
}) => {
  const stroke = "#021A2B";

  if (kind === "logo" || kind === "author") {
    return (
      <img
        src={CONTENTS_LOGO_DATA_URI}
        alt=""
        className="h-[38px] w-[38px] object-contain opacity-90"
      />
    );
  }

  if (kind === "pen") {
    return (
      <svg
        viewBox="0 0 36 36"
        className="h-[38px] w-[38px]"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M24.5 4.5c3 2.3 4.6 5.5 4.5 9.2-.2 6.3-5.9 11.5-14.7 16.8 1.3-8.7 3.9-16.4 10.2-26Z"
          stroke={stroke}
          strokeWidth="1.2"
        />
        <path
          d="M10 31c3.7-5.6 8.2-11.4 14.5-17.5"
          stroke={stroke}
          strokeWidth="1.1"
          strokeLinecap="round"
        />
        <path
          d="M19 10.5c2 1.1 3.8 2.7 5.2 4.7"
          stroke={stroke}
          strokeWidth="1"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (kind === "people") {
    return (
      <svg
        viewBox="0 0 36 36"
        className="h-[38px] w-[38px]"
        fill="none"
        aria-hidden="true"
      >
        <circle
          cx="18"
          cy="11"
          r="4.2"
          stroke={stroke}
          strokeWidth="1.2"
        />
        <path
          d="M10.5 28c.9-5 3.6-8 7.5-8s6.6 3 7.5 8"
          stroke={stroke}
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <circle
          cx="8.5"
          cy="15.5"
          r="3"
          stroke={stroke}
          strokeWidth="1"
        />
        <path
          d="M3.6 27c.5-3.3 2.4-5.4 5.2-5.7"
          stroke={stroke}
          strokeWidth="1"
          strokeLinecap="round"
        />
        <circle
          cx="27.5"
          cy="15.5"
          r="3"
          stroke={stroke}
          strokeWidth="1"
        />
        <path
          d="M32.4 27c-.5-3.3-2.4-5.4-5.2-5.7"
          stroke={stroke}
          strokeWidth="1"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (kind === "chat") {
    return (
      <svg
        viewBox="0 0 36 36"
        className="h-[38px] w-[38px]"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M7 8.5h22a3 3 0 0 1 3 3v10.2a3 3 0 0 1-3 3H16.8L9 31v-6.3H7a3 3 0 0 1-3-3V11.5a3 3 0 0 1 3-3Z"
          stroke={stroke}
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
        <path
          d="M10.5 14.5h15M10.5 18.5h12M10.5 22.5h8"
          stroke={stroke}
          strokeWidth="1"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 36 36"
      className="h-[38px] w-[38px]"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M18 4v4M18 28v4M5 18h4M27 18h4M8.8 8.8l2.8 2.8M24.4 24.4l2.8 2.8M27.2 8.8l-2.8 2.8M11.6 24.4l-2.8 2.8"
        stroke={stroke}
        strokeWidth="1"
        strokeLinecap="round"
      />
      <path
        d="M13 20.5c-2.5-2.8-2.1-7.4 1.1-9.7 2.4-1.8 5.8-1.8 8.2 0 3.2 2.3 3.5 6.9 1 9.7-1.3 1.5-2.1 2.8-2.3 4.5h-6c-.1-1.7-.9-3-2-4.5Z"
        stroke={stroke}
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path
        d="M15 28h6"
        stroke={stroke}
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
};

const contentsItems: any[] = [];

export const WhatsInsideLeftPageLayout = ({
  page,
  blocks,
}: PageLayoutProps) => {
  const markdownContent = getMarkdownContentFromBlocks(blocks) || `# What's\nInside`;

  return (
    <div className="h-[660px] w-[480px] relative overflow-hidden bg-[#021A2B] text-[var(--brand-surface)] select-none">
      <div
        className="absolute inset-0 opacity-95"
        style={{
          background:
            "radial-gradient(circle at 82% 16%, rgba(43,155,192,0.2), transparent 34%), radial-gradient(circle at 15% 86%, rgba(175,147,85,0.12), transparent 38%), linear-gradient(180deg, #01101C 0%, #021A2B 46%, #01101C 100%)",
        }}
      />

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -left-[136px] bottom-[-122px] h-[310px] w-[310px] rounded-full border border-[var(--brand-accent)]/14" />
        <div className="absolute -right-[132px] top-[-110px] h-[288px] w-[288px] rounded-full border border-[#2B9BC0]/18" />
        <div className="absolute left-[58px] top-[74px] h-[1px] w-[136px] bg-[var(--brand-accent)]/62" />
        <div className="absolute left-[58px] top-[74px] h-[108px] w-[1px] bg-[var(--brand-accent)]/45" />
        <div className="absolute right-[64px] bottom-[86px] h-[1px] w-[116px] bg-[var(--brand-accent)]/42" />
      </div>

      <div className="absolute left-[58px] top-[198px] text-left">
        <ReactMarkdown
          components={{
            h1: ({ children }) => (
              <h1
                style={{
                  fontFamily: "var(--font-serif-primary)",
                  fontSize: "58pt",
                  lineHeight: 0.86,
                  fontWeight: 700,
                  letterSpacing: "-0.025em",
                  color: "var(--brand-accent)",
                  textShadow: "0 3px 14px rgba(0,0,0,0.44)",
                }}
              >
                {children}
              </h1>
            ),
          }}
        >
          {markdownContent}
        </ReactMarkdown>
        <div className="mt-8 h-[2px] w-[136px] bg-[var(--brand-accent)]/80" />
      </div>

      <div className="absolute right-0 top-0 bottom-0 w-[38px] pointer-events-none bg-gradient-to-l from-black/[0.2] to-transparent" />
    </div>
  );
};


export const WhatsInsideRightPageLayout = ({
  page,
  onNavigate,
  blocks,
}: PageLayoutProps) => {
  const pageOverrides = new Map<string, string>();
  const githubContentsItems = (blocks || [])
    .filter((block: any) => block.type === "contents-item")
    .map((block: any) => ({
      title: block.title || "",
      body: block.body || "",
      page: block.page || "",
      icon: block.icon || "column",
      target: block.target,
    }))
    .filter((item: any) => item.title);
  const displayContentsItems = githubContentsItems.length > 0 ? githubContentsItems : contentsItems;

  blocks?.forEach((block) => {
    if (block.type === "toc-entry") {
      pageOverrides.set(block.title, block.pageNumber);
    }
  });

  const getTargetPage = (item: any) => {
    if ("target" in item && item.target === "back-cover") {
      return "back-cover" as const;
    }

    const pageValue =
      pageOverrides.get(item.title) || item.page;
    const pageNumber = Number.parseInt(pageValue, 10);
    return Number.isFinite(pageNumber) ? pageNumber : null;
  };

  const formatPage = (item: any) => {
    if ("target" in item && item.target === "back-cover") {
      return "";
    }

    const pageValue =
      pageOverrides.get(item.title) || item.page;
    const pageNumber = Number.parseInt(pageValue, 10);
    if (!Number.isFinite(pageNumber)) return pageValue;
    return String(pageNumber).padStart(2, "0");
  };

  return (
    <div className="h-[660px] w-[480px] relative overflow-hidden bg-ivory text-charcoal select-none">
      <GrainOverlay />

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -right-[122px] top-[-112px] h-[288px] w-[288px] rounded-full border border-[#19454B]/10" />
        <div className="absolute left-[54px] top-[60px] h-[1px] w-[128px] bg-[var(--brand-accent)]/45" />
        <div className="absolute right-[56px] bottom-[76px] h-[96px] w-[1px] bg-[var(--brand-accent)]/32" />
        <div className="absolute right-[56px] bottom-[76px] h-[1px] w-[124px] bg-[var(--brand-accent)]/32" />
      </div>

      <div className="absolute left-[56px] right-[44px] top-[78px] bottom-[72px]">
        <div className="flex h-full flex-col justify-between">
          {displayContentsItems.map((item: any) => {
            const targetPage = getTargetPage(item);
            const isLinked = Boolean(onNavigate && targetPage);

            const content = (
              <>
                <div
                  className="text-right"
                  style={{
                    fontFamily: "var(--font-serif-primary)",
                    fontSize: "20pt",
                    lineHeight: 1,
                    fontWeight: 700,
                    color: "#021A2B",
                  }}
                >
                  {formatPage(item)}
                </div>

                <div className="flex justify-center pt-[2px]">
                  <ContentsLineIcon kind={item.icon} />
                </div>

                <div className="pt-[1px] text-left">
                  <h2
                    className="inline-block border-b border-[#2B9BC0]/80 pb-[2px]"
                    style={{
                      fontFamily: "var(--font-serif-primary)",
                      fontSize: "14pt",
                      lineHeight: 1.04,
                      fontWeight: 700,
                      color: "#021A2B",
                    }}
                  >
                    {item.title}
                  </h2>
                  <p
                    className="mt-[4px]"
                    style={{
                      fontFamily: "var(--font-serif-secondary)",
                      fontSize: "8.6pt",
                      lineHeight: 1.28,
                      color: "#3F3F3F",
                    }}
                  >
                    {item.body}
                  </p>
                </div>
              </>
            );

            if (!isLinked || !targetPage) {
              return (
                <div
                  key={item.title}
                  className="grid grid-cols-[48px_48px_1fr] items-start gap-4"
                >
                  {content}
                </div>
              );
            }

            return (
              <button
                key={item.title}
                type="button"
                onClick={() => onNavigate?.(targetPage)}
                className="grid grid-cols-[48px_48px_1fr] items-start gap-4 text-left cursor-pointer transition-opacity hover:opacity-75 focus:outline-none focus:ring-2 focus:ring-[var(--brand-accent)]/45 focus:ring-offset-2 focus:ring-offset-ivory"
                aria-label={
                  targetPage === "back-cover"
                    ? `Go to ${item.title} on the back cover`
                    : `Go to ${item.title}, page ${formatPage(item)}`
                }
                title={
                  targetPage === "back-cover"
                    ? `${item.title} on the back cover`
                    : `Go to ${item.title}`
                }
              >
                {content}
              </button>
            );
          })}
        </div>
      </div>

      <div className="absolute left-0 top-0 bottom-0 w-[34px] pointer-events-none bg-gradient-to-r from-black/[0.05] to-transparent" />
    </div>
  );
};


const A_DAY_IN_LIFE_ITEMS = [
  {
    "title": "The weight of stillness – a journey with dystonia: a first journal entry",
    "date": "1 April 2026",
    "url": "https://rarerevolutionmagazine.com/the-weight-of-stillness-a-journey-with-dystonia-a-first-journal-entry/",
    "image": resolveRepositoryAssetUrl("/images/a-day-in-life/a-day-in-the-life-ac30339e.png")
  },
  {
    "title": "A day in the life: reconciling grief and gratitude",
    "date": "17 December 2025",
    "url": "https://rarerevolutionmagazine.com/a-day-in-the-life-reconciling-grief-and-gratitude/",
    "image": resolveRepositoryAssetUrl("/images/a-day-in-life/a-day-in-the-life-fbcb23d3.png")
  },
  {
    "title": "A day in the life: Vicky, Mum to Tiger-Lily",
    "date": "3 December 2025",
    "url": "https://rarerevolutionmagazine.com/a-day-in-the-life-vicky-mum-to-tiger-lily/",
    "image": resolveRepositoryAssetUrl("/images/a-day-in-life/a-day-in-the-life-b8c2dc6a.png")
  },
  {
    "title": "A Day in the Life: living with sickle cell anaemia-Naomi’s story",
    "date": "23 October 2024",
    "url": "https://rarerevolutionmagazine.com/a-day-in-the-life-living-with-sickle-cell-anaemia-naomis-story/",
    "image": resolveRepositoryAssetUrl("/images/a-day-in-life/a-day-in-the-life-1b37ffdf.png")
  },
  {
    "title": "A day in the life of a PSPA helpline manager",
    "date": "14 October 2024",
    "url": "https://rarerevolutionmagazine.com/a-day-in-the-life-of-a-pspa-helpline-manager/",
    "image": resolveRepositoryAssetUrl("/images/a-day-in-life/a-day-in-the-life-1c807df5.png")
  },
  {
    "title": "Drunk or disabled? – challenges with ataxia",
    "date": "16 September 2024",
    "url": "https://rarerevolutionmagazine.com/drunk-or-disabled-challenges-with-ataxia/",
    "image": resolveRepositoryAssetUrl("/images/a-day-in-life/a-day-in-the-life-2b90dcde.png")
  },
  {
    "title": "#JosiahStrong: Living with familial cold autoinflammatory syndrome—one year on",
    "date": "14 August 2024",
    "url": "https://rarerevolutionmagazine.com/josiahstrong-living-with-familial-cold-autoinflammatory-syndrome-one-year-on/",
    "image": resolveRepositoryAssetUrl("/images/a-day-in-life/a-day-in-the-life-6ec21bb2.png")
  },
  {
    "title": "If you’re not dancing, something is wrong…",
    "date": "1 May 2024",
    "url": "https://rarerevolutionmagazine.com/if-youre-not-dancing-something-is-wrong/",
    "image": resolveRepositoryAssetUrl("/images/a-day-in-life/a-day-in-the-life-4e04e52c.png")
  },
  {
    "title": "A day in the life: living with dyskeratosis congenita (DC)—Paula’s story",
    "date": "19 April 2024",
    "url": "https://rarerevolutionmagazine.com/a-day-in-the-life-living-with-dyskeratosis-congenita-dc-paulas-story/",
    "image": resolveRepositoryAssetUrl("/images/a-day-in-life/a-day-in-the-life-e618a3aa.png")
  },
  {
    "title": "A day in the life: living with Bardet-Biedl syndrome—Tessa’s story",
    "date": "16 February 2024",
    "url": "https://rarerevolutionmagazine.com/a-day-in-the-life-living-with-bardet-biedl-syndrome-tessas-story/",
    "image": resolveRepositoryAssetUrl("/images/a-day-in-life/a-day-in-the-life-7449b9d2.png")
  },
  {
    "title": "Don’t let your condition define you! David’s journey with stiff person syndrome",
    "date": "14 February 2024",
    "url": "https://rarerevolutionmagazine.com/davids-journey-with-stiff-person-syndrome/",
    "image": resolveRepositoryAssetUrl("/images/a-day-in-life/a-day-in-the-life-f7d202ae.png")
  },
  {
    "title": "A day in the life: a medically complex condition that is as unpredictable as the weather",
    "date": "29 November 2023",
    "url": "https://rarerevolutionmagazine.com/a-day-in-the-life-a-medically-complex-condition-that-is-as-unpredictable-as-the-weather/",
    "image": resolveRepositoryAssetUrl("/images/a-day-in-life/a-day-in-the-life-e2bebbb2.png")
  },
  {
    "title": "A day in the life: navigating our way through the labyrinth of a newly discovered disease",
    "date": "9 October 2023",
    "url": "https://rarerevolutionmagazine.com/a-day-in-the-life-navigating-our-way-through-the-labyrinth-of-a-newly-discovered-disease/",
    "image": resolveRepositoryAssetUrl("/images/a-day-in-life/a-day-in-the-life-8ad0118b.png")
  },
  {
    "title": "A day in the life: a glimpse into my life living with scleroderma",
    "date": "15 September 2023",
    "url": "https://rarerevolutionmagazine.com/a-day-in-the-life-a-glimpse-into-my-life-living-with-scleroderma/",
    "image": resolveRepositoryAssetUrl("/images/a-day-in-life/a-day-in-the-life-f1772b64.png")
  },
  {
    "title": "A day in the life: graduation day for Raymond Huml’s son, Jon",
    "date": "25 July 2023",
    "url": "https://rarerevolutionmagazine.com/a-day-in-the-life-graduation-day-for-raymond-humls-son-jon/",
    "image": resolveRepositoryAssetUrl("/images/a-day-in-life/a-day-in-the-life-1b5cb7a6.png")
  },
  {
    "title": "A day in the life: Josiah’s diagnosis with familial cold autoinflammatory syndrome",
    "date": "28 June 2023",
    "url": "https://rarerevolutionmagazine.com/a-day-in-the-life-josiahs-diagnosis-with-familial-cold-autoinflammatory-syndrome/",
    "image": resolveRepositoryAssetUrl("/images/a-day-in-life/a-day-in-the-life-f41a9cb2.png")
  },
  {
    "title": "A day in the life: Cathy Moughton, PSPA helpline care navigator",
    "date": "24 May 2023",
    "url": "https://rarerevolutionmagazine.com/a-day-in-the-life-cathy-moughton-pspa-helpline-care-navigator/",
    "image": resolveRepositoryAssetUrl("/images/a-day-in-life/a-day-in-the-life-1045279c.png")
  },
  {
    "title": "A day in the life with hypokalemic periodic paralysis: Ralph Berthiaume",
    "date": "1 May 2023",
    "url": "https://rarerevolutionmagazine.com/a-day-in-the-life-with-hypokalemic-periodic-paralysis-ralph-berthiaume/",
    "image": resolveRepositoryAssetUrl("/images/a-day-in-life/a-day-in-the-life-cc1b8866.png")
  },
  {
    "title": "A day in the life with Behcet’s disease: Pamela Price",
    "date": "29 March 2023",
    "url": "https://rarerevolutionmagazine.com/a-day-in-the-life-with-behcets-disease-pamela-price/",
    "image": resolveRepositoryAssetUrl("/images/a-day-in-life/a-day-in-the-life-58bd1f01.png")
  },
  {
    "title": "My year at RARE Youth Revolution",
    "date": "26 January 2022",
    "url": "https://rarerevolutionmagazine.com/my-year-at-rare-youth-revolution/",
    "image": resolveRepositoryAssetUrl("/images/a-day-in-life/a-day-in-the-life-2eccdb57.png")
  },
  {
    "title": "Realising our workplace vision",
    "date": "6 October 2021",
    "url": "https://rarerevolutionmagazine.com/realising-our-workplace-vision-2/",
    "image": resolveRepositoryAssetUrl("/images/a-day-in-life/a-day-in-the-life-c18012e6.png")
  },
  {
    "title": "RARE Employment Q&A with Police Inspector David Singleton",
    "date": "6 October 2021",
    "url": "https://rarerevolutionmagazine.com/rare-employment-qa-with-police-inspector-david-singleton-2/",
    "image": resolveRepositoryAssetUrl("/images/a-day-in-life/a-day-in-the-life-e92fa320.png")
  },
  {
    "title": "Professional careers and rare disease – finding a balance that works",
    "date": "6 October 2021",
    "url": "https://rarerevolutionmagazine.com/professional-careers-and-rare-disease-finding-a-balance-that-works-2/",
    "image": resolveRepositoryAssetUrl("/images/a-day-in-life/a-day-in-the-life-b8a16f68.png")
  }
] as const;

const shortenDayInLifeTitle = (title: string, maxLength = 58) => {
  if (title.length <= maxLength) return title;
  const shortened = title.slice(0, maxLength - 3).replace(/\s+\S*$/, "");
  return `${shortened}...`;
};


type EditorialTeamMember = {
  name: string;
  role: string;
  image: string;
  bioParagraphs: string[];
  excerpt?: string;
  linkedin: string;
  email: string;
};

const editorialTeamMembers: EditorialTeamMember[] = [
  {
    name: "Rebecca Stewart",
    role: "CEO",
    image: resolveRepositoryAssetUrl("/images/editorial-team/rebecca-stewart.png"),
    excerpt: "Rebecca is our co-founder and brings 30 years of client care experience and ethos to guide our dedicated team. With a passion for people and building networks, Rebecca has channelled a community approach to realising meaningful, accessible resources and the power of education through compelling storytelling.",
    bioParagraphs: [
      "Rebecca is our co-founder and brings 30 years of client care experience and ethos to guide our dedicated team.",
      "With a passion for people and building networks, Rebecca has channelled a community approach to realising meaningful, accessible resources and the power of education through compelling storytelling. Through the development of the company’s “safe hands” approach, Rebecca is committed to steering responsible and sensitive journalism and is active in driving this message forward.",
      "Rebecca is also co-founder and trustee of Action for XP, a charity supporting those with the ultra-rare condition xeroderma pigmentosum, supporting people internationally with vital protective equipment, education and health and well-being programmes.",
    ],
    linkedin: "https://www.linkedin.com/in/rebeccatstewart/",
    email: "rstewart@rarerevolutionmagazine.com",
  },
  {
    name: "Nicola Miller",
    role: "Editor-in-chief",
    image: resolveRepositoryAssetUrl("/images/editorial-team/nicola-miller.png"),
    bioParagraphs: [
      "Nicola is our uber creative co-founder and editor-in-chief. With a strong background in design and a passion for writing, Nicola is the driving force behind our creative vision, and uses her strategic experience in large-scale project planning to oversee our varied work, including RARE Youth Revolution.",
      "Nicola is co-founder and trustee of the charity Action for XP, volunteering her time to drive forward their mission—supporting families living with the ultra-rare condition xeroderma pigmentosum.",
      "Nicola is also author of the award-winning rare disease children’s book series, Little Ted. When not dedicating her time to rare disease, she is raising her two gorgeous sons, and is a rare mama herself.",
    ],
    linkedin: "https://www.linkedin.com/in/nicola-miller-5b815314/",
    email: "editor@rarerevolutionmagazine.com",
  },
  {
    name: "Becky Pender",
    role: "Senior Associate partnerships and delivery",
    image: resolveRepositoryAssetUrl("/images/editorial-team/becky-pender.png"),
    bioParagraphs: [
      "Becky lives in Glasgow and, among other things, is mum to four young girls. Her eldest daughter lives with not one but two rare genetic conditions making her the only child worldwide with both.",
      "With a background of over 15 years in customer service, Becky loves nothing more than curating relationships with like-minded people across the world, making her the perfect fit to look after our RARE community, charity and media partners as well as our patient engagement projects.",
      "When she’s not working, she loves reading or making memories with her daughters. You can usually find her with a cup of coffee in hand.",
    ],
    linkedin: "https://www.linkedin.com/in/rebecca-pender-14167334/",
    email: "rpender@rarerevolutionmagazine.com",
  },
  {
    name: "Emma Bishop",
    role: "Associate editorial and design",
    image: resolveRepositoryAssetUrl("/images/editorial-team/emma-bishop.png"),
    bioParagraphs: [
      "Emma’s background is in the arts, having completed a diploma in foundation studies in Art and Design and an MA in the history of art and design. She has previously worked in retail merchandising for various fashion brands.",
      "Emma’s creative talents, both in design and writing, are always innovative and perceptive to her client’s brief.",
      "Emma has a love of painting and sketching, but these days her artistic endeavours consist more of potato printing and making lolly stick people with her children, than painting watercolours!",
    ],
    linkedin: "https://www.linkedin.com/in/emma-bishop-6b097a207/",
    email: "ebishop@rarerevolutionmagazine.com",
  },
  {
    name: "Karen Roberts",
    role: "Writer and digital editor",
    image: resolveRepositoryAssetUrl("/images/editorial-team/karen-roberts.png"),
    bioParagraphs: [
      "Karen has 20 years of experience in the media industry. She has worked as a journalist for both regional and national titles, and has also worked freelance in media relations and communications.",
      "She is committed to responsible storytelling and has a passion for bringing attention to issues and voices that might otherwise go unheard.",
      "Karen is a mum of two and is based in the north-east of Scotland. When she’s not working, or providing a taxi service for her children, she enjoys writing poetry and watching bingeworthy box sets.",
    ],
    linkedin: "https://www.linkedin.com/in/karen-roberts-7a216319/",
    email: "kroberts@rarerevolutionmagazine.com",
  },
  {
    name: "Joe Rumney",
    role: "Creative designer",
    image: resolveRepositoryAssetUrl("/images/editorial-team/joe-rumney.png"),
    excerpt: "Joe is our creative designer. He is a creative person, whose qualifications range from graphic arts to English language and everything in between. At just 14 months old, Joe was diagnosed with two rare genetic conditions...",
    bioParagraphs: [
      "Joe is our creative designer. He is a creative person, whose qualifications range from graphic arts to English language and everything in between.",
      "At just 14 months old, Joe was diagnosed with two rare genetic conditions—cystinosis and Fanconi syndrome.",
      "If he is not out walking or getting stuck into a whodunnit, you’ll find Joe watching his favourite shows with a bar of chocolate (or maybe two).",
    ],
    linkedin: "https://www.linkedin.com/in/joemichaelrumney/",
    email: "jrumney@rarerevolutionmagazine.com",
  },
];

const LinkedInMark = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[12px] w-[12px] fill-current">
    <path d="M5.2 7.9H1.6V22h3.6V7.9ZM3.4 2A2.1 2.1 0 1 0 3.4 6.2 2.1 2.1 0 0 0 3.4 2ZM22.4 13.9c0-4.2-2.2-6.2-5.2-6.2-2.4 0-3.5 1.3-4.1 2.2v-2h-3.6V22h3.6v-7c0-1.8.3-3.6 2.6-3.6 2.2 0 2.3 2.1 2.3 3.7V22h3.6l.8-8.1Z" />
  </svg>
);

const MailMark = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[12px] w-[12px] fill-none stroke-current stroke-[2]">
    <rect x="2.5" y="4.5" width="19" height="15" rx="2" />
    <path d="m3.5 6 8.5 7 8.5-7" />
  </svg>
);

const EditorialTeamCard = ({ member }: { member: EditorialTeamMember }) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [isOpen]);

  return (
    <>
      <article className="grid min-h-0 flex-1 grid-cols-[142px_1fr] overflow-hidden border-t border-[#a9d8dd] bg-white/90">
        <div
          className="editorial-portrait relative overflow-hidden bg-[#eaf5f6]"
          role="img"
          aria-label={`${member.name}: hover to reveal the alternate team portrait`}
        >
          <div
            className="editorial-portrait-image absolute inset-0 bg-cover bg-top bg-no-repeat"
            style={{ backgroundImage: `url("${member.image}")` }}
          />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-[5px] bg-[#3fc0cb]" />
        </div>

        <div className="flex min-h-0 flex-col px-[20px] py-[12px]">
          <p className="mb-[3px] text-[7.5px] font-bold uppercase tracking-[0.17em] text-[#1592a7]">
            {member.role}
          </p>
          <h2 className="mb-[6px] text-[24px] font-light leading-none tracking-[-0.035em] text-[#203a48]">
            {member.name}
          </h2>

          <p className="editorial-bio-excerpt text-[8.25px] leading-[1.38] text-[#385467]">
            {member.excerpt ?? member.bioParagraphs[0]}
          </p>

          <div className="mt-auto flex items-center justify-between gap-[10px] pt-[7px]">
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                setIsOpen(true);
              }}
              className="text-[7.5px] font-bold uppercase tracking-[0.13em] text-[#1592a7] underline decoration-[#9fd8de] underline-offset-[3px] hover:text-[#0b7182] focus:outline-none focus-visible:ring-1 focus-visible:ring-[#1592a7]"
              aria-haspopup="dialog"
            >
              Read more
            </button>

            <div className="flex items-center gap-[7px]">
              <a
                href={member.linkedin}
                target="_blank"
                rel="noreferrer"
                onClick={(event) => event.stopPropagation()}
                className="flex h-[21px] w-[21px] items-center justify-center rounded-full bg-[#17384b] text-white transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#42c2cc]"
                aria-label={`${member.name} on LinkedIn`}
                title={`${member.name} on LinkedIn`}
              >
                <LinkedInMark />
              </a>
              <a
                href={`mailto:${member.email}`}
                onClick={(event) => event.stopPropagation()}
                className="flex h-[21px] w-[21px] items-center justify-center rounded-full bg-[#42c2cc] text-white transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#17384b]"
                aria-label={`Email ${member.name}`}
                title={`Email ${member.name}`}
              >
                <MailMark />
              </a>
            </div>
          </div>
        </div>
      </article>

      {isOpen && (
        <div
          className="absolute inset-0 z-[80] flex items-center justify-center bg-[#0b2737]/60 p-[28px] backdrop-blur-[2px]"
          role="presentation"
          onMouseDown={(event) => {
            event.stopPropagation();
            if (event.target === event.currentTarget) setIsOpen(false);
          }}
          onClick={(event) => event.stopPropagation()}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby={`editorial-dialog-${member.name.replace(/\s+/g, "-").toLowerCase()}`}
            className="relative max-h-[540px] w-full max-w-[390px] overflow-y-auto rounded-[4px] border border-[#9fd8de] bg-white px-[30px] pb-[26px] pt-[28px] shadow-[0_18px_55px_rgba(5,29,42,0.35)]"
          >
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="absolute right-[13px] top-[10px] flex h-[24px] w-[24px] items-center justify-center rounded-full text-[18px] leading-none text-[#17384b] hover:bg-[#e9f6f7] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#42c2cc]"
              aria-label="Close biography"
            >
              ×
            </button>

            <p className="mb-[4px] pr-[28px] text-[8px] font-bold uppercase tracking-[0.18em] text-[#1592a7]">
              {member.role}
            </p>
            <h3
              id={`editorial-dialog-${member.name.replace(/\s+/g, "-").toLowerCase()}`}
              className="mb-[16px] pr-[28px] text-[29px] font-light leading-none tracking-[-0.035em] text-[#203a48]"
            >
              {member.name}
            </h3>

            <div className="space-y-[11px] text-[10.5px] leading-[1.55] text-[#385467]">
              {member.bioParagraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>

            <div className="mt-[20px] flex items-center gap-[9px] border-t border-[#c9e7ea] pt-[14px]">
              <a
                href={member.linkedin}
                target="_blank"
                rel="noreferrer"
                className="flex h-[24px] w-[24px] items-center justify-center rounded-full bg-[#17384b] text-white transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#42c2cc]"
                aria-label={`${member.name} on LinkedIn`}
                title={`${member.name} on LinkedIn`}
              >
                <LinkedInMark />
              </a>
              <a
                href={`mailto:${member.email}`}
                className="flex h-[24px] w-[24px] items-center justify-center rounded-full bg-[#42c2cc] text-white transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#17384b]"
                aria-label={`Email ${member.name}`}
                title={`Email ${member.name}`}
              >
                <MailMark />
              </a>
            </div>
          </section>
        </div>
      )}
    </>
  );
};

const EditorialTeamPage = ({
  members,
  pageLabel,
  showTitle = false,
}: {
  members: EditorialTeamMember[];
  pageLabel: string;
  showTitle?: boolean;
}) => (
  <div className="relative flex h-full w-full flex-col overflow-hidden bg-[#f4fafb] text-[#17384b]">
    <style>{`
      .editorial-portrait-image {
        background-position: center top;
        background-size: 110% auto;
        transition: background-position 300ms ease-out, background-size 300ms ease-out;
      }
      .editorial-portrait:hover .editorial-portrait-image {
        background-position: center bottom;
      }
      .editorial-bio-excerpt {
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 4;
        overflow: hidden;
      }
    `}</style>
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_90%_4%,rgba(66,194,204,0.18),transparent_30%)]" />
    <div className="relative flex h-full min-h-0 flex-col px-[34px] pb-[25px] pt-[25px]">
      <header className={`flex items-end justify-between ${showTitle ? "mb-[14px]" : "mb-[9px]"}`}>
        <div>
          {showTitle ? (
            <>
              <p className="mb-[3px] text-[8px] font-bold uppercase tracking-[0.27em] text-[#1592a7]">
                The people behind the stories
              </p>
              <h1 className="text-[39px] font-light leading-[0.95] tracking-[-0.045em] text-[#223943]">
                Meet our editorial team
              </h1>
            </>
          ) : (
            <div className="flex items-center gap-[10px]">
              <div className="h-[2px] w-[54px] bg-[#42c2cc]" />
              <p className="text-[8px] font-bold uppercase tracking-[0.24em] text-[#1592a7]">
                Meet our editorial team
              </p>
            </div>
          )}
        </div>
        <img
          src={resolveRepositoryRootAssetUrl("/images/brand/rare-revolution-trademark-logo.png")}
          alt="RARE Revolution Magazine"
          draggable={false}
          className="h-auto w-[170px] object-contain object-right"
        />
      </header>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden border-b border-[#a9d8dd] shadow-[0_12px_32px_rgba(23,56,75,0.08)]">
        {members.map((member) => (
          <EditorialTeamCard key={member.name} member={member} />
        ))}
      </div>

      <footer className="mt-[10px] flex items-center justify-between text-[7px] uppercase tracking-[0.16em] text-[#5e7d8d]">
        <span>RARE Revolution Magazine</span>
      </footer>
    </div>
  </div>
);

export const EditorialTeamPage86Layout = () => (
  <EditorialTeamPage
    members={editorialTeamMembers.slice(0, 3)}
    pageLabel="86"
    showTitle
  />
);

export const EditorialTeamPage87Layout = () => (
  <EditorialTeamPage
    members={editorialTeamMembers.slice(3, 6)}
    pageLabel="87"
  />
);



const InsightLink = ({
  title,
  copy,
  inverse = false,
}: {
  title: string;
  copy?: string;
  inverse?: boolean;
}) => (
  <button
    type="button"
    className="group block w-full border-0 bg-transparent p-0 text-left focus:outline-none"
    aria-label={`${title} — section destination will be connected as the magazine expands`}
  >
    <span
      className={`block text-[16px] font-semibold leading-[1.08] tracking-[-0.025em] transition-opacity group-hover:opacity-65 ${
        inverse ? "text-white" : "text-[#17384b]"
      }`}
    >
      {title}
    </span>
    {copy ? (
      <span
        className={`mt-1.5 block max-w-[310px] text-[8.8px] leading-[1.42] ${
          inverse ? "text-white/68" : "text-[#61717b]"
        }`}
      >
        {copy}
      </span>
    ) : null}
  </button>
);

const InsightsPageNumber = ({
  page,
  inverse = false,
}: {
  page: number;
  inverse?: boolean;
}) => (
  <span
    className={`absolute bottom-[22px] text-[8px] font-semibold tracking-[0.2em] ${
      page % 2 === 0 ? "left-[38px]" : "right-[38px]"
    } ${inverse ? "text-white/55" : "text-[#17384b]/55"}`}
  >
    {page}
  </span>
);

const ReservedInsightsPage = ({ page }: { page: number }) => (
  <div className="relative h-full w-full overflow-hidden bg-[#fbfaf7]">
  </div>
);

export const RareInsightsPage92Layout = () => <ReservedInsightsPage page={92} />;
export const RareInsightsPage93Layout = () => <ReservedInsightsPage page={93} />;
export const RareInsightsPage94Layout = () => <ReservedInsightsPage page={94} />;
export const RareInsightsPage95Layout = () => <ReservedInsightsPage page={95} />;

export const ADayInLifeIntroLayout = () => (
  <div className="relative h-full w-full overflow-hidden bg-[#f5fafc] text-[#17384b]">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_18%,rgba(43,155,192,0.18),transparent_34%),radial-gradient(circle_at_86%_82%,rgba(23,56,75,0.13),transparent_38%),linear-gradient(180deg,#ffffff_0%,#eef7fa_100%)]" />
    <div className="relative flex h-full flex-col px-[44px] pb-[38px] pt-[38px]">
      <img
        src={resolveRepositoryRootAssetUrl("/images/brand/rare-revolution-trademark-logo.png")}
        alt="RARE Revolution Magazine"
        className="mb-8 h-auto w-[330px] object-contain object-left"
        draggable={false}
      />
      <p className="mb-3 text-[9px] font-bold uppercase tracking-[0.3em] text-[#2b9bc0]">
        Rare insights
      </p>
      <h1 className="max-w-[390px] text-[47px] font-light leading-[0.94] tracking-[-0.045em] text-[#222d33]">
        A Day in<br />the Life
      </h1>
      <div
        aria-hidden="true"
        className="my-6 h-[3px] w-[116px] shrink-0 bg-[#2b9bc0]"
      />
      <p className="mb-5 max-w-[378px] text-[18px] font-medium leading-[1.25] text-[#263b45]">
        Everyday life, told by the people living it.
      </p>
      <div className="max-w-[380px] space-y-3 text-[11.5px] leading-[1.42] text-[#315064]">
        <p>
          First-person accounts from people living with rare conditions, family members,
          caregivers, advocates and professionals.
        </p>
        <p>
          These personal accounts bring the realities of rare disease into sharper focus,
          exploring how diagnosis, treatment and uncertainty can shape everyday routines,
          relationships, careers, education, independence and identity. They reveal the practical
          challenges, difficult decisions, unexpected adaptations and meaningful moments that
          clinical descriptions often leave out.
        </p>
        <p>
          By centering the voices of those directly affected, <em>A Day in the Life</em> shows the
          person beyond the condition and the full life surrounding it. Each story offers an honest
          perspective on what it means to navigate the rare disease experience—not only as a
          patient, but also as a family member, caregiver, colleague, advocate or professional.
        </p>
        <p>
          Together, these stories move beyond awareness to build understanding, challenge
          assumptions and place the human experience at the forefront.
        </p>
      </div>
      <div className="mt-auto flex items-center gap-3 pt-5">
        <div className="h-px flex-1 bg-[#d5e7ed]" />
        <span className="text-[8px] font-semibold uppercase tracking-[0.22em] text-[#2b9bc0]">
          RARE Revolution Magazine
        </span>
      </div>
    </div>
  </div>
);

export 
// Shared archive-card geometry for every series archive except Editors’ Letters (page 103).
// Keep these dimensions centralized so future archive pages use the same card standard.
const SERIES_ARCHIVE_GRID_CLASS = "grid grid-cols-2 gap-4 pb-8";
const SERIES_ARCHIVE_CARD_CLASS =
  "group flex h-[250px] min-h-[250px] max-h-[250px] flex-col overflow-hidden rounded-[10px] border bg-white no-underline shadow-[0_2px_10px_rgba(20,60,75,0.07)] transition-transform hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2";
const SERIES_ARCHIVE_IMAGE_FRAME_CLASS =
  "flex h-[170px] min-h-[170px] max-h-[170px] shrink-0 items-center justify-center overflow-hidden p-1";
const SERIES_ARCHIVE_IMAGE_CLASS =
  "h-full w-full object-contain scale-[1.08]";
const SERIES_ARCHIVE_BODY_CLASS =
  "flex h-[80px] min-h-[80px] max-h-[80px] flex-col overflow-hidden px-3 pb-3 pt-2.5";

const ADayInLifeScrollLayout = () => (
  <div className="relative flex h-full w-full flex-col overflow-hidden bg-[#f4f9fb] text-[#17384b]">
    <style>{`
      .day-life-scroll {
        scrollbar-width: thin;
        scrollbar-color: #2b9bc0 #e6f0f3;
      }
      .day-life-scroll::-webkit-scrollbar {
        width: 8px;
      }
      .day-life-scroll::-webkit-scrollbar-track {
        background: #e6f0f3;
        border-radius: 999px;
      }
      .day-life-scroll::-webkit-scrollbar-thumb {
        background: #2b9bc0;
        border: 2px solid #e6f0f3;
        border-radius: 999px;
      }
      .day-life-scroll::-webkit-scrollbar-thumb:hover {
        background: #207f9f;
      }
    `}</style>

    <div className="shrink-0 border-b border-[#d5e7ed] bg-white px-8 pb-5 pt-7">
      <p className="mb-1 text-[9px] font-bold uppercase tracking-[0.27em] text-[#2b9bc0]">
        A Day in the Life
      </p>
      <h2 className="text-[28px] font-light leading-none tracking-[-0.035em] text-[#222d33]">
        Explore the series
      </h2>
      <p className="mt-2 text-[11px] text-[#54707d]">
        {A_DAY_IN_LIFE_ITEMS.length} personal perspectives from everyday rare life
      </p>
    </div>

    <div
      className="day-life-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5"
      onWheel={(event) => event.stopPropagation()}
      onTouchMove={(event) => event.stopPropagation()}
      aria-label="Scrollable gallery of A Day in the Life articles"
    >
      <div className={SERIES_ARCHIVE_GRID_CLASS}>
        {A_DAY_IN_LIFE_ITEMS.map((item, index) => (
          <a
            key={item.url}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            title={item.title}
            aria-label={`Open ${item.title} in a new tab`}
            className={`${SERIES_ARCHIVE_CARD_CLASS} border-[#d5e7ed] bg-white no-underline shadow-[0_2px_10px_rgba(20,60,75,0.07)] transition-transform hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2b9bc0]`}
          >
            <div className={`${SERIES_ARCHIVE_IMAGE_FRAME_CLASS} bg-[#edf4f6] p-1`}>
              <img
                src={item.image}
                alt=""
                className={SERIES_ARCHIVE_IMAGE_CLASS}
                loading={index < 4 ? "eager" : "lazy"}
                draggable={false}
              />
            </div>
            <div className={SERIES_ARCHIVE_BODY_CLASS}>
              <span className="mb-1.5 text-[8px] font-semibold uppercase tracking-[0.12em] text-[#2b9bc0]">
                A Day in the Life
              </span>
              <h3 className="text-[11px] font-semibold leading-[1.28] text-[#203b48]">
                {shortenDayInLifeTitle(item.title)}
              </h3>
            </div>
          </a>
        ))}
      </div>
    </div>
  </div>
);

const CHARITY_ADVOCACY_URL =
  "https://rarerevolutionmagazine.com/category/charity-advocacy/";

const CHARITY_ADVOCACY_ITEMS = [
  {
    url: "https://rarerevolutionmagazine.com/300-million-colours-of-rare-three-patients-and-caregivers-share-their-rare-disease-stories/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2024/05/02122545/PTC-Therapeutics.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/a-day-in-the-life-being-diagnosed-with-fanconi-anaemia-as-a-child-and-as-an-adult-what-are-the-differences/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2024/06/14095921/Kyra-Card.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/a-milestone-moment-the-cpa-research-foundation-hosts-its-first-in-person-retreat/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2025/06/26131320/Camille.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/a-race-against-time/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2021/10/14122511/New-Website-Blog-Image-Cards-26.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/a-rare-find-upcoming-comedy-short-wants-to-create-conversation-around-newborn-screening/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2023/09/28150233/A-Rare-Find-Card.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/a-mothers-journey-to-change-the-medical-landscape-for-sons-rare-disease/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2025/05/21133345/Camille.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/alex-tlc-monthly-research-summaries/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2024/09/12095246/Kyra-Card.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/ableism-can-hurt-your-confidence-learn-to-use-your-voice-to-regain-your-personal-power/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2023/04/10105850/Neuromuscular-Card-Image-.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/an-advocates-fight-across-the-finish-line-learning-to-live-with-multiple-rare-conditions-and-the-trauma-of-the-boston-marathon-bombing/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2024/05/02122542/LATAM-9.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/angel-aid-unveils-raregivers-global-mental-health-initiative-for-caregivers-patients-and-professionals/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2022/07/12184735/New-Website-Blog-Image-Cards-400-x-400-px-4.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/aortic-hope-connecting-hearts-one-beat-at-a-time/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2026/06/04164247/Aortic-Hope.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/applications-open-for-duchenne-patient-academy-2021/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2021/10/18132219/New-Website-Blog-Image-Cards-7-2.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/are-we-there-yet-designing-communication-initiatives-based-on-community-needs-the-comms-working-group-at-sma-europe/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2023/03/08162237/TECH-RARE-MEME-1.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/awareness-to-innovation-sophies-hope-foundation-paves-the-way-for-gsd1b-research/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2026/01/20125353/Sophies-Hope.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/beyond-the-platelet-count-the-lifelong-burden-of-immune-thrombocytopenia/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2026/06/15114014/ITP1-.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/bridging-gaps-in-care-how-independent-charitable-patient-assistance-organisations-support-underserved-populations/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2024/07/10092328/Accessia-Health.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/building-a-global-patient-registry-for-a-rare-disease-the-story-of-the-inpdr/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2025/05/27120503/indpr.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/celebrating-a-year-of-mental-health-support-for-men-affected-by-rare-conditions/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2021/10/08161435/2-1.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/cmt-research-foundation-fighting-to-shorten-the-time-to-diagnosis-and-put-cmt-on-the-radar-of-pharma/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2021/10/14151735/New-Website-Blog-Image-Cards-2-6.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/celebrating-the-incredible-work-of-nurses-for-international-nurses-day/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2025/05/09163031/HBA-Support.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/cmt-uk-awareness/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2021/10/22111139/New-Website-Blog-Image-Cards-400-x-400-px.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/connie-montgomerys-late-diagnosis-with-two-rare-diseases-factor-vii-deficiency-and-pemphigus-vulgaris/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2024/05/02122541/LATAM-8.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/creld1-warriors-bringing-the-scientific-and-parent-community-together/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2024/05/02122539/LATAM-7.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/davis-out-of-the-unknown-a-familys-life-with-koolen-de-vries-syndrome-and-their-search-for-treatment/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2024/05/02122543/LATAM-10.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/dee-and-nadias-journey-with-kawasaki-disease/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2024/05/02122536/LATAM-5.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/do-you-work-for-a-compassionate-employer/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2024/05/02122538/LATAM-6.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/duchennecan-celebrating-what-people-with-duchenne-can-achieve/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2022/12/05104750/New-Website-Blog-Image-Cards-400-x-400-px.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/fahr-better-to-know/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2026/01/01165035/csecho.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/exploring-the-impact-of-wish-granting-in-paediatric-care/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2026/05/22110917/DI.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/equal-stakeholders-how-fesca-is-preparing-patient-advocates-to-reshape-scleroderma-research/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2026/06/05091519/FESCA-2.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/fighting-for-jackson-a-mothers-journey-to-empower-families-living-with-angelman-syndrome/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2025/06/27125411/asf.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/for-george-the-mva-society/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2024/10/24100223/MVA.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/from-a-moment-to-momentum-why-undiagnosed-day-2026-is-shaping-what-happens-next/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2026/04/23130410/wf.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/from-silence-to-support-the-journey-of-cs-echo-and-cowden-syndrome/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2025/11/27104502/csecho.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/gaci-global-circulating-hope-for-families-affected-by-a-rare-genetic-disease-that-primarily-affects-the-circulatory-system/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2023/04/28165733/TECH-RARE-MEME.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/glasgow-childrens-hospital-charity-flying-the-flag-for-rare-disease-families-year-round/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2024/02/27123950/MSUK-Card.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/global-commission-progresses-technology-health-pilots-to-accelerate-time-to-diagnosis-for-children-with-a-rare-disease/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2021/10/13155805/New-Website-Blog-Image-Cards-12.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/glut1ds-charity-launched/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2021/11/12163911/New-Website-Blog-Image-Cards-400-x-400-px-1-1.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/global-genes-and-cure-jm-foundation-expanding-mental-health-support-for-the-rare-disease-community/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2024/05/02122534/LATAM-3.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/governing-with-purpose-how-to-lead-a-brilliant-board-a-guide-for-charity-trustees/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2022/09/26111735/New-Website-Blog-Image-Cards-400-x-400-px-6.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/hadid-and-i-and-me/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2025/06/27110320/indpr.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/haemochromatosis-uk-helps-thousands-with-life-threatening-genetic-condition-to-be-diagnosed-through-postal-health-kits/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2024/08/28123739/HaemoUK.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/hear-the-unheard-for-world-scleroderma-day-2026/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2026/06/05095043/FESCA-1.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/hope-on-the-horizon-celebrating-two-tears-of-hereditary-brain-aneurysm-support-and-a-bright-future-ahead/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2024/09/10115418/HBA-Support.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/huntingtons-disease-hd-was-not-part-of-my-plans-but-it-sure-has-a-plan-for-me/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2024/05/14113652/Jenna-Card.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/i-stay-home-for-rare-financial-assistance-campaign-launched-by-living-in-the-light/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2021/10/14114616/New-Website-Blog-Image-Cards-24.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/kawasaki-disease-uk/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2021/10/14115651/New-Website-Blog-Image-Cards-25.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/immunocompromised-association-kicks-off-2025-with-safety-and-fun-with-its-inaugural-virtual-new-years-eve-ball-drop/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2025/02/12163945/IA-1.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/join-the-movement-championing-care-for-rare-musculoskeletal-conditions/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2024/10/08110705/Tin-Soldiers-Card.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/lets-play-fair-disability-charity-scope-launches-accessible-play-campaign-which-demands-that-every-child-has-an-equal-right-to-play/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2022/06/06173302/New-Website-Blog-Image-Cards-400-x-400-px-1-1.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/lil-brave-one-from-serbia-empowering-scientific-and-patient-networks-in-the-field-of-rare-neurotransmitter-disorders/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2025/02/26101212/lbo.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/living-with-muscular-dystrophy-in-nepal/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2021/12/10140337/Untitled-design-1.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/local-charity-thanks-the-north-east-for-the-gift-of-time/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2021/10/13165735/rki2ngvi-400x400-1.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/making-sense-of-the-headlines-empowered-and-informed-treatment-choice-in-haemophilia/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2021/10/13151339/New-Website-Blog-Image-Cards-7-1.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/making-a-difference-in-the-world-as-someone-with-a-rare-condition/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2025/08/20123341/Steven.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/married-on-a-mountain-with-a-collapsed-lung/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2022/06/16145513/New-Website-Blog-Image-Cards-400-x-400-px-5.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/maryland-governor-proclaims-june-11-is-kbg-syndrome-awareness-day/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2022/06/06130748/New-Website-Blog-Image-Cards-400-x-400-px-3.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/my-journey-with-multiple-sclerosis-and-advocacy/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2021/10/11111311/New-Website-Blog-Image-Cards-1.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/mitochondrial-disease-awareness-week-lets-move-the-needle-towards-effective-treatments-and-cures/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2023/09/02123304/LATAM-11.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/my-little-lockdown-life-created-by-kate-read-rebecca-atkinson/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2021/10/13155429/New-Website-Blog-Image-Cards-11.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/national-charity-mps-society-encourages-the-public-to-spread-awareness-about-rare-genetic-disease/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2022/04/04135931/New-Website-Blog-Image-Cards-400-x-400-px-13.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/nf1-breast-cancer-awareness-campaign-andreas-story/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2024/10/08133041/AKF-Card-3.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/nf1-breast-cancer-awareness-campaign-jodies-story/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2024/10/08133042/AKF-Card-5.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/nf1-breast-cancer-awareness-campaign-katrina-plunkett-empowers-young-women-with-nf1-to-prioritise-breast-health/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2024/10/08133039/AKF-Card-2.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/nf1-breast-cancer-awareness-campaign-leading-nf1-expert-professor-gareth-evans-calls-for-earlier-screening/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2024/10/08133823/AKF-Card-4.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/nystagmus-awareness-day-20-june-2020/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2021/10/13163927/New-Website-Blog-Image-Cards-17.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/nf1-breast-cancer-awareness-campaign-sharons-story/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2024/10/08133043/AKF-Card-1.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/ptc-therapeutics-2020-strive-awards-for-duchenne-muscular-dystrophy-recognise-four-patient-advocacy-organisations/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2021/10/14150057/New-Website-Blog-Image-Cards-30.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/personal-circumstances-lead-the-way-to-a-passionate-career-in-nephrology-research/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2021/10/11164129/New-Website-Blog-Image-Cards-4-1.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/one-in-a-million/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2024/02/14113431/A-Rare-Find-Card.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/rare-disease-knows-no-borders-eurordis-rare-diseases-europe-and-us-based-everylife-foundation-for-rare-diseases-team-up-against-the-global-public-health-crisis-of-rare-disease/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2023/03/24161650/Eurordis-and-Everylife.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/rare-disease-awareness-day-calendar/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2024/02/02122835/LATAM-1.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/scottish-based-liver-charity-pbc-foundation-celebrates-success-of-its-first-global-online-event/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2021/10/14150631/New-Website-Blog-Image-Cards-1-4.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/rare-diseases-organization-nepal-holds-inaugural-meeting-to-formalise-its-mission-vision-values-and-main-objectives/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2022/05/20163116/New-Website-Blog-Image-Cards-400-x-400-px-5.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/rare-but-strong-turning-a-diagnosis-into-a-community/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2026/04/17092137/tars.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/sma-europe-unites-international-voices-in-the-new-documentary-one-community-shared-dreams/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2024/08/19101356/SMA-Europe.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/shining-a-light-on-smith-magenis-syndrome/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2024/05/02122535/LATAM-4.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/supercharging-advocacy-in-latin-america-for-hirschsprungs-disease-and-anorectal-malformation/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2024/05/02122531/LATAM.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/teach-rare-a-familys-rare-disease-journey-continues-by-supporting-caregivers-with-special-education-teaching-and-learning/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2023/03/02101152/TECH-RARE-MEME.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/the-albinism-fellowship-uk-and-ireland-are-proud-to-support-a-campaign-to-end-discrimination-within-international-blind-sport/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2021/10/14125833/New-Website-Blog-Image-Cards-29.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/the-heart-of-ppa2-building-a-global-community-of-hope-and-advocacy/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2025/03/27101532/A-Rare-Find-Card.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/the-incalculable-costs-of-rare-diseases-for-individuals-families-and-society/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2023/03/29153736/TECH-RARE-MEME-2.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/the-rare-disease-foundation-journey/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2025/06/23093500/Mason.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/the-signs-of-neurofibromatosis/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2025/05/14131910/CTT-small-card-interactive-pdf.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/the-silent-crisis-in-our-community-why-amyloidosis-awareness-matters-now/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2026/04/03135323/FTG.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/the-vascular-birthmarks-foundation-dr-giacomo-colletti-laserplast-and-candela-collaborate-to-provide-pro-bono-laser-treatments/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2022/03/10131144/New-Website-Blog-Image-Cards-400-x-400-px-5.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/thoughts-into-action-what-is-quality-of-life-as-defined-by-people-living-with-inherited-metabolic-disorders/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2023/11/16103651/MSUK-Card.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/to-the-ends-of-the-earth-a-journey-for-addisons-disease-awareness/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2025/10/07092536/Camille.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/transforming-patient-support-for-people-living-with-rare-diseases/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2025/09/02143323/Tiara.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/venture-philanthropy-in-rare-disease-lessons-from-the-frontlines/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2025/03/26155029/will-sm.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/welcome-new-boost-for-mums-and-dads-of-young-children-with-albinism/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2021/10/13165019/New-Website-Blog-Image-Cards-18.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/walking-together-for-cpa-awareness-day/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2026/05/28140132/cpa.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/why-care-for-carers/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2021/10/11105334/New-Website-Blog-Image-Cards.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/why-microcephaly-must-be-included-in-global-rare-disease-agendas-africas-perspective/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2026/03/23101515/CBL.png"
  }
] as const;

const charityAdvocacyTitleFromUrl = (url: string) => {
  const slug = url.replace(/\/$/, "").split("/").pop() || "Charity & advocacy";
  return slug
    .split("-")
    .filter(Boolean)
    .map((word) => {
      const lower = word.toLowerCase();
      if (["and", "the", "of", "to", "for", "in", "on", "with", "a", "an"].includes(lower)) {
        return lower;
      }
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(" ")
    .replace(/^./, (character) => character.toUpperCase());
};

const CharityAdvocacyIntroLayout = () => (
  <div className="relative h-full w-full overflow-hidden bg-[#f8fbfc] text-[#17384b]">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(48,176,190,0.16),transparent_34%),radial-gradient(circle_at_88%_82%,rgba(48,176,190,0.18),transparent_36%),linear-gradient(180deg,#ffffff_0%,#f4fafb_100%)]" />
    <div className="relative flex h-full flex-col px-[44px] pb-[38px] pt-[38px]">
      <img
        src={resolveRepositoryRootAssetUrl("/images/brand/rare-revolution-trademark-logo.png")}
        alt="RARE Revolution Magazine"
        className="mb-8 h-auto w-[330px] object-contain object-left"
        draggable={false}
      />
      <p className="mb-3 text-[9px] font-bold uppercase tracking-[0.3em] text-[#30b0be]">
        Rare insights
      </p>
      <h1 className="max-w-[390px] text-[47px] font-light leading-[0.94] tracking-[-0.045em] text-[#222d33]">
        Charity &amp;<br />Advocacy
      </h1>
      <div className="my-6 h-[3px] w-[116px] bg-[#30b0be]" />
      <p className="mb-5 max-w-[378px] text-[18px] font-medium leading-[1.25] text-[#263b45]">
        The people and organisations turning lived experience into action.
      </p>
      <div className="max-w-[380px] space-y-3 text-[12.5px] leading-[1.48] text-[#315064]">
        <p>
          This series celebrates charities, campaigners and community leaders working to improve
          diagnosis, care, research, inclusion and everyday life across the rare-disease community.
        </p>
        <p>
          From grassroots projects to national campaigns, these stories show how advocacy creates
          practical change, amplifies overlooked voices and connects families with the support they
          need.
        </p>
        <p>
          Explore the archive to discover the organisations, ideas and people helping rare
          communities move forward.
        </p>
      </div>
      <div className="mt-auto flex items-center gap-3 pt-5">
        <div className="h-px flex-1 bg-[#d8e7ea]" />
        <span className="text-[8px] font-semibold uppercase tracking-[0.22em] text-[#30b0be]">
          RARE Revolution Magazine
        </span>
      </div>
    </div>
  </div>
);

const CharityAdvocacyArchiveLayout = () => (
  <div className="relative flex h-full w-full flex-col overflow-hidden bg-[#f6fafb] text-[#17384b]">
    <style>{`
      .charity-advocacy-scroll {
        scrollbar-width: thin;
        scrollbar-color: #30b0be #e9f0f2;
      }
      .charity-advocacy-scroll::-webkit-scrollbar {
        width: 8px;
      }
      .charity-advocacy-scroll::-webkit-scrollbar-track {
        background: #e9f0f2;
        border-radius: 999px;
      }
      .charity-advocacy-scroll::-webkit-scrollbar-thumb {
        background: #30b0be;
        border: 2px solid #e9f0f2;
        border-radius: 999px;
      }
    `}</style>

    <div className="shrink-0 border-b border-[#d8e7ea] bg-white px-8 pb-5 pt-7">
      <p className="mb-1 text-[9px] font-bold uppercase tracking-[0.27em] text-[#30b0be]">
        Charity &amp; Advocacy
      </p>
      <h2 className="text-[28px] font-light leading-none tracking-[-0.035em] text-[#222d33]">
        Explore the series
      </h2>
      <p className="mt-2 text-[11px] text-[#54707d]">
        {CHARITY_ADVOCACY_ITEMS.length} stories of action, connection and change
      </p>
    </div>

    <div
      className="charity-advocacy-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5"
      onWheel={(event) => event.stopPropagation()}
      onTouchMove={(event) => event.stopPropagation()}
      aria-label="Scrollable Charity and Advocacy article archive"
    >
      <div className={SERIES_ARCHIVE_GRID_CLASS}>
        {CHARITY_ADVOCACY_ITEMS.map((item, index) => {
          const title = charityAdvocacyTitleFromUrl(item.url);

          return (
            <a
              key={item.url}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              title={title}
              aria-label={`Open ${title} in a new tab`}
              className={`${SERIES_ARCHIVE_CARD_CLASS} border-[#d7e7e9] bg-white no-underline shadow-[0_2px_10px_rgba(20,60,75,0.07)] transition-transform hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#30b0be]`}
            >
              <div className={`${SERIES_ARCHIVE_IMAGE_FRAME_CLASS} bg-[#eef3f4] p-2`}>
                <img
                  src={item.image}
                  alt=""
                  className={SERIES_ARCHIVE_IMAGE_CLASS}
                  loading={index < 4 ? "eager" : "lazy"}
                  draggable={false}
                />
              </div>
              <div className={SERIES_ARCHIVE_BODY_CLASS}>
                <span className="mb-1.5 text-[8px] font-semibold uppercase tracking-[0.12em] text-[#30b0be]">
                  Charity &amp; Advocacy
                </span>
                <h3 className="text-[11px] font-semibold leading-[1.28] text-[#203b48]">
                  {title}
                </h3>
              </div>
            </a>
          );
        })}
      </div>

      <a
        href={CHARITY_ADVOCACY_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="mx-auto mb-8 flex w-fit rounded-full bg-[#17384b] px-5 py-2.5 text-[9px] font-bold uppercase tracking-[0.14em] text-white no-underline transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#30b0be]"
      >
        Open full archive
      </a>
    </div>
  </div>
);


const INDUSTRY_INSIGHTS_URL =
  "https://rarerevolutionmagazine.com/category/industry-insights/";

const INDUSTRY_INSIGHTS_ITEMS = [
  {
    url: "https://rarerevolutionmagazine.com/as-we-enter-a-new-financial-year-how-does-the-uk-budget-affect-the-rare-disease-community/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2024/04/29142725/Industry-Insights-Group.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/a-tough-year/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2024/01/29142137/Industry-Insights-Nicola.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/cell-and-gene-therapies-where-are-we-now/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2024/01/29142137/Industry-Insights-Nicola.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/chris-cammack-ashfield-medcomms/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2022/02/03144524/Chris-Card.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/covid-three-years-on-what-has-changed/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2023/02/29140355/Industry-Insights-Michelle.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/developing-positive-change-in-how-we-diagnose-treat-and-care-for-patients-with-a-rare-disease-rhetoric-or-reality/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2023/02/29140355/Industry-Insights-Michelle.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/finding-investment-for-gene-therapies/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2022/02/03144523/Chris-Card-1.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/expanding-appreciation-for-the-patient-journey/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2024/11/26103103/John-Card.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/early-access-to-medicines-a-picture-is-worth-a-thousand-words/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2024/07/29143044/Industry-Insights-John.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/how-can-ai-amplify-patient-voices-to-improve-rare-disease-communications/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2026/01/21085858/AMic.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/how-do-we-versus-how-should-we-think-about-disease-awareness-activities/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2024/08/29170106/Rebecca-Card-1.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/launching-an-early-access-programme-influencing-factors/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2024/11/26103103/John-Card.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/how-does-industry-better-navigate-the-challenges-in-getting-innovation-into-routine-practice/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2024/01/29142137/Industry-Insights-Nicola.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/listening-to-lead-how-rare-disease-communities-guide-innovation/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2026/04/24105541/Ben.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/living-well-today-how-do-we-make-it-happen-for-the-rare-diseases-community/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2023/02/29140355/Industry-Insights-Michelle.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/living-well-with-a-rare-disease-are-we-really-supporting-our-community-to-achieve-this/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2023/02/29140355/Industry-Insights-Michelle.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/looking-backwards-looking-forwards/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2024/01/29142137/Industry-Insights-Nicola.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/nice-key-developments-in-2024-in-summary/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2024/08/29154837/Sheela-Card.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/nices-highly-specialised-technologies-hst-criteria-a-summary-and-impact-analysis/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2024/08/29154837/Sheela-Card.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/patient-led-research-in-rare-diseases-how-can-we-make-this-a-reality/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2023/02/29140355/Industry-Insights-Michelle.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/putting-patients-first/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2023/02/29140355/Industry-Insights-Michelle.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/rare-disease-day-2024-sheela-upadhyaya-previews-some-of-the-events-taking-place-across-the-world/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2023/03/29141509/Industry-Insights-Sheela.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/real-world-data-in-eaps-makes-sense-for-rare-diseases/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2024/11/26103103/John-Card.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/reasons-to-be-cheerful/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2024/01/29142137/Industry-Insights-Nicola.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/red-tape-is-ruining-the-potential-ofpartnerships-between-patient-groups-andthe-pharmaceutical-industry-its-time-forchange/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2023/03/29141509/Industry-Insights-Sheela.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/the-abpi-code-partnership-events-a-step-towards-better-partnerships/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2023/03/29141509/Industry-Insights-Sheela.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/the-diagnostic-odyssey-how-misdiagnosis-and-indication-broadening-can-undermine-rare-disease-clinical-trials/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2026/04/03112155/tmc.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/the-new-world-of-gene-therapy-five-questions-answered/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2022/02/03144522/Chris-Card-2.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/the-uk-rare-diseases-framework-sheela-upadhyaya-reflects-on-recent-progress-across-the-uk/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2023/03/29141509/Industry-Insights-Sheela.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/uk-report-calls-for-more-government-input-to-make-cell-and-gene-therapies-a-true-health-system-priority/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2024/01/29142137/Industry-Insights-Nicola.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/together4rd-making-ern-industry-collaboration-a-key-pillar-of-the-future-in-the-rare-disease-research-ecosystem/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2023/03/29141509/Industry-Insights-Sheela.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/what-are-the-next-steps-for-rare-disease-innovative-in-the-united-kingdom/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2023/03/29141509/Industry-Insights-Sheela.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/what-can-rare-disease-services-learn-from-oncology-services-a-personal-reflection/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2023/02/29140355/Industry-Insights-Michelle.png"
  }
];

const industryInsightsTitleFromUrl = (url: string) => {
  const slug = url.replace(/\/$/, "").split("/").pop() || "Industry Insights";
  return slug
    .split("-")
    .filter(Boolean)
    .map((word) => {
      const lower = word.toLowerCase();
      if (["and", "the", "of", "to", "for", "in", "on", "with", "a", "an"].includes(lower)) {
        return lower;
      }
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(" ")
    .replace(/^./, (character) => character.toUpperCase());
};

const IndustryInsightsIntroLayout = () => (
  <div className="relative h-full w-full overflow-hidden bg-[#f5fafc] text-[#17384b]">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_18%,rgba(43,155,192,0.18),transparent_34%),radial-gradient(circle_at_86%_82%,rgba(23,56,75,0.13),transparent_38%),linear-gradient(180deg,#ffffff_0%,#eef7fa_100%)]" />
    <div className="relative flex h-full flex-col px-[44px] pb-[38px] pt-[38px]">
      <img
        src={resolveRepositoryRootAssetUrl("/images/brand/rare-revolution-trademark-logo.png")}
        alt="RARE Revolution Magazine"
        className="mb-8 h-auto w-[330px] object-contain object-left"
        draggable={false}
      />
      <p className="mb-3 text-[9px] font-bold uppercase tracking-[0.3em] text-[#2b9bc0]">
        Rare insights
      </p>
      <h1 className="max-w-[390px] text-[47px] font-light leading-[0.94] tracking-[-0.045em] text-[#222d33]">
        Industry<br />Insights
      </h1>
      <div className="my-6 h-[3px] w-[116px] bg-[#2b9bc0]" />
      <p className="mb-5 max-w-[378px] text-[18px] font-medium leading-[1.25] text-[#263b45]">
        Perspectives shaping the future of rare-disease research, access and innovation.
      </p>
      <div className="max-w-[380px] space-y-3 text-[12.5px] leading-[1.48] text-[#315064]">
        <p>
          Industry Insights brings together expert commentary from across biotechnology,
          healthcare, policy, communications and patient engagement.
        </p>
        <p>
          These articles examine the decisions, partnerships and emerging ideas influencing
          diagnosis, treatment development and access for people living with rare conditions.
        </p>
        <p>
          Explore the archive for practical analysis and informed perspectives from leaders
          working across the rare-disease ecosystem.
        </p>
      </div>
      <div className="mt-auto flex items-center gap-3 pt-5">
        <div className="h-px flex-1 bg-[#d5e7ed]" />
        <span className="text-[8px] font-semibold uppercase tracking-[0.22em] text-[#2b9bc0]">
          RARE Revolution Magazine
        </span>
      </div>
    </div>
  </div>
);

const IndustryInsightsArchiveLayout = () => (
  <div className="relative flex h-full w-full flex-col overflow-hidden bg-[#f4f9fb] text-[#17384b]">
    <style>{`
      .industry-insights-scroll {
        scrollbar-width: thin;
        scrollbar-color: #2b9bc0 #e6f0f3;
      }
      .industry-insights-scroll::-webkit-scrollbar {
        width: 8px;
      }
      .industry-insights-scroll::-webkit-scrollbar-track {
        background: #e6f0f3;
        border-radius: 999px;
      }
      .industry-insights-scroll::-webkit-scrollbar-thumb {
        background: #2b9bc0;
        border: 2px solid #e6f0f3;
        border-radius: 999px;
      }
    `}</style>

    <div className="shrink-0 border-b border-[#d5e7ed] bg-white px-8 pb-5 pt-7">
      <p className="mb-1 text-[9px] font-bold uppercase tracking-[0.27em] text-[#2b9bc0]">
        Industry Insights
      </p>
      <h2 className="text-[28px] font-light leading-none tracking-[-0.035em] text-[#222d33]">
        Explore the series
      </h2>
      <p className="mt-2 text-[11px] text-[#54707d]">
        {INDUSTRY_INSIGHTS_ITEMS.length} expert perspectives from across rare disease
      </p>
    </div>

    <div
      className="industry-insights-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5"
      onWheel={(event) => event.stopPropagation()}
      onTouchMove={(event) => event.stopPropagation()}
      aria-label="Scrollable Industry Insights article archive"
    >
      <div className={SERIES_ARCHIVE_GRID_CLASS}>
        {INDUSTRY_INSIGHTS_ITEMS.map((item, index) => {
          const title = industryInsightsTitleFromUrl(item.url);

          return (
            <a
              key={item.url}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              title={title}
              aria-label={`Open ${title} in a new tab`}
              className={`${SERIES_ARCHIVE_CARD_CLASS} border-[#d5e7ed] bg-white no-underline shadow-[0_2px_10px_rgba(20,60,75,0.07)] transition-transform hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2b9bc0]`}
            >
              <div className={`${SERIES_ARCHIVE_IMAGE_FRAME_CLASS} bg-[#edf4f6] p-0`}>
                <img
                  src={item.image}
                  alt=""
                  className={SERIES_ARCHIVE_IMAGE_CLASS}
                  loading={index < 4 ? "eager" : "lazy"}
                  draggable={false}
                />
              </div>
              <div className={SERIES_ARCHIVE_BODY_CLASS}>
                <span className="mb-1.5 text-[8px] font-semibold uppercase tracking-[0.12em] text-[#2b9bc0]">
                  Industry Insights
                </span>
                <h3 className="text-[11px] font-semibold leading-[1.28] text-[#203b48]">
                  {title}
                </h3>
              </div>
            </a>
          );
        })}
      </div>

      <a
        href={INDUSTRY_INSIGHTS_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="mx-auto mb-8 flex w-fit rounded-full bg-[#17384b] px-5 py-2.5 text-[9px] font-bold uppercase tracking-[0.14em] text-white no-underline transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2b9bc0]"
      >
        Open full archive
      </a>
    </div>
  </div>
);



type MedicalArticle = {
  title: string;
  date: string;
  url: string;
  image: string;
};

const MEDICAL_ITEMS: MedicalArticle[] = [
  {
    title: "Immune thrombocytopenia (ITP): an infographic",
    date: "2026-06-15",
    url: "https://rarerevolutionmagazine.com/immune-thrombocytopenia-itp-an-infographic/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2026/06/15105127/Website-Image-Card-400-x-400-px.png"
  },
  {
    title: "Bridging the gap: the landscape and management of haemophilia B in Saudi Arabia",
    date: "2026-05-18",
    url: "https://rarerevolutionmagazine.com/bridging-the-gap-the-landscape-and-management-of-haemophilia-b-in-saudi-arabia/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2026/05/18145615/Jill.png"
  },
  {
    title: "The power of your participation: strengthening data robustness and ethical trial design with natural history studies",
    date: "2026-04-23",
    url: "https://rarerevolutionmagazine.com/the-power-of-your-participation-strengthening-data-robustness-and-ethical-trial-design-with-natural-history-data/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2026/04/23090034/Stephane.png"
  },
  {
    title: "Expediting novel therapies: a roadmap to a bright future for Saudi Arabia’s citizens",
    date: "2026-04-09",
    url: "https://rarerevolutionmagazine.com/expediting-novel-therapies-a-roadmap-to-a-bright-future-for-saudi-arabias-citizens/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2026/04/09105812/Jill.png"
  },
  {
    title: "When medicine lags: how US healthcare falls behind, what it costs us and how to fix it",
    date: "2026-01-14",
    url: "https://rarerevolutionmagazine.com/when-medicine-lags-how-us-healthcare-falls-behind-what-it-costs-us-and-how-to-fix-it/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2026/01/14101228/kaily.png"
  },
  {
    title: "Lessons we can all learn from my first and only patient to date with idiopathic multicentric Castleman disease",
    date: "2025-11-12",
    url: "https://rarerevolutionmagazine.com/lessons-we-can-all-learn-from-my-first-and-only-patient-to-date-with-idiopathic-multicentric-castlemans-disease-imcd/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2025/11/12093455/cd.png"
  }
];

const formatMedicalDate = (date: string) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));

const MedicalIntroLayout = () => (
  <div className="relative h-full w-full overflow-hidden bg-[#f5fafc] text-[#17384b]">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_18%,rgba(43,155,192,0.18),transparent_34%),radial-gradient(circle_at_86%_82%,rgba(23,56,75,0.13),transparent_38%),linear-gradient(180deg,#ffffff_0%,#eef7fa_100%)]" />
    <div className="relative flex h-full flex-col px-[44px] pb-[38px] pt-[38px]">
      <img
        src={resolveRepositoryRootAssetUrl("/images/brand/rare-revolution-trademark-logo.png")}
        alt="RARE Revolution Magazine"
        className="mb-8 h-auto w-[330px] object-contain object-left"
        draggable={false}
      />
      <p className="mb-3 text-[9px] font-bold uppercase tracking-[0.3em] text-[#2b9bc0]">
        Series spread
      </p>
      <h1 className="max-w-[390px] text-[47px] font-light leading-[0.94] tracking-[-0.045em] text-[#222d33]">
        Medical
      </h1>
      <div className="my-6 h-[3px] w-[116px] bg-[#2b9bc0]" />
      <p className="max-w-[410px] text-[14px] leading-[1.65] text-[#54707d]">
        The Medical series explores the clinical, scientific and practical
        realities of rare disease care. It covers diagnosis, genetic and
        laboratory testing, specialist pathways, treatment options, clinical
        trials, research breakthroughs and the development of new therapies.
        Alongside insight from clinicians, researchers and healthcare
        professionals, it also examines symptoms, quality of life, access to
        care, multidisciplinary support and shared decision-making. Each
        article connects complex medical developments with the experiences of
        patients, families and caregivers.
      </p>
      <div className="mt-auto flex items-center gap-3 pt-5">
        <div className="h-px flex-1 bg-[#d5e7ed]" />
        <span className="text-[8px] font-semibold uppercase tracking-[0.22em] text-[#2b9bc0]">
          RARE Revolution Magazine
        </span>
      </div>
    </div>
  </div>
);

const MedicalArchiveLayout = () => (
  <div className="relative flex h-full w-full flex-col overflow-hidden bg-[#f4f9fb] text-[#17384b]">
    <style>{`
      .medical-scroll {
        scrollbar-width: thin;
        scrollbar-color: #2b9bc0 #e6f0f3;
      }
      .medical-scroll::-webkit-scrollbar {
        width: 8px;
      }
      .medical-scroll::-webkit-scrollbar-track {
        background: #e6f0f3;
        border-radius: 999px;
      }
      .medical-scroll::-webkit-scrollbar-thumb {
        background: #2b9bc0;
        border: 2px solid #e6f0f3;
        border-radius: 999px;
      }
      .medical-scroll::-webkit-scrollbar-thumb:hover {
        background: #207f9f;
      }
    `}</style>

    <div className="shrink-0 border-b border-[#d5e7ed] bg-white px-8 pb-5 pt-7">
      <p className="mb-1 text-[9px] font-bold uppercase tracking-[0.27em] text-[#2b9bc0]">
        Medical
      </p>
      <h2 className="text-[28px] font-light leading-none tracking-[-0.035em] text-[#222d33]">
        Explore the series
      </h2>
      <p className="mt-2 text-[11px] text-[#54707d]">
        {MEDICAL_ITEMS.length} recent medical articles
      </p>
    </div>

    <div
      className="medical-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5"
      onWheel={(event) => event.stopPropagation()}
      onTouchMove={(event) => event.stopPropagation()}
      aria-label="Scrollable Medical article archive"
    >
      <div className={SERIES_ARCHIVE_GRID_CLASS}>
        {MEDICAL_ITEMS.map((item, index) => (
          <a
            key={item.url}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            title={item.title}
            aria-label={`Open ${item.title} in a new tab`}
            className={`${SERIES_ARCHIVE_CARD_CLASS} border-[#d5e7ed] bg-white no-underline shadow-[0_2px_10px_rgba(20,60,75,0.07)] transition-transform hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2b9bc0]`}
          >
            <div className={`${SERIES_ARCHIVE_IMAGE_FRAME_CLASS} bg-[#edf4f6] p-1`}>
              <img
                src={item.image}
                alt=""
                className={SERIES_ARCHIVE_IMAGE_CLASS}
                loading={index < 4 ? "eager" : "lazy"}
                draggable={false}
              />
            </div>
            <div className={SERIES_ARCHIVE_BODY_CLASS}>
              <time className="mb-1.5 text-[8px] font-semibold uppercase tracking-[0.12em] text-[#2b9bc0]">
                {formatMedicalDate(item.date)}
              </time>
              <h3 className="text-[11px] font-semibold leading-[1.28] text-[#203b48]">
                {item.title}
              </h3>
            </div>
          </a>
        ))}
      </div>
    </div>
  </div>
);


type NewsPressRelease = {
  title: string;
  date: string;
  url: string;
  image: string;
};

const NEWS_MANIFEST_URL =
  "https://raw.githubusercontent.com/Joliel21/RRM/main/press-releases/manifest.csv";
const NEWS_IMAGE_ROOT =
  "https://raw.githubusercontent.com/Joliel21/RRM/main/press-releases/";

let newsManifestPromise: Promise<NewsPressRelease[]> | null = null;

const parseCsvRows = (csv: string): string[][] => {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;

  for (let index = 0; index < csv.length; index += 1) {
    const character = csv[index];
    const next = csv[index + 1];

    if (character === '"' && quoted && next === '"') {
      field += '"';
      index += 1;
    } else if (character === '"') {
      quoted = !quoted;
    } else if (character === "," && !quoted) {
      row.push(field);
      field = "";
    } else if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && next === "\n") index += 1;
      row.push(field);
      if (row.some((value) => value.trim())) rows.push(row);
      row = [];
      field = "";
    } else {
      field += character;
    }
  }

  if (field.length || row.length) {
    row.push(field);
    if (row.some((value) => value.trim())) rows.push(row);
  }

  return rows;
};

const firstManifestValue = (
  record: Record<string, string>,
  keys: string[],
): string => {
  for (const key of keys) {
    const value = record[key];
    if (value?.trim()) return value.trim();
  }
  return "";
};

const normaliseNewsImage = (value: string): string => {
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) return value;
  const filename = value.split("/").pop() ?? value;
  return `${NEWS_IMAGE_ROOT}${encodeURIComponent(filename)}`;
};

const loadNewsPressReleases = (): Promise<NewsPressRelease[]> => {
  if (newsManifestPromise) return newsManifestPromise;

  newsManifestPromise = fetch(NEWS_MANIFEST_URL)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Unable to load press releases (${response.status})`);
      }
      return response.text();
    })
    .then((csv) => {
      const rows = parseCsvRows(csv);
      if (rows.length < 2) return [];

      const headers = rows[0].map((header) =>
        header.trim().toLowerCase().replace(/[\s-]+/g, "_"),
      );

      return rows
        .slice(1)
        .map((values) => {
          const record = Object.fromEntries(
            headers.map((header, index) => [header, values[index] ?? ""]),
          );

          const title = firstManifestValue(record, [
            "title",
            "post_title",
            "headline",
            "name",
          ]);
          const date = firstManifestValue(record, [
            "date",
            "published",
            "published_date",
            "post_date",
          ]);
          const url = firstManifestValue(record, [
            "url",
            "link",
            "permalink",
            "article_url",
          ]);
          const image = normaliseNewsImage(
            firstManifestValue(record, [
              "image",
              "image_file",
              "filename",
              "file",
              "local_image",
            ]),
          );

          return { title, date, url, image };
        })
        .filter((item) => item.title && item.image)
        .sort((a, b) => {
          const aTime = Date.parse(a.date) || 0;
          const bTime = Date.parse(b.date) || 0;
          return bTime - aTime;
        });
    });

  return newsManifestPromise;
};

const formatNewsDate = (date: string) => {
  const parsed = Date.parse(date);
  if (!parsed) return "Press release";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(parsed));
};

const NewsPressReleasesIntroLayout = () => (
  <div className="relative h-full w-full overflow-hidden bg-[#fff9f5] text-[#442c27]">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_18%,rgba(232,101,67,0.18),transparent_34%),radial-gradient(circle_at_88%_84%,rgba(85,48,40,0.12),transparent_40%),linear-gradient(180deg,#ffffff_0%,#fff3ed_100%)]" />
    <div className="relative flex h-full flex-col px-[44px] pb-[38px] pt-[38px]">
      <img
        src={resolveRepositoryRootAssetUrl("/images/brand/rare-revolution-trademark-logo.png")}
        alt="RARE Revolution Magazine"
        className="mb-8 h-auto w-[330px] object-contain object-left"
        draggable={false}
      />
      <p className="mb-3 text-[9px] font-bold uppercase tracking-[0.3em] text-[#df6848]">
        Series spread
      </p>
      <h1 className="max-w-[420px] text-[43px] font-light leading-[0.94] tracking-[-0.045em] text-[#2d2523]">
        News &amp;<br />Press Releases
      </h1>
      <div className="my-6 h-[3px] w-[116px] bg-[#df6848]" />
      <p className="max-w-[410px] text-[14px] leading-[1.65] text-[#6b514a]">
        News &amp; Press Releases brings together the latest updates from across
        the rare disease community. It includes research announcements,
        clinical trial news, regulatory milestones, funding decisions,
        advocacy campaigns, policy developments, new partnerships and
        organisational updates. The archive also highlights launches, events,
        appointments, awareness initiatives and major industry activity,
        showing what is changing, who is driving that change and why each
        development matters to patients, families, professionals and the wider
        community.
      </p>
      <div className="mt-auto flex items-center gap-3 pt-5">
        <div className="h-px flex-1 bg-[#ead8d1]" />
        <span className="text-[8px] font-semibold uppercase tracking-[0.22em] text-[#df6848]">
          RARE Revolution Magazine
        </span>
      </div>
    </div>
  </div>
);

const NewsArchivePage = ({
  segment,
  label,
}: {
  segment: 0 | 1 | 2;
  label?: string;
}) => {
  const [items, setItems] = useState<NewsPressRelease[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let active = true;
    loadNewsPressReleases()
      .then((loadedItems) => {
        if (active) setItems(loadedItems);
      })
      .catch((error: unknown) => {
        if (active) {
          setLoadError(
            error instanceof Error ? error.message : "Unable to load archive",
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const firstEnd = Math.ceil(items.length * 0.25);
  const secondEnd = firstEnd + Math.ceil(items.length * 0.375);
  const ranges = [
    items.slice(0, firstEnd),
    items.slice(firstEnd, secondEnd),
    items.slice(secondEnd),
  ];
  const visibleItems = ranges[segment];

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-[#fff9f5] text-[#442c27]">
      <style>{`
        .news-archive-scroll {
          scrollbar-width: thin;
          scrollbar-color: #df6848 #f3e4de;
        }
        .news-archive-scroll::-webkit-scrollbar { width: 8px; }
        .news-archive-scroll::-webkit-scrollbar-track {
          background: #f3e4de;
          border-radius: 999px;
        }
        .news-archive-scroll::-webkit-scrollbar-thumb {
          background: #df6848;
          border: 2px solid #f3e4de;
          border-radius: 999px;
        }
      `}</style>

      <div className="shrink-0 border-b border-[#ead8d1] bg-white px-8 pb-5 pt-7">
        <p className="text-[25px] font-light leading-[1.02] tracking-[-0.035em] text-[#2d2523]">
          News &amp; Press Releases
        </p>
        {label && (
          <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.22em] text-[#df6848]">
            {label}
          </p>
        )}
      </div>

      <div
        className="news-archive-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5"
        style={{ direction: segment === 1 ? "rtl" : "ltr" }}
        onWheel={(event) => event.stopPropagation()}
        onTouchMove={(event) => event.stopPropagation()}
        aria-label={`${label} scrollable press-release archive`}
      >
        {loading && (
          <div className="flex h-full items-center justify-center text-[12px] text-[#8a6b62]">
            Loading press releases…
          </div>
        )}
        {loadError && (
          <div className="rounded-lg border border-[#e8c8bd] bg-white p-5 text-[11px] leading-relaxed text-[#855648]">
            {loadError}
          </div>
        )}
        {!loading && !loadError && (
          <div
            className={SERIES_ARCHIVE_GRID_CLASS}
            style={{ direction: "ltr" }}
          >
            {visibleItems.map((item, index) => (
              <a
                key={`${item.image}-${index}`}
                href={item.url || "https://rarerevolutionmagazine.com/category/news/"}
                target="_blank"
                rel="noopener noreferrer"
                title={item.title}
                aria-label={`Open ${item.title} in a new tab`}
                className={`${SERIES_ARCHIVE_CARD_CLASS} border-[#ead8d1] bg-white no-underline shadow-[0_2px_10px_rgba(75,42,32,0.07)] transition-transform hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#df6848]`}
              >
                <div className={`${SERIES_ARCHIVE_IMAGE_FRAME_CLASS} bg-[#f7eeea] p-1`}>
                  <img
                    src={item.image}
                    alt=""
                    className={SERIES_ARCHIVE_IMAGE_CLASS}
                    loading={index < 4 ? "eager" : "lazy"}
                    draggable={false}
                  />
                </div>
                <div className={SERIES_ARCHIVE_BODY_CLASS}>
                  <time className="mb-1.5 text-[8px] font-semibold uppercase tracking-[0.12em] text-[#df6848]">
                    {formatNewsDate(item.date)}
                  </time>
                  <h3 className="text-[11px] font-semibold leading-[1.28] text-[#4d332d]">
                    {item.title}
                  </h3>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const NewsPressReleasesQuarterLayout = () => (
  <NewsArchivePage segment={0} label="Latest releases" />
);
const NewsPressReleasesMiddleLayout = () => (
  <NewsArchivePage segment={1} />
);
const NewsPressReleasesFinalLayout = () => (
  <NewsArchivePage segment={2} />
);

type EditorsLettersArticle = {
  title: string;
  date: string;
  url: string;
  image: string;
};

const EDITORS_LETTERS_ITEMS: EditorsLettersArticle[] = [
  {
    title: "Parkinson’s disease and the silent burden on Black families",
    date: "2026-05-27",
    url: "https://rarerevolutionmagazine.com/parkinsons-disease-and-the-silent-burden-on-black-families/",
    image: "/series/editors-letters/letters-207c9a8c.png"
  },
  {
    title: "Fighting for life and hope",
    date: "2026-05-20",
    url: "https://rarerevolutionmagazine.com/fighting-for-life-and-hope/",
    image: "/series/editors-letters/letters-a38126fd.png"
  },
  {
    title: "The student-led revolution in medical genetics",
    date: "2026-04-24",
    url: "https://rarerevolutionmagazine.com/the-student-led-revolution-in-medical-genetics/",
    image: "/series/editors-letters/letters-1b851603.png"
  },
  {
    title: "Without FDA flexibility for rare diseases our daughter’s future is at risk",
    date: "2025-12-08",
    url: "https://rarerevolutionmagazine.com/without-fda-flexibility-for-rare-diseases-our-daughters-future-is-at-risk/",
    image: "/series/editors-letters/letters-c4c87b04.png"
  },
  {
    title: "The math is anything but encouraging",
    date: "2024-09-12",
    url: "https://rarerevolutionmagazine.com/nonprofit-the-math-is-anything-but-encouraging/",
    image: "/series/editors-letters/letters-f763c084.png"
  },
  {
    title: "A troubling development in access to treatment for people living with primary biliary cholangitis (PBC)",
    date: "2024-08-07",
    url: "https://rarerevolutionmagazine.com/troubling-development-in-access-to-treatment-for-people-living-with-primary-biliary-cholangitis-pbc/",
    image: "/series/editors-letters/letters-e5eaf417.png"
  }
];

const formatEditorsLettersDate = (date: string) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));

const EditorsLettersLeftLayout = () => (
  <div className="relative h-full w-full overflow-hidden bg-[#f5fafc] text-[#17384b]">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_18%,rgba(43,155,192,0.18),transparent_34%),radial-gradient(circle_at_86%_82%,rgba(23,56,75,0.13),transparent_38%),linear-gradient(180deg,#ffffff_0%,#eef7fa_100%)]" />
    <div className="relative flex h-full flex-col px-[44px] pb-[38px] pt-[38px]">
      <img
        src={resolveRepositoryRootAssetUrl("/images/brand/rare-revolution-trademark-logo.png")}
        alt="RARE Revolution Magazine"
        className="mb-8 h-auto w-[330px] object-contain object-left"
        draggable={false}
      />
      <p className="mb-3 text-[9px] font-bold uppercase tracking-[0.3em] text-[#2b9bc0]">
        Rare insights
      </p>
      <h1 className="max-w-[390px] text-[47px] font-light leading-[0.94] tracking-[-0.045em] text-[#222d33]">
        Editors’<br />Letters
      </h1>
      <div className="my-6 h-[3px] w-[116px] bg-[#2b9bc0]" />
      <p className="mb-5 max-w-[378px] text-[18px] font-medium leading-[1.25] text-[#263b45]">
        Letters to the editor.
      </p>
      <div className="max-w-[380px] space-y-3 text-[12.5px] leading-[1.48] text-[#315064]">
        <p>
          Readers, advocates and members of the rare disease community share perspectives on
          care, policy, research, access and lived experience.
        </p>
        <p>
          These letters offer direct, personal responses to the issues shaping rare disease today,
          from treatment access and regulation to equity, awareness and the realities facing
          families.
        </p>
        <p>
          Together, they create space for thoughtful debate, lived expertise and community voices
          that deserve to be heard.
        </p>
      </div>
      <div className="mt-auto flex items-center gap-3 pt-5">
        <div className="h-px flex-1 bg-[#d5e7ed]" />
        <span className="text-[8px] font-semibold uppercase tracking-[0.22em] text-[#2b9bc0]">
          RARE Revolution Magazine
        </span>
      </div>
    </div>
  </div>
);

const EditorsLettersRightLayout = () => (
  <div className="relative flex h-full w-full flex-col overflow-hidden bg-[#f4f9fb] text-[#17384b]">
    <style>{`
      .editors-letters-scroll {
        scrollbar-width: thin;
        scrollbar-color: #2b9bc0 #e6f0f3;
      }
      .editors-letters-scroll::-webkit-scrollbar {
        width: 8px;
      }
      .editors-letters-scroll::-webkit-scrollbar-track {
        background: #e6f0f3;
        border-radius: 999px;
      }
      .editors-letters-scroll::-webkit-scrollbar-thumb {
        background: #2b9bc0;
        border: 2px solid #e6f0f3;
        border-radius: 999px;
      }
      .editors-letters-scroll::-webkit-scrollbar-thumb:hover {
        background: #207f9f;
      }
    `}</style>

    <div className="shrink-0 border-b border-[#d5e7ed] bg-white px-8 pb-5 pt-7">
      <p className="mb-1 text-[9px] font-bold uppercase tracking-[0.27em] text-[#2b9bc0]">
        Editors’ Letters
      </p>
      <h2 className="text-[28px] font-light leading-none tracking-[-0.035em] text-[#222d33]">
        Explore the series
      </h2>
      <p className="mt-2 text-[11px] text-[#54707d]">
        {EDITORS_LETTERS_ITEMS.length} perspectives from across the rare disease community
      </p>
    </div>

    <div
      className="editors-letters-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5"
      onWheel={(event) => event.stopPropagation()}
      onTouchMove={(event) => event.stopPropagation()}
      aria-label="Scrollable Editors’ Letters article archive"
    >
      <div className="grid grid-cols-2 gap-4 pb-8">
        {EDITORS_LETTERS_ITEMS.map((item, index) => (
          <a
            key={item.url}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            title={item.title}
            aria-label={`Open ${item.title} in a new tab`}
            className="group flex min-h-[270px] flex-col overflow-hidden rounded-[10px] border border-[#d5e7ed] bg-white no-underline shadow-[0_2px_10px_rgba(20,60,75,0.07)] transition-transform hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2b9bc0]"
          >
            <div className="flex h-[180px] shrink-0 items-center justify-center overflow-hidden bg-[#edf4f6]">
              <img
                src={item.image}
                alt=""
                className="h-full w-full object-contain scale-[1.22]"
                loading={index < 4 ? "eager" : "lazy"}
                draggable={false}
              />
            </div>
            <div className="flex flex-1 flex-col px-3 pb-3 pt-2.5">
              <time className="mb-1.5 text-[8px] font-semibold uppercase tracking-[0.12em] text-[#2b9bc0]">
                {formatEditorsLettersDate(item.date)}
              </time>
              <h3 className="text-[11px] font-semibold leading-[1.28] text-[#203b48]">
                {item.title}
              </h3>
            </div>
          </a>
        ))}
      </div>
    </div>
  </div>
);

const BREATHTAKING_AWARENESS_AD: Record<string, string> = {};

export const BreathtakingAwarenessAdLayout = ({
  page,
  blocks,
}: PageLayoutProps) => {
  const adConfig = (blocks || []).find((block: any) => block.type === "ad-config") as any;
  const adContent = {
    ...BREATHTAKING_AWARENESS_AD,
    ...(adConfig || {}),
  };
  const isRightPage = page.pageNumber % 2 !== 0;
  const edgePadding = isRightPage
    ? { paddingLeft: "58px", paddingRight: "46px" }
    : { paddingLeft: "46px", paddingRight: "58px" };

  return (
    <div className="relative h-[660px] w-[480px] overflow-hidden bg-[#021A2B] text-[var(--brand-surface)] select-none">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 82% 18%, rgba(43,155,192,0.23), transparent 31%), radial-gradient(circle at 16% 78%, rgba(201,164,92,0.18), transparent 34%), linear-gradient(160deg, #01101C 0%, #021A2B 52%, #082B3A 100%)",
        }}
      />

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-[36px] top-[36px] right-[36px] bottom-[36px] border border-[var(--brand-border)]/35" />
        <div className="absolute left-[54px] top-[58px] h-[1px] w-[130px] bg-[var(--brand-border)]/70" />
        <div className="absolute right-[54px] top-[84px] h-[1px] w-[88px] bg-[#2B9BC0]/70" />
        <div className="absolute -right-[118px] top-[-110px] h-[290px] w-[290px] rounded-full border border-[#2B9BC0]/22" />
        <div className="absolute -left-[134px] bottom-[-128px] h-[316px] w-[316px] rounded-full border border-[var(--brand-border)]/18" />
        <div className="absolute bottom-[86px] right-[-42px] h-[1px] w-[252px] rotate-[-32deg] bg-[var(--brand-border)]/55" />
      </div>

      <div
        className="relative z-10 flex h-full flex-col justify-between py-[58px]"
        style={edgePadding}
      >
        <div>
          <p
            className="uppercase mb-8"
            style={{
              fontFamily:
                "Inter, Avenir Next, Helvetica Neue, Arial, sans-serif",
              fontSize: "9pt",
              lineHeight: 1.2,
              letterSpacing: "0.28em",
              color: "var(--brand-border)",
            }}
          >
            {adContent.eyebrow || adContent.title}
          </p>

          <h1
            className="mb-7"
            style={{
              fontFamily: "var(--font-serif-primary)",
              fontSize: "43pt",
              lineHeight: 0.9,
              fontWeight: 700,
              letterSpacing: "-0.035em",
              color: "var(--brand-surface)",
            }}
          >
            {adContent.headline}
          </h1>

          <div className="h-[2px] w-[136px] bg-[#2B9BC0] mb-7" />

          <p
            className="max-w-[350px] mb-7"
            style={{
              fontFamily:
                "Inter, Avenir Next, Helvetica Neue, Arial, sans-serif",
              fontSize: "17pt",
              lineHeight: 1.24,
              fontWeight: 300,
              color: "#F3E8D3",
            }}
          >
            {adContent.subheadline}
          </p>
        </div>

        <div>
          <a
            href={adContent.buttonUrl || adContent.signupUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex rounded-full border border-[#2B9BC0]/85 bg-[#2B9BC0]/20 px-8 py-4 uppercase no-underline transition-opacity hover:opacity-85 focus:outline-none focus:ring-2 focus:ring-[var(--brand-border)]/70"
            style={{
              fontFamily:
                "Inter, Avenir Next, Helvetica Neue, Arial, sans-serif",
              fontSize: "13pt",
              letterSpacing: "0.16em",
              fontWeight: 700,
              color: "var(--brand-surface)",
            }}
          >
            {adContent.buttonText || adContent.signupLabel}
          </a>

          <p
            className="mt-5 uppercase"
            style={{
              fontFamily:
                "Inter, Avenir Next, Helvetica Neue, Arial, sans-serif",
              fontSize: "7.5pt",
              lineHeight: 1.2,
              letterSpacing: "0.18em",
              color: "rgba(201,164,92,0.9)",
            }}
          >
            {adContent.footer}
          </p>
        </div>
      </div>
    </div>
  );
};



const patientVoiceItems = [
  {
    url: "https://rarerevolutionmagazine.com/when-hope-changes-living-with-drug-resistant-epilepsy/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2026/07/16095505/Copy-of-Social-Media-Tiles-2025-819x1024.png",
  },
  {
    url: "https://rarerevolutionmagazine.com/beyond-the-diagnosis-rights-access-and-everyday-realities/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2026/06/02164645/Website-Wide-Card-1650-x-620-px-3-1024x385.png",
  },
  {
    url: "https://rarerevolutionmagazine.com/sma-why-adult-support-must-keep-up-with-medical-progress/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2026/07/09070234/SMA-Finland-1024x385.png",
  },
  {
    url: "https://rarerevolutionmagazine.com/the-invisible-struggle-charting-the-complex-reality-of-cidp/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2026/06/02164645/Website-Wide-Card-1650-x-620-px-3-1024x385.png",
  },
  {
    url: "https://rarerevolutionmagazine.com/beyond-the-surface-the-invisible-impact-of-myasthenia-gravis/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2025/11/12133806/UCB_Logo_Tagline_ReflexBlue_RGB_Logo-1024x331.jpg",
  },
  {
    url: "https://rarerevolutionmagazine.com/from-collapse-to-new-kneecaps-a-dystonia-journey/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2026/06/18102811/Pulling-myself-up-when-I-had-no-feeling-in-my-legsaka-a-collapse-2-686x1024.jpg",
  }
] as const;

const rareCaregivingItems = [
  {
    url: "https://rarerevolutionmagazine.com/bernds-brave-new-world/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2021/10/08161439/13.png",
  },
  {
    url: "https://rarerevolutionmagazine.com/a-road-less-travelled-is-no-less-worthy/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2024/06/21094642/RARE-Parenting-Gina.png",
  },
  {
    url: "https://rarerevolutionmagazine.com/a-mum-on-a-mission-to-make-the-world-a-more-inclusive-place-for-rare-children/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2021/10/08162128/New-Website-Blog-Image-Cards-2-1.png",
  },
  {
    url: "https://rarerevolutionmagazine.com/challenges-of-caring-for-a-rare-disease-patient-a-discussion/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2024/11/12111759/Debra.png",
  },
  {
    url: "https://rarerevolutionmagazine.com/considering-caregiver-value-at-jp-morgan/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2025/01/07134127/RARE-Caregiving-Paul.png",
  },
  {
    url: "https://rarerevolutionmagazine.com/every-day-is-a-gift-interview-with-dr-al-freedman-rare-dad-and-counseling-psychologist/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2021/10/08161438/10.png",
  }
] as const;

const seriesTitleFromUrl = (url: string) => {
  const slug = url.replace(/\/$/, "").split("/").pop() || "Story";
  return slug
    .split("-")
    .filter(Boolean)
    .map((word, index) => {
      const lower = word.toLowerCase();
      if (
        index > 0 &&
        ["and", "the", "of", "to", "for", "in", "on", "with", "a", "an"].includes(lower)
      ) {
        return lower;
      }
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(" ");
};

const PatientVoiceIntroLayout = () => (
  <div className="relative h-full w-full overflow-hidden bg-[#f8fbfc] text-[#17384b]">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(48,176,190,0.16),transparent_34%),radial-gradient(circle_at_88%_82%,rgba(48,176,190,0.18),transparent_36%),linear-gradient(180deg,#ffffff_0%,#f4fafb_100%)]" />
    <div className="relative flex h-full flex-col px-[44px] pb-[38px] pt-[38px]">
      <img
        src={resolveRepositoryRootAssetUrl("/images/brand/rare-revolution-trademark-logo.png")}
        alt="RARE Revolution Magazine"
        className="mb-8 h-auto w-[330px] object-contain object-left"
        draggable={false}
      />
      <p className="mb-3 text-[9px] font-bold uppercase tracking-[0.3em] text-[#30b0be]">
        Rare insights
      </p>
      <h1 className="max-w-[390px] text-[47px] font-light leading-[0.94] tracking-[-0.045em] text-[#222d33]">
        Patient Voice
      </h1>
      <div className="my-6 h-[3px] w-[116px] bg-[#30b0be]" />
      <p className="mb-5 max-w-[378px] text-[18px] font-medium leading-[1.25] text-[#263b45]">
        Real experiences. Unfiltered perspectives. Voices that deserve to be heard.
      </p>
      <div className="max-w-[380px] space-y-3 text-[12.5px] leading-[1.48] text-[#315064]">
        <p>
          Patient Voice centers the people living the realities of rare disease. Through honest
          first-person accounts, patients and families share the moments that shape their
          journeys—from diagnosis, treatment and access to mental health, relationships,
          resilience, advocacy and hope.
        </p>
        <p>
          These stories move beyond symptoms and statistics to reveal the emotional, practical
          and deeply personal impact of living with a rare condition. They challenge assumptions,
          highlight unmet needs and show why listening to lived experience is essential to
          improving care, support and understanding.
        </p>
        <p>
          By creating space for people to speak in their own words, Patient Voice ensures that the
          rare community is not simply discussed, but heard, valued and included in the
          conversations and decisions that affect their lives.
        </p>
      </div>
      <div className="mt-auto flex items-center gap-3 pt-5">
        <div className="h-px flex-1 bg-[#d8e7ea]" />
        <span className="text-[8px] font-semibold uppercase tracking-[0.22em] text-[#30b0be]">
          RARE Revolution Magazine
        </span>
      </div>
    </div>
  </div>
);

const RareCaregivingIntroLayout = () => (
  <div className="relative h-full w-full overflow-hidden bg-[#f8fbfc] text-[#17384b]">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(48,176,190,0.16),transparent_34%),radial-gradient(circle_at_88%_82%,rgba(48,176,190,0.18),transparent_36%),linear-gradient(180deg,#ffffff_0%,#f4fafb_100%)]" />
    <div className="relative flex h-full flex-col px-[44px] pb-[38px] pt-[38px]">
      <img
        src={resolveRepositoryRootAssetUrl("/images/brand/rare-revolution-trademark-logo.png")}
        alt="RARE Revolution Magazine"
        className="mb-8 h-auto w-[330px] object-contain object-left"
        draggable={false}
      />
      <p className="mb-3 text-[9px] font-bold uppercase tracking-[0.3em] text-[#30b0be]">
        Rare insights
      </p>
      <h1 className="max-w-[390px] text-[47px] font-light leading-[0.94] tracking-[-0.045em] text-[#222d33]">
        Rare Caregiving
      </h1>
      <div className="my-6 h-[3px] w-[116px] bg-[#30b0be]" />
      <p className="mb-5 max-w-[378px] text-[18px] font-medium leading-[1.25] text-[#263b45]">
        The people carrying care, courage and everyday responsibility.
      </p>
      <div className="max-w-[380px] space-y-3 text-[12.5px] leading-[1.48] text-[#315064]">
        <p>
          Rare Caregiving shares the realities of supporting someone with a rare condition,
          including the practical demands, emotional weight and fierce love that shape daily life.
        </p>
        <p>
          These stories recognise parents, partners, relatives, friends and professional carers
          whose work is often essential yet unseen.
        </p>
        <p>
          Explore honest perspectives on advocacy, access, resilience, relationships and the
          support caregivers need to thrive alongside the people they care for.
        </p>
      </div>
      <div className="mt-auto flex items-center gap-3 pt-5">
        <div className="h-px flex-1 bg-[#d8e7ea]" />
        <span className="text-[8px] font-semibold uppercase tracking-[0.22em] text-[#30b0be]">
          RARE Revolution Magazine
        </span>
      </div>
    </div>
  </div>
);

const SeriesSixCardArchive = ({
  title,
  items,
  ariaLabel,
}: {
  title: string;
  items: readonly { url: string; image: string }[];
  ariaLabel: string;
}) => (
  <div className="relative flex h-full w-full flex-col overflow-hidden bg-[#f6fafb] text-[#17384b]">
    <div className="shrink-0 border-b border-[#d8e7ea] bg-white px-8 pb-5 pt-7">
      <p className="mb-1 text-[9px] font-bold uppercase tracking-[0.27em] text-[#30b0be]">
        {title}
      </p>
      <h2 className="text-[28px] font-light leading-none tracking-[-0.035em] text-[#222d33]">
        Explore the series
      </h2>
      <p className="mt-2 text-[11px] text-[#54707d]">Latest stories from the archive</p>
    </div>
    <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5" aria-label={ariaLabel}>
      <div className={SERIES_ARCHIVE_GRID_CLASS}>
        {items.map((item, index) => {
          const articleTitle = seriesTitleFromUrl(item.url);
          return (
            <a
              key={item.url}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              title={articleTitle}
              aria-label={`Open ${articleTitle} in a new tab`}
              className={`${SERIES_ARCHIVE_CARD_CLASS} border-[#d7e7e9] focus-visible:ring-[#30b0be]`}
            >
              <div className={`${SERIES_ARCHIVE_IMAGE_FRAME_CLASS} bg-[#eef3f4]`}>
                <img
                  src={item.image}
                  alt=""
                  className={SERIES_ARCHIVE_IMAGE_CLASS}
                  loading={index < 4 ? "eager" : "lazy"}
                  draggable={false}
                />
              </div>
              <div className={SERIES_ARCHIVE_BODY_CLASS}>
                <span className="mb-1.5 text-[8px] font-semibold uppercase tracking-[0.12em] text-[#30b0be]">
                  {title}
                </span>
                <h3 className="line-clamp-3 text-[11px] font-semibold leading-[1.28] text-[#243b46]">
                  {articleTitle}
                </h3>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  </div>
);

const PatientVoiceArchiveLayout = () => (
  <SeriesSixCardArchive
    title="Patient Voice"
    items={patientVoiceItems}
    ariaLabel="Patient Voice article archive"
  />
);

const RareCaregivingArchiveLayout = () => (
  <SeriesSixCardArchive
    title="Rare Caregiving"
    items={rareCaregivingItems}
    ariaLabel="Rare Caregiving article archive"
  />
);



const rareRamblingsItems = [
  {
    url: "https://rarerevolutionmagazine.com/richards-rare-ramblings-fear/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2023/12/02134119/Richard-Ramblings-Accom-1.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/richards-rare-ramblings-accommodating-for-rare-conditions/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2023/12/02134120/Richard-Ramblings-Accom.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/richards-rare-ramblings-why/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2023/12/02134118/Richard-Ramblings-Accom-2.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/winter-is-coming-and-i-am-ecstatic/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2023/12/02134119/Richard-Ramblings-Accom-1.png"
  }
] as const;

const rareRevInarItems = [
  {
    url: "https://rarerevolutionmagazine.com/anca-associated-vasculitis-and-its-impact-on-patients-and-families/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2023/03/28133745/New-Website-Blog-Image-Cards-400-x-400-px.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/early-access-pathways-to-medicines-insights-from-a-multi-stakeholder-discussion/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2022/11/15101607/New-Website-Blog-Image-Cards-400-x-400-px-2.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/a-blueprint-to-advance-genomic-medicine-in-latin-america/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2025/01/14164322/New-Website-Blog-Image-Cards-400-x-400-px-1.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/gene-therapies-a-new-age-of-care-in-rare-diseases/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2023/06/15093332/New-Website-Blog-Image-Cards-400-x-400-px.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/eight-challenges-in-developing-rare-disease-therapies/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2024/03/25104215/Copy-of-New-Website-Blog-Image-Cards-400-x-400-px.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/mastocytosis-before-during-and-after-diagnosis/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2026/06/11141816/pp-1.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/one-degree-of-separation-from-nf1/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2025/05/14123141/CTT-small-card-1.png"
  }
] as const;

const RareRamblingsIntroLayout = () => (
  <div className="relative h-full w-full overflow-hidden bg-[#f8fbfc] text-[#17384b]">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(48,176,190,0.16),transparent_34%),radial-gradient(circle_at_88%_82%,rgba(48,176,190,0.18),transparent_36%),linear-gradient(180deg,#ffffff_0%,#f4fafb_100%)]" />
    <div className="relative flex h-full flex-col px-[44px] pb-[38px] pt-[38px]">
      <img
        src={resolveRepositoryRootAssetUrl("/images/brand/rare-revolution-trademark-logo.png")}
        alt="RARE Revolution Magazine"
        className="mb-8 h-auto w-[330px] object-contain object-left"
        draggable={false}
      />
      <p className="mb-3 text-[9px] font-bold uppercase tracking-[0.3em] text-[#30b0be]">
        Rare insights
      </p>
      <h1 className="max-w-[390px] text-[47px] font-light leading-[0.94] tracking-[-0.045em] text-[#222d33]">
        Rare Ramblings
      </h1>
      <div className="my-6 h-[3px] w-[116px] bg-[#30b0be]" />
      <p className="mb-5 max-w-[378px] text-[18px] font-medium leading-[1.25] text-[#263b45]">
        Honest reflections on the realities, frustrations and unexpected moments of rare life.
      </p>
      <div className="max-w-[380px] space-y-3 text-[12.5px] leading-[1.48] text-[#315064]">
        <p>
          Rare Ramblings offers candid, personal commentary on living with rare disease and
          navigating a world that is not always designed with rare experiences in mind.
        </p>
        <p>
          The series explores identity, access, relationships, independence, adaptation and the
          everyday decisions that often sit beyond clinical conversations.
        </p>
        <p>
          Thoughtful, direct and sometimes humorous, these reflections create space for the
          complexity of rare life to be expressed without filters.
        </p>
      </div>
      <div className="mt-auto flex items-center gap-3 pt-5">
        <div className="h-px flex-1 bg-[#d8e7ea]" />
        <span className="text-[8px] font-semibold uppercase tracking-[0.22em] text-[#30b0be]">
          RARE Revolution Magazine
        </span>
      </div>
    </div>
  </div>
);

const RareRevInarIntroLayout = () => (
  <div className="relative h-full w-full overflow-hidden bg-[#f8fbfc] text-[#17384b]">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(48,176,190,0.16),transparent_34%),radial-gradient(circle_at_88%_82%,rgba(48,176,190,0.18),transparent_36%),linear-gradient(180deg,#ffffff_0%,#f4fafb_100%)]" />
    <div className="relative flex h-full flex-col px-[44px] pb-[38px] pt-[38px]">
      <img
        src={resolveRepositoryRootAssetUrl("/images/brand/rare-revolution-trademark-logo.png")}
        alt="RARE Revolution Magazine"
        className="mb-8 h-auto w-[330px] object-contain object-left"
        draggable={false}
      />
      <p className="mb-3 text-[9px] font-bold uppercase tracking-[0.3em] text-[#30b0be]">
        Rare insights
      </p>
      <h1 className="max-w-[390px] text-[47px] font-light leading-[0.94] tracking-[-0.045em] text-[#222d33]">
        Rare Rev-inar
      </h1>
      <div className="my-6 h-[3px] w-[116px] bg-[#30b0be]" />
      <p className="mb-5 max-w-[378px] text-[18px] font-medium leading-[1.25] text-[#263b45]">
        Expert conversations that turn complex rare-disease topics into accessible insight.
      </p>
      <div className="max-w-[380px] space-y-3 text-[12.5px] leading-[1.48] text-[#315064]">
        <p>
          Rare Rev-inar brings together patients, advocates, clinicians, researchers and industry
          leaders to explore the issues shaping diagnosis, treatment, research and care.
        </p>
        <p>
          Each session combines specialist knowledge with lived experience, creating practical,
          balanced discussions around emerging science, access challenges and community needs.
        </p>
        <p>
          Explore the archive for focused conversations designed to inform, connect and strengthen
          understanding across the rare-disease community.
        </p>
      </div>
      <div className="mt-auto flex items-center gap-3 pt-5">
        <div className="h-px flex-1 bg-[#d8e7ea]" />
        <span className="text-[8px] font-semibold uppercase tracking-[0.22em] text-[#30b0be]">
          RARE Revolution Magazine
        </span>
      </div>
    </div>
  </div>
);

const RareRamblingsArchiveLayout = () => (
  <SeriesSixCardArchive
    title="Rare Ramblings"
    items={rareRamblingsItems}
    ariaLabel="Rare Ramblings article archive"
  />
);

const RareRevInarArchiveLayout = () => (
  <SeriesSixCardArchive
    title="Rare Rev-inar"
    items={rareRevInarItems}
    ariaLabel="Rare Rev-inar article archive"
  />
);

const reviewsSeriesItems = [
  {
    url: "https://rarerevolutionmagazine.com/blackbird-lets-his-papers-fly-scott-lamascus/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2025/05/21113531/Scott-1.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/carpenters-rest-a-lullaby/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2025/05/21122137/Scott-5.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/heres-to-baseball-hustlers-and-believing/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2024/12/05100836/RARE-Reels.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/lou-gehrigs-prayers/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2025/05/21120129/Scott-2.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/madame-web-superheroes-dont-always-wear-capes/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2024/06/19150858/RARE-Reels-2.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/no-one-rides-alone/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2026/04/03142747/RARE-Reels.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/rare-reads-helix-of-love/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2024/08/02100623/RARE-Reads-Helix-of-Love.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/nothing-solid-a-vom-com-coming-soon/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2025/06/06090532/RARE-Reels.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/rare-reads-hero-kids-in-the-making/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2024/10/11150726/RARE-Reads-Hero-Kids.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/rare-reads-keeping-joy/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2024/10/11151853/RARE-Reads-Keeping-Joy.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/rare-reads-motherhood-plot-twist/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2024/10/11145408/RARE-Reads-Motherhood-Plot-Twist.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/rare-reads-the-champ-and-the-chump/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2024/10/11144253/RARE-Reads-Champ-and-the-Chump.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/rare-reads-thrive-rare-embracing-the-uniqueness-within-by-becky-tilley/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2024/08/02094220/RARE-Reads-Becky-Tilley.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/rare-reads-the-cmmrd-book-a-mismatch-memoir-and-guide/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2024/08/02102348/RARE-Reads-Sam-Rose.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/rare-reels-review-knox-goes-away/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2024/09/19151102/RARE-Reels-1.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/the-seventh-age-of-shakespeares-father/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2025/05/21120928/Scott-3.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/they-asked-again-for-dna/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2025/05/21122503/Scott-4.png"
  }
] as const;

const scienceTechSeriesItems = [
  {
    url: "https://rarerevolutionmagazine.com/beyond-development-overcoming-market-access-challenges-for-rare-disease-treatment/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2024/05/02132024/Ascella.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/dr-wendy-chung-and-simons-searchlight-pioneering-research-into-genes-that-cause-rare-neurodevelopmental-disorders/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2024/05/02132332/Ascella-1.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/building-a-bridge-between-patient-and-pharma-the-cmt-story/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2022/05/04133146/New-Website-Blog-Image-Cards-400-x-400-px-12.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/faster-diagnosis-for-patients-with-rare-diseases/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2024/05/02132331/Copy-of-New-Website-Blog-Image-Cards-400-x-400-px-1-1.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/enhancing-clinical-trial-success-through-proactive-patient-advocacy-and-engagement/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2025/01/22103204/Mike.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/engaging-patients-to-shape-the-research-of-the-future/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2023/04/10111538/Stephanie-Ernst-Card.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/improved-patient-finding-strategies-for-rare-diseases-a-win-win-for-patients-and-drug-developers/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2024/09/12092759/Health-Lumen.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/introducing-our-newest-rare-revolution-columnist-for-our-new-raretech-column/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2021/10/11140015/New-Website-Blog-Image-Cards-6.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/lifearc-announces-investment-of-more-than-100-million-into-rare-disease-research-by-2030/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2023/07/06092401/Stephanie-Ernst-Card.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/mendelscan-ai-for-good-informing-patient-and-public-perception/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2024/10/07154336/Mendelian.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/merging-the-metaverse-and-the-rare-disease-community-join-the-conversation/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2022/09/15115551/New-Website-Blog-Image-Cards-400-x-400-px-4.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/marie-curie-the-inspiring-legacy-of-a-great-woman-of-science-and-our-rare-inspiration/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2023/07/12160123/Marie-Curie-Headshot-Card.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/optimising-market-access-for-rare-disease-products-insights-from-craig-caceci/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2023/02/27093845/New-Website-Blog-Image-Cards-400-x-400-px-1-3.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/ptc-therapeutics-highlights-data-on-high-disease-burden-and-value-of-treatment-across-two-rare-diseases/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2021/10/11160808/New-Website-Blog-Image-Cards-1-2.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/precision-in-patient-data-how-genetic-databases-are-helping-to-shape-rare-disease-population-studies/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2024/05/02132026/Health-Lumen-1.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/sure-youve-heard-about-gnem-but-do-you-know-about-the-bulgarian-variant/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2022/05/18121730/New-Website-Blog-Image-Cards-400-x-400-px-8.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/the-great-democratisation-how-ai-is-levelling-the-playing-field-for-patients/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2026/02/13115850/Advoca.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/the-inflection-era-of-healthcare-where-technology-data-ai-and-collaboration-converge/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2025/02/24132844/a4xp-1.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/the-real-world-evidence-revolution-how-better-research-can-improve-patients-lives/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2022/10/20152126/New-Website-Blog-Image-Cards-400-x-400-px-25.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/the-transition-to-precision-medicine-one-size-fits-all-to-my-medicine/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2021/10/13133355/New-Website-Blog-Image-Cards-3-4.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/what-is-a-flare-in-sjogrens-trend-communitys-innovative-use-of-artificial-intelligence-to-find-answers-for-the-community/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2023/11/16085613/Richard-Ramblings-Accom.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/three-ways-ai-is-changing-paediatric-genomic-medicine/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2025/05/28094928/New-Website-Blog-Image-Cards-400-x-400-px.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/the-undiagnosed-diseases-networks-mission-to-eradicate-the-diagnostic-odyssey-an-interview-with-sarah-marshall/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2023/11/16120214/Undiagnosed-Diseases-Network-Card.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/world-orphan-drug-alliance-woda-bringing-therapies-to-underserved-patients-around-the-globe/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2022/06/29155516/New-Website-Blog-Image-Cards-400-x-400-px-1-3.png"
  }
] as const;

const sundaySessionsSeriesItems = [
  {
    url: "https://rarerevolutionmagazine.com/attitude-adapt-faith-and-purpose-how-dan-dry-dock-shockley-uses-his-positive-state-of-mind-to-adapt-to-life-as-an-ostomate/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2021/10/11152140/New-Website-Blog-Image-Cards-8-1.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/art-in-isolation-a-journey-of-healing-and-resistance/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2025/06/18140850/Sunday-Sessions-ari.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/an-inventors-carol-for-rare-disease-day/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2026/02/28095357/Sunday-Sessions-ari.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/carlos-briceno-explores-the-power-and-peace-of-the-present-moment/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2021/10/11145541/New-Website-Blog-Image-Cards-3-2.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/drought-tolerant-faith/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2026/01/20142826/Sunday-Sessions-Amber.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/goodness-and-mercy-my-lupus-journey/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2024/04/16112008/Sunday-Sessions-Kay.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/how-reiki-spirituality-and-faith-help-me-accept-life-with-a-rare-disease/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2024/09/17114729/Jorgs-story.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/kara-lafrance-explores-the-gift-of-faith-god-and-connection-in-a-time-of-great-separation/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2021/10/11141626/New-Website-Blog-Image-Cards-8.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/in-his-hands/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2025/02/24164553/Sunday-Sessions-HoneyLiz.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/relationships-can-be-tricky-in-a-world-of-rare-disease-2/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2021/10/08161441/18.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/rett-genetic-faith/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2021/10/08161440/16.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/sholtos-war-2/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2021/10/08161442/19.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/the-invisible-battle-how-msa-rewrote-my-soul/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2026/04/17094927/ss-1.png"
  }
] as const;

const turningTheTideSeriesItems = [
  {
    url: "https://rarerevolutionmagazine.com/a-mothers-mission-to-raise-awareness-of-bardet-biedl-syndrome-and-promote-effective-partnerships-between-carers-and-medical-professionals/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2022/05/27150839/New-Website-Blog-Image-Cards-400-x-400-px-11.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/a-bullhorn-in-stilettoes-tishas-fosters-unique-approach-to-raising-awareness-of-hidden-disabilities/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2022/09/14092930/New-Website-Blog-Image-Cards-400-x-400-px-3.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/a-celebration-of-25-years-in-advocacy-tanya-collin-histed-ceo-of-the-international-gaucher-alliance/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2024/06/03133151/Pam-Card-6.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/a-movement-born-from-silence-the-global-mission-to-treat-ctnnb1-syndrome/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2025/05/27122627/ctnnb1.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/a-new-year-brings-new-opportunities-global-genes-supporting-patients-caregivers-advocates-and-organisations/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2023/02/03141713/Pam-Card-15.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/a-multi-centre-registry-for-idiopathic-pulmonary-capillaritis/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2022/04/25122107/New-Website-Blog-Image-Cards-400-x-400-px-13-2.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/a-rare-dads-journey-inspiring-change-for-the-rare-disease-community-in-rwanda/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2024/05/15114649/Manzi-card.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/a-personal-and-professional-drive-to-advance-research-for-rare-disease/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2025/02/13152349/Behnaz.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/a-tapestry-of-hope-advocacy-community-day-2-of-the-npuk-afc-and-iw-2025-part-1/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2025/05/21102300/npuk-2.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/accelerating-treatment-access-in-the-united-states-through-financial-assistance-education-and-advocacy/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2024/06/03133158/Pam-Card-1.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/aaron-jackson-raising-awareness-of-organ-donation-and-bringing-hope-to-the-transplant-community/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2024/06/03133152/Pam-Card-5.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/a-tapestry-of-hope-advocacy-community-day-2-of-the-npuk-afc-and-iw-2025-part-2/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2025/05/21102259/npuk-3.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/access-to-spinal-muscular-atrophy-sma-treatment-in-denmark-a-success-story-of-how-persistence-can-win-in-the-end/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2024/11/11113647/ams-Card.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/ariannas-magic-boots-stamping-out-a-taboo-in-childrens-books/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2024/06/03133155/Pam-Card-3.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/alpha-1-best-practices-for-testing-for-this-and-other-late-onset-genetic-diseases/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2024/06/03133203/New-Website-Blog-Image-Cards-400-x-400-px.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/beat-scads-passionate-and-persistent-quest-for-answers-for-the-spontaneous-coronary-artery-dissection-community/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2022/05/05153624/New-Website-Blog-Image-Cards-400-x-400-px-17.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/barriers-to-care-in-sickle-cell-disease-the-reflections-of-lashardae-scott-social-worker-and-rare-mother/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2024/06/03133147/Pam-Card-10.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/becker-muscular-dystrophy-patients-find-hope-in-building-a-community/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2024/12/19133805/Becker.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/being-a-strong-father-does-not-mean-staying-silent-in-times-of-trauma/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2022/09/09132550/New-Website-Blog-Image-Cards-400-x-400-px-2.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/beyond-rare-disease-day-improving-quality-of-life-for-people-living-with-hae/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2023/03/21094113/Card-1.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/blood-sword-by-the-duncan-brothers-a-mythical-sword-wielding-comedy-to-raise-awareness-of-an-underdiagnosed-genetic-condition/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2025/01/09120801/Jill-Sisco.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/brace-brace-brace-for-burnout/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2022/02/01163236/New-Website-Blog-Image-Cards-400-x-400-px-1.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/breast-implant-illness-a-patients-experiences-and-her-mission-to-raise-awareness-and-improve-care/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2022/07/27124132/New-Website-Blog-Image-Cards-400-x-400-px-7.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/bridging-the-gap-differing-perceptions-of-generalised-myasthenia-disease-burden/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2024/12/19130424/Alexion-1.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/bridging-the-gap-health-inequalities-and-rare-diseases/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2024/11/26095357/Pam-Card-1.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/bringing-light-into-the-world-the-father-running-over-200-miles-for-angelman-syndrome/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2024/10/11113805/Christian-Card.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/changing-the-landscape-for-the-differently-abled-community-one-smile-at-a-time-dr-sai-kaustuv-is-our-rare-inspiration/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2024/06/03133154/Pam-Card-4.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/child-youth-care-zimbabwe-improving-the-lives-of-zimbabwean-rare-families-one-step-at-a-time/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2022/06/22121103/New-Website-Blog-Image-Cards-400-x-400-px-1-2.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/cmtc-ovm-improving-the-lives-of-people-with-blood-vessel-abnormalities-vascular-malformations/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2022/09/30140931/New-Website-Blog-Image-Cards-400-x-400-px-9.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/congenital-muscular-dystrophy-kelly-and-averys-mission-to-challenge-perceptions-of-disability/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2024/02/30144600/Kelly-and-Averey-Card.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/dr-justin-wests-mission-to-accelerate-the-discovery-of-a-disease-modifying-treatment-for-kcnt1-related-epilepsy/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2022/06/10133046/New-Website-Blog-Image-Cards-400-x-400-px-3-1.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/every-story-counts-how-understanding-the-diagnostic-journey-could-help-transform-rare-disease-care/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2026/07/09161438/Opal-Medical-1.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/finding-a-cure-nobody-else-is-looking-for-why-geri-and-zach-shoot-for-the-moon/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2024/06/03133142/Pam-Card-14.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/flok-pioneering-patient-led-research-for-inherited-metabolic-disorders-imd/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2024/11/28121408/flok.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/fop-friends-celebrating-a-decade-of-support-for-the-fibrodysplasia-ossificans-progressiva-community/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2024/06/03133157/Pam-Card-2.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/former-nfl-university-of-kentucky-football-star-art-still-working-to-shine-a-spotlight-on-rare-heart-disease/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2025/06/18144328/art.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/from-no-options-to-new-hope-how-science-partnership-and-persistence-are-driving-progress-towards-treatments-for-cask/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2026/01/21121111/och2026.1.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/gillian-jackson-bringing-positive-energy-and-information-to-the-online-bbs-community/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2022/03/10164844/New-Website-Blog-Image-Cards-400-x-400-px-15.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/guiding-grayson-a-familys-fight-to-advocate-educate-and-save-their-son-grayson-from-cln3-batten-disease/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2024/02/14102055/Grayson.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/highlighting-breakthroughs-and-collaboration-the-npuk-annual-family-conference-interactive-workshop-2025/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2025/05/21102301/npuk-1.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/how-10000-people-living-with-disability-could-end-the-foster-care-crisis/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2022/03/02203333/New-Website-Blog-Image-Cards-400-x-400-px-3.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/how-evidence-and-patient-realities-can-help-us-to-rethink-the-future-of-mg-care/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2026/01/13150228/npuk-1.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/i-am-celine-dion-the-stiff-person-syndrome-community-reacts-to-the-release-of-dions-documentary/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2024/07/16115333/Celine-Dion-SPS-Card.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/jeans-for-genes-raising-awareness-and-funds-to-help-people-living-with-life-altering-genetic-conditions/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2022/08/19095602/New-Website-Blog-Image-Cards-400-x-400-px-3-1.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/jenny-decker-attempts-to-sail-solo-around-the-globe-to-raise-awareness-of-charcot-marie-tooth-disease/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2024/04/10155608/CMT-Card.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/jessica-massengale-living-strong-with-scleroderma/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2024/06/03133146/Pam-Card-11.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/lea-jabre-helping-to-lift-the-voice-of-the-stiff-person-community/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2024/06/03133200/Lea-Card.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/libmeldy-gene-therapy-offers-a-lifeline-to-children-with-leukodystrophy-and-gives-hope-to-the-rare-disease-community/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2022/03/22101032/New-Website-Blog-Image-Cards-400-x-400-px-9-1.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/leave-no-one-behind/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2025/08/15110130/Tobias.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/life-in-the-slow-lane-finding-strength-after-ataxia-diagnosis/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2024/06/03133202/Kirsty-Card.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/life-wants-me-here/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2025/05/06144525/Lea-Jabre-Card.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/living-with-hod-a-rare-degenerative-neurological-condition-and-fighting-for-answers-for-the-community-and-you-may-ask-yourself-well-how-did-i-get-here/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2022/07/27122326/New-Website-Blog-Image-Cards-400-x-400-px-6.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/making-it-easier-for-patients-living-with-rare-diseases-to-find-the-right-specialist/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2026/03/17113925/phreesia-1.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/medics-4-rare-diseases-reframing-rare-disease-one-instagram-story-at-a-time/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2023/01/31153048/M4RD-Card.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/matt-hay-becoming-a-neurofibromatosis-advocate-and-giving-back-to-his-community/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2024/06/03133148/Pam-Card-9.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/ms-colorado-america-2022-two-time-aneurysm-survivor-and-a-champion-for-cardiovascular-disease-prevention/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2022/08/19090916/New-Website-Blog-Image-Cards-400-x-400-px-2.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/project-sebastian-a-safe-space-for-the-rare-disease-community-to-talk-listen-and-connect/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2022/04/15114022/New-Website-Blog-Image-Cards-400-x-400-px-12-2.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/my-babys-new-prognosis-she-will-not-die-but-what-will-her-life-be-like-and-how-should-i-live-mine/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2022/07/29091101/New-Website-Blog-Image-Cards-400-x-400-px-8-1.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/rare-disease-champions-prioritising-patient-needs/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2024/12/09161111/Inceptua-1.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/rare-diseases-lesotho-association-revolutionising-rare-disease-care-and-raising-awareness-in-lesotho/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2024/06/03133150/Pam-Card-7.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/rare-disease-self-advocacy-and-getting-needs-met/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2024/11/28104216/Copy-of-New-Website-Blog-Images-Wide-Card-7.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/rare-land-a-greek-film-shining-a-light-on-alpha-mannosidosis-and-rare-disease/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2024/06/03133145/Pam-Card-12.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/rare-patient-voice-helping-patients-and-caregivers-share-their-voices-2/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2024/08/19154525/Pam-Card.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/rare-x-2-what-having-twins-with-a-rare-condition-teaches-you-about-people/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2024/06/03133149/Pam-Card-8.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/research-into-diagnostic-tests-celebrated-at-international-conference/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2024/10/08115036/PSPA-Card.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/saarahs-foundation-a-fitting-legacy-to-saarah-ahmed-daughter-sister-star-student-aspiring-neuroscientist-miss-universe-gb-contestant-and-keds-warrior/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2022/05/18120047/New-Website-Blog-Image-Cards-400-x-400-px-7.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/riding-the-wave-of-medical-research-to-find-a-cure-for-ellie/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2022/04/04125443/New-Website-Blog-Image-Cards-400-x-400-px-12.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/sickle-cell-disease-the-urgent-need-for-better-care-increased-research-funding-and-better-treatment-options/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2024/08/28120223/James.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/simons-searchlight-15-years-of-genetic-discovery/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2025/08/11092715/EC-1.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/the-acromegaly-community-an-international-haven-for-people-living-with-acromegaly/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2024/10/29142827/Jill-Sisco.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/the-akari-foundation-a-light-of-hope-for-people-with-dmd-in-the-hispanic-community/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2022/04/06090846/New-Website-Blog-Image-Cards-400-x-400-px-18.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/the-cdcns-roadmap-project-supporting-the-pivotal-role-of-rare-disease-non-profit-organisations-in-accelerating-drug-repurposing/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2022/07/18140643/New-Website-Blog-Image-Cards-400-x-400-px-5.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/the-big-sunflower-project/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2022/04/29132136/New-Website-Blog-Image-Cards-400-x-400-px-23.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/the-disability-policy-centre-putting-accessibility-and-disability-at-the-heart-of-legislation/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2022/06/22121158/New-Website-Blog-Image-Cards-400-x-400-px-2-1.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/the-christmas-ring/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2024/06/03133143/Pam-Card-13.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/the-co-design-revolution-how-empowering-patients-is-the-future-of-clinical-trials/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2025/11/12102150/rpvq4sc.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/the-first-step-in-advocacy-is-believing-in-the-power-of-your-own-voice/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2022/05/05094649/New-Website-Blog-Image-Cards-400-x-400-px-13.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/the-fragile-ecosystem-how-federal-policy-changes-threaten-rare-disease-research-and-patient-care/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2025/07/02165028/EC.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/the-global-genes-rare-disease-diversity-equity-and-inclusion-report-the-challenges/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2022/03/16093106/New-Website-Blog-Image-Cards-400-x-400-px-5-1.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/the-global-genes-rare-disease-equity-diversity-and-inclusion-report-the-glimmers-of-hope/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2022/03/16093106/New-Website-Blog-Image-Cards-400-x-400-px-5-1.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/the-healing-power-of-storytelling/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2022/03/10160259/New-Website-Blog-Image-Cards-400-x-400-px-12.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/the-housing-crisis-the-unequal-impact-on-the-disabled-community-and-the-urgent-need-to-listen-to-its-voice/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2022/06/15155733/New-Website-Blog-Image-Cards-400-x-400-px-4-1.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/the-inflection-point-for-rare-diseases-driving-a-new-era-of-co-created-innovation/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2026/01/27145133/npuk-1-1.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/the-power-of-the-patient-voice-in-rare-disease-research/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2025/02/06110905/Pam-1.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/the-transatlantic-partnership-advancing-breakthrough-science-into-innovative-treatments-for-rare-diseases/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2025/01/21153208/Matthew-Wood.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/the-uk-general-election-2024-ensuring-rare-diseases-remain-a-priority/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2024/06/03133159/Pam-Card.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/the-vascular-birthmarks-foundation-revolutionising-awareness-levels-access-to-treatments-and-physician-education/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2022/05/24160945/New-Website-Blog-Image-Cards-400-x-400-px-9.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/this-isnt-just-a-day-its-a-movement-undiagnosed-day-2025-why-action-cant-wait/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2025/04/22150230/Wilhelm-Foundation.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/time-for-action/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2022/03/24163239/New-Website-Blog-Image-Cards-400-x-400-px-13-1.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/turning-the-tide-for-adult-polyglucosan-body-disease-apbd/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2022/03/10162427/New-Website-Blog-Image-Cards-400-x-400-px-13.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/turning-the-tide-for-rare-disease/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2022/02/22135655/New-Website-Blog-Image-Cards-400-x-400-px-14.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/what-i-learned-raising-a-son-with-haemophilia-stormys-story/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2022/10/07094943/New-Website-Blog-Image-Cards-400-x-400-px-18.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/were-not-here-for-symbolic-victories-were-here-for-action/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2025/03/18163458/Card.png"
  }
] as const;

const StandardSeriesIntroLayout = ({
  title,
  subtitle,
  paragraphs,
}: {
  title: React.ReactNode;
  subtitle: string;
  paragraphs: string[];
}) => (
  <div className="relative h-full w-full overflow-hidden bg-[#f8fbfc] text-[#17384b]">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(48,176,190,0.16),transparent_34%),radial-gradient(circle_at_88%_82%,rgba(48,176,190,0.18),transparent_36%),linear-gradient(180deg,#ffffff_0%,#f4fafb_100%)]" />
    <div className="relative flex h-full flex-col px-[44px] pb-[38px] pt-[38px]">
      <img
        src={resolveRepositoryRootAssetUrl("/images/brand/rare-revolution-trademark-logo.png")}
        alt="RARE Revolution Magazine"
        className="mb-8 h-auto w-[330px] object-contain object-left"
        draggable={false}
      />
      <p className="mb-3 text-[9px] font-bold uppercase tracking-[0.3em] text-[#30b0be]">
        Rare insights
      </p>
      <h1 className="max-w-[405px] text-[45px] font-light leading-[0.94] tracking-[-0.045em] text-[#222d33]">
        {title}
      </h1>
      <div className="my-6 h-[3px] w-[116px] bg-[#30b0be]" />
      <p className="mb-5 max-w-[390px] text-[18px] font-medium leading-[1.25] text-[#263b45]">
        {subtitle}
      </p>
      <div className="max-w-[390px] space-y-3 text-[12.5px] leading-[1.48] text-[#315064]">
        {paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
      <div className="mt-auto flex items-center gap-3 pt-5">
        <div className="h-px flex-1 bg-[#d8e7ea]" />
        <span className="text-[8px] font-semibold uppercase tracking-[0.22em] text-[#30b0be]">
          RARE Revolution Magazine
        </span>
      </div>
    </div>
  </div>
);

const ReviewsIntroLayout = () => (
  <StandardSeriesIntroLayout
    title="Reviews"
    subtitle="Books, films, music and creative work viewed through a rare-disease lens."
    paragraphs={[
      "Reviews explores stories, performances and creative projects that reflect disability, illness, caregiving, identity and the wider rare experience.",
      "Each piece considers not only craft and quality, but also representation, authenticity and the conversations a work can open across the community.",
      "Discover thoughtful recommendations and critical perspectives on culture that informs, challenges and connects."
    ]}
  />
);

const ScienceTechIntroLayout = () => (
  <StandardSeriesIntroLayout
    title={<>Science &amp;<br />Tech</>}
    subtitle="The ideas, tools and discoveries reshaping rare-disease research and care."
    paragraphs={[
      "Science & Tech examines advances in genomics, artificial intelligence, diagnostics, data, digital health and therapy development.",
      "The series connects technical progress with the practical questions that matter to patients, families, researchers and healthcare professionals.",
      "Explore how innovation is changing discovery, clinical trials, access, communication and the future of rare-disease medicine."
    ]}
  />
);

const SundaySessionsIntroLayout = () => (
  <StandardSeriesIntroLayout
    title="Sunday Sessions"
    subtitle="Reflective stories about meaning, creativity, faith and life with rare disease."
    paragraphs={[
      "Sunday Sessions creates space for quieter, deeply personal perspectives from across the rare-disease community.",
      "Through essays, poetry, art and reflection, contributors explore resilience, spirituality, isolation, healing, grief, acceptance and hope.",
      "These stories invite readers to pause, connect and consider the inner experiences that sit alongside diagnosis and care."
    ]}
  />
);


const TravelSeriesIntroLayout = () => (
  <div className="relative h-full w-full overflow-hidden bg-[#fbf8f0] text-[#2d2d2d]">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(198,176,123,0.20),transparent_34%),radial-gradient(circle_at_88%_82%,rgba(198,176,123,0.16),transparent_38%),linear-gradient(180deg,#fffdf8_0%,#f8f2e5_100%)]" />
    <div className="absolute right-[44px] top-[134px] h-[150px] w-[170px] opacity-55" aria-hidden="true">
      <div className="absolute left-[10px] top-[86px] h-[1px] w-[142px] rotate-[-18deg] border-t-2 border-dashed border-[#c6b07b]/60" />
      <div className="absolute left-[5px] top-[104px] h-[9px] w-[9px] rounded-full border-2 border-[#c6b07b] bg-[#fffdf8]" />
      <div className="absolute right-[7px] top-[52px] h-[13px] w-[13px] rounded-full border-[3px] border-[#c6b07b] bg-[#fffdf8]" />
    </div>
    <div className="relative flex h-full flex-col px-[44px] pb-[38px] pt-[38px]">
      <img
        src={resolveRepositoryRootAssetUrl("/images/brand/rare-revolution-trademark-logo.png")}
        alt="RARE Revolution Magazine"
        className="mb-8 h-auto w-[330px] object-contain object-left"
        draggable={false}
      />
      <p className="mb-3 text-[9px] font-bold uppercase tracking-[0.3em] text-[#a9873e]">
        RARE INSIGHTS
      </p>
      <h1 className="max-w-[390px] text-[47px] font-light leading-[0.94] tracking-[-0.045em] text-[#252525]">
        Travel Series
      </h1>
      <div className="my-6 h-[3px] w-[116px] bg-[#c6b07b]" />
      <p className="mb-5 max-w-[378px] text-[18px] font-medium leading-[1.25] text-[#3b352b]">
        Journeys shaped by rare disease.
      </p>
      <div className="max-w-[382px] space-y-3 text-[12.5px] leading-[1.48] text-[#5c5548]">
        <p>
          Travel can mean freedom, connection and discovery, but rare disease can add treatment
          schedules, medication, equipment, accessibility needs and uncertainty to every journey.
        </p>
        <p>
          Travel Series shares first-person perspectives on the preparation, adaptation and
          problem-solving that make time away possible, from everyday trips to long-awaited adventures.
        </p>
        <p>
          These stories celebrate the places people reach without overlooking the medical, practical
          and emotional realities they carry with them.
        </p>
      </div>
      <div className="mt-auto flex items-center gap-3 pt-5">
        <div className="h-px flex-1 bg-[#dfd3b6]" />
        <span className="text-[8px] font-semibold uppercase tracking-[0.22em] text-[#a9873e]">
          RARE Revolution Magazine
        </span>
      </div>
    </div>
  </div>
);

const TurningTheTideIntroLayout = () => (
  <StandardSeriesIntroLayout
    title={<>Turning the Tide<br />for Rare Disease</>}
    subtitle="People, partnerships and progress changing what is possible for rare communities."
    paragraphs={[
      "Turning the Tide for Rare Disease highlights practical progress across diagnosis, research, treatment, access and patient support.",
      "The series brings together lived experience, scientific expertise and collaborative action to show how persistent challenges can be addressed.",
      "Explore the initiatives, evidence and partnerships helping rare-disease care move from unmet need toward meaningful, lasting change."
    ]}
  />
);

const ReviewsArchiveLayout = () => (
  <SeriesSixCardArchive
    title="Reviews"
    items={reviewsSeriesItems}
    ariaLabel="Reviews series archive"
  />
);

const ScienceTechArchiveLayout = () => (
  <SeriesSixCardArchive
    title="Science & Tech"
    items={scienceTechSeriesItems}
    ariaLabel="Science and Tech series archive"
  />
);

const SundaySessionsArchiveLayout = () => (
  <SeriesSixCardArchive
    title="Sunday Sessions"
    items={sundaySessionsSeriesItems}
    ariaLabel="Sunday Sessions series archive"
  />
);


const travelSeriesItems = [
  {
    url: "https://rarerevolutionmagazine.com/wish-you-were-here-kidney-failure-travel-and-me/",
    image: travelSeriesJoeRumneyImage,
    title: "Wish you were here! Kidney failure, travel and me",
    author: "Joe Rumney",
    date: "10 August 2026",
  },
] as const;

const TravelSeriesArchiveLayout = () => (
  <div className="relative flex h-full w-full flex-col overflow-hidden bg-[#fbf8f0] text-[#2d2d2d]">
    <div className="shrink-0 border-b border-[#dfd3b6] bg-[#fffdf8] px-8 pb-5 pt-7">
      <p className="mb-1 text-[9px] font-bold uppercase tracking-[0.27em] text-[#a9873e]">
        RARE INSIGHTS
      </p>
      <h1 className="text-[29px] font-light leading-none tracking-[-0.035em] text-[#252525]">
        Travel Series
      </h1>
      <h2 className="mt-3 text-[15px] font-semibold tracking-[-0.015em] text-[#3b352b]">
        Explore the series
      </h2>
      <p className="mt-1 text-[11px] text-[#736a5a]">Journeys shaped by rare disease.</p>
      <div className="mt-4 h-[2px] w-[92px] bg-[#c6b07b]" />
    </div>

    <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5" aria-label="Travel Series article archive">
      <div className={SERIES_ARCHIVE_GRID_CLASS}>
        {travelSeriesItems.map((item, index) => (
          <a
            key={item.url}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            title={item.title}
            aria-label={`Open ${item.title} by ${item.author} in a new tab`}
            className={`${SERIES_ARCHIVE_CARD_CLASS} border-[#d8c79e] bg-[#fffdf8] no-underline shadow-[0_2px_10px_rgba(91,72,33,0.08)] transition-transform hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c6b07b]`}
          >
            <div className={`${SERIES_ARCHIVE_IMAGE_FRAME_CLASS} bg-[#f2ead8]`}>
              <img
                src={item.image}
                alt="Joe Rumney during travel"
                className={SERIES_ARCHIVE_IMAGE_CLASS}
                loading={index < 4 ? "eager" : "lazy"}
                draggable={false}
              />
            </div>
            <div className={SERIES_ARCHIVE_BODY_CLASS}>
              <span className="mb-1.5 text-[8px] font-semibold uppercase tracking-[0.12em] text-[#a9873e]">
                TRAVEL SERIES
              </span>
              <h3 className="text-[11px] font-semibold leading-[1.28] text-[#302d27]">
                Wish you were here!<br />Kidney failure, travel and me
              </h3>
              <p className="mt-2 text-[8.5px] leading-[1.35] text-[#756b59]">
                {item.author} · {item.date}
              </p>
            </div>
          </a>
        ))}

        {/* Always follows the final published article, so new stories can be appended above it. */}
        <div
          className={`${SERIES_ARCHIVE_CARD_CLASS} relative overflow-hidden border-[#c6b07b] bg-[#fffaf0] shadow-[0_2px_10px_rgba(91,72,33,0.05)]`}
          aria-label="More Travel Series stories are coming soon"
        >
          <div className="relative flex h-full flex-col p-5">
            <div className="absolute right-4 top-5 h-[88px] w-[118px] opacity-45" aria-hidden="true">
              <div className="absolute left-2 top-12 w-[92px] rotate-[-15deg] border-t-2 border-dashed border-[#c6b07b]" />
              <div className="absolute left-0 top-[55px] h-[8px] w-[8px] rounded-full border-2 border-[#c6b07b] bg-[#fffaf0]" />
              <div className="absolute right-1 top-[24px] h-[11px] w-[11px] rounded-full border-[3px] border-[#c6b07b] bg-[#fffaf0]" />
            </div>
            <span className="relative z-10 text-[8px] font-bold uppercase tracking-[0.14em] text-[#a9873e]">
              MORE JOURNEYS TO COME
            </span>
            <h3 className="relative z-10 mt-8 max-w-[175px] text-[23px] font-light leading-[1.02] tracking-[-0.035em] text-[#302d27]">
              The journey continues.
            </h3>
            <p className="relative z-10 mt-4 max-w-[205px] text-[10px] leading-[1.48] text-[#6d6455]">
              More first-person stories will explore travel, treatment, accessibility, planning,
              adaptation and adventure through the realities of rare disease.
            </p>
            <div className="relative z-10 mt-auto border-t border-[#dfd3b6] pt-4 text-[8px] font-semibold uppercase tracking-[0.14em] text-[#a9873e]">
              TRAVEL SERIES · MORE TO COME
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const TurningTheTideArchivePage = ({
  items,
  label,
}: {
  items: readonly { url: string; image: string }[];
  label: string;
}) => (
  <SeriesSixCardArchive
    title={label}
    items={items}
    ariaLabel={`${label} article archive`}
  />
);

const TurningTheTideArchiveOneLayout = () => (
  <TurningTheTideArchivePage
    items={turningTheTideSeriesItems}
    label="Turning the Tide for Rare Disease"
  />
);

const TurningTheTideArchiveTwoLayout = () => {
  const midpoint = Math.ceil(turningTheTideSeriesItems.length / 2);
  return (
    <TurningTheTideArchivePage
      items={turningTheTideSeriesItems.slice(midpoint)}
      label="Turning the Tide for Rare Disease"
    />
  );
};

const ceoSeriesItems = [
  {
    url: "https://rarerevolutionmagazine.com/peopleofrare/con-hennessy-of-openapp/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2020/09/14084626/CEO-PEO-Series-New-Website-1-13.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/peopleofrare/becky-jenner-of-rett-uk/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2020/02/14084602/CEO-PEO-Series-New-Website-1-36.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/peopleofrare/alex-evans-of-realiti/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2021/10/13140125/CEO-PEO-Series-New-Website-1-18.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/peopleofrare/daniel-lewi-of-the-cats-foundation/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2020/09/14084647/CEO-PEO-Series-New-Website-1-14.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/peopleofrare/debra-miller-of-cureduchenne/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2020/08/14084800/CEO-PEO-Series-New-Website-1-16.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/peopleofrare/david-jacob-of-thinkgenetic/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2020/02/14085915/CEO-PEO-Series-New-Website-1-35-1.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/peopleofrare/dr-thomas-rossi-of-venthera/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2020/09/14084842/CEO-PEO-Series-New-Website-1-12.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/peopleofrare/elin-haf-davies-of-aparito/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2020/08/14084929/CEO-PEO-Series-New-Website-1-15.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/peopleofrare/durhane-wong-rieger-of-the-canadian-organization-for-rare-disorders-cord/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2020/08/14084908/CEO-PEO-Series-New-Website-1-19.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/peopleofrare/jamie-ohara-of-hcd-economics/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2020/06/14090238/CEO-PEO-Series-New-Website-1-27.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/peopleofrare/eric-dube-ph-d-of-retrophin/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2021/10/13172748/CEO-PEO-Series-New-Website-1-26.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/peopleofrare/helen-springford-of-illingworth-research-group/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2020/08/14085008/CEO-PEO-Series-New-Website-1-17.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/peopleofrare/jeff-dangelo-of-the-champ1-research-foundation/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2020/07/14090318/CEO-PEO-Series-New-Website-1-22.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/peopleofrare/karim-smaira-of-genpharm/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2021/10/13210323/CEO-PEO-Series-New-Website-1-34.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/peopleofrare/kimberly-haugstad-of-global-genes/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2020/04/14090432/CEO-PEO-Series-New-Website-1-33.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/peopleofrare/kristine-hoestermann-and-theresa-thomas-of-rare/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2021/10/14090510/CEO-PEO-Series-New-Website-1-20-1.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/peopleofrare/laura-helms-reece-of-rho/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2020/07/14085221/CEO-PEO-Series-New-Website-1-21.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/peopleofrare/mike-klein-of-genomenon/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2021/10/13200928/CEO-PEO-Series-New-Website-1-31.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/peopleofrare/neil-davie-of-janssen/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2020/08/14085401/CEO-PEO-Series-New-Website-1-11.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/peopleofrare/maria-picone-of-trend-community/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2020/05/14090556/CEO-PEO-Series-New-Website-1-32.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/peopleofrare/patrick-howie-of-medifind/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2020/07/14090844/CEO-PEO-Series-New-Website-1-24.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/peopleofrare/rob-long-of-uplifting-athletes/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2021/10/13191755/CEO-PEO-Series-New-Website-1-28.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/peopleofrare/rick-thompson-of-findacure/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2021/10/14110520/CEO-PEO-Series-New-Website-1-39.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/peopleofrare/sandy-royden-of-open-health/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2021/10/14090529/CEO-PEO-Series-New-Website-1-38.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/peopleofrare/thomas-ogorka-of-orphan-reach/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2020/06/14091007/CEO-PEO-Series-New-Website-1-25.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/peopleofrare/tim-guilliams-of-healx/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2020/05/14091101/CEO-PEO-Series-New-Website-1-30.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/peopleofrare/toni-mathieson-of-niemann-pick-uk/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2021/10/13193729/CEO-PEO-Series-New-Website-1-29.png"
  }
] as const;

const patientEngagementSeriesItems = [
  {
    url: "https://rarerevolutionmagazine.com/peopleofrare/andrew-bolan-of-proqr/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2021/05/14084504/CEO-PEO-Series-New-Website-1-2.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/peopleofrare/asya-choudry-of-breaking-down-barriers/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2021/03/14084531/CEO-PEO-Series-New-Website-1-6.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/peopleofrare/debi-crist-of-rare-patient-voice/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2021/02/14084736/CEO-PEO-Series-New-Website-1-10.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/peopleofrare/dijana-krafcsik-of-vifor-pharma/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2021/02/14084821/CEO-PEO-Series-New-Website-1-9.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/peopleofrare/fernanda-copeland-of-avrobio/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2021/08/12130216/Untitled-design-1.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/peopleofrare/jayne-gershkowitz-of-amicus/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2021/06/14085040/CEO-PEO-Series-New-Website-1-1.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/peopleofrare/juliet-hulse-of-illingworth-research-group/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2021/03/14085109/CEO-PEO-Series-New-Website-1-8.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/peopleofrare/jo-fearnhead-wymbs-of-ashfield-medcomms/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2021/11/09102403/CEO-PEO-Series-New-Website-Jo.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/peopleofrare/kate-holliday-of-ccdr/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2021/10/14085148/CEO-PEO-Series-New-Website-copy-1.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/peopleofrare/lesley-harrison-of-the-aku-society/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2021/11/08104601/CEO-PEO-Series-New-Website-Lesley.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/peopleofrare/maysa-ghammachi-of-genpharm/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2021/03/14085309/CEO-PEO-Series-New-Website-1-4.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/peopleofrare/mileva-repasky-of-cdcn/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2021/03/14090711/CEO-PEO-Series-New-Website-1-7.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/peopleofrare/naomi-litchfield-of-bionical-emas/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2021/04/14085339/CEO-PEO-Series-New-Website-1-3.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/peopleofrare/nikki-backus-and-emma-murphy-of-the-cats-foundation/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2021/10/14125523/CEO-PEO-Series-New-Website-1-41.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/peopleofrare/paul-pereira-of-saniona/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2021/10/19140021/CEO-PEO-Series-New-Website-1-42.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/peopleofrare/rachel-radomski-of-harmony-biosciences/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2021/10/14085437/CEO-PEO-Series-New-Website-1-37.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/peopleofrare/sika-dunyoh-of-travere-therapeutics/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2021/11/02110207/CEO-PEO-Series-New-Website-Sika-Dunyoh.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/peopleofrare/sarah-krieger-of-cure-rare-disease/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2021/12/21122856/New-Website-Blog-Images-Wide-Card-3.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/peopleofrare/sue-krug-of-soft-bones/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2021/03/14085512/CEO-PEO-Series-New-Website-1-5.png"
  }
] as const;

const rareEntrepreneurSeriesItems = [
  {
    url: "https://rarerevolutionmagazine.com/peopleofrare/aisha-purvis-of-sensmart/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2022/03/08131700/New-Website-Aisha-Purvis.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/peopleofrare/anessa-powell-of-allability-recruiting/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2022/01/17111244/New-Website-copy-Anessa-Powell.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/peopleofrare/claire-barrow-of-rareguru/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2022/02/03151238/Claire-1.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/peopleofrare/courtney-young-of-myogene-bio/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2022/02/09090046/New-Website-Courtney.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/peopleofrare/daniel-defabio-and-bo-bigelow-of-the-disorder-channel/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2022/03/07135701/New-Website-Bo-Daniel.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/peopleofrare/dana-edwards-of-the-perfect-lift/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2022/07/11114712/New-Website-Dana-Edwards.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/peopleofrare/dr-harsha-rajasimha-of-jeeva-informatics/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2022/02/08111736/New-Website-Harsha.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/peopleofrare/dr-melissa-geraghty-psy-d-of-phoenix-rising-with-dr-g/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2022/05/10113319/New-Website-Melissa-Geraghty.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/peopleofrare/dylan-lombard-of-dylan-lombard-photography/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2022/05/31110323/New-Website-Dylan-Lombard.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/peopleofrare/eesha-sharma-of-lamar-health/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2022/09/06132036/New-Website-Eesha-Sharma.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/peopleofrare/eden-lord-of-the-dash-alliance/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2022/04/04170357/New-Website-Eden-Lord.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/peopleofrare/ella-balasa-patient-advocate-speaker-consultant/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2022/04/05092721/New-Website-Ella-Balasa.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/peopleofrare/giuliana-feretti-of-plan-wise-living/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2022/05/30144132/New-Website-Giuliana-Ferrettti.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/peopleofrare/guadalupe-hayes-mota-of-healr-solutions/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2022/08/23105416/New-Website-Guadalupe-Hayes-Mota.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/peopleofrare/hans-jorgen-wiberg-of-be-my-eyes/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2022/12/19155759/New-Website-Hans-Jorgen-Wiberg.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/peopleofrare/jenny-trott-of-mecoco/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2022/02/01141624/Jenny-Trott.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/peopleofrare/jolene-macdonald-of-accessibrand/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2022/01/24131524/New-Website-Jolene-Macdonald.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/peopleofrare/jordan-ray-of-limitless-medical-logs/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2022/03/02115003/New-Website-Jordan-Ray.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/peopleofrare/julia-anthony-of-solution-medical/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2022/03/16100108/New-Website-Julia-Anthony.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/peopleofrare/kassondra-lambert-of-the-striped-stable/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2022/06/07141606/New-Website-Kassondra-Lambert.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/peopleofrare/keith-and-amy-mayers-of-illness-coach-com/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2022/11/17115329/New-Website-Keith-and-Amy-Meyers.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/peopleofrare/michelle-connor-of-kinva/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2022/04/26162415/New-Website-Blog-Image-Cards-400-x-400-px-19.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/peopleofrare/misti-staley-of-freearm/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2022/05/30160706/New-Website-Misti-Staley.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/peopleofrare/nina-and-jake-wachsman-of-know-rare/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2022/08/30105212/New-Website-Nina-and-Jake-Wachsman.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/peopleofrare/rebecca-rosenberg-of-rebokeh/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2022/06/23095212/New-Website-Rebecca-Rosenberg.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/peopleofrare/ryan-sheedy-of-mejo/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2022/09/28133142/New-Website-Ryan-Sheedy.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/peopleofrare/sorcha-mc-elchar-of-sorchas-healthy-living/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2022/08/22112724/New-Website-Sorcha-Mc-Elchar.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/peopleofrare/tim-buckinx-of-epihunter/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2022/08/17152746/New-Website-Tim-Buckinx.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/peopleofrare/tracey-campbell-of-tracey-campbell-act/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2022/02/28123641/New-Website-Tracey-Campbell.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/peopleofrare/victoria-arreola-of-strong-and-rare-parenting/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2022/07/12131201/New-Website-Victoria-Arreola.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/peopleofrare/wes-michael-of-rare-patient-voice/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2022/10/06115256/New-Website-Wes-Michael.png"
  }
] as const;

const PEOPLE_OF_RARE_SPREAD_URL =
  resolveRepositoryRootAssetUrl("/series/people-of-rare/people-of-rare-spread-title-page.png");

const PeopleOfRareSpreadHalf = ({ side }: { side: "left" | "right" }) => (
  <div
    className="h-full w-full overflow-hidden bg-white"
    role="img"
    aria-label={`People of Rare series spread, ${side} page`}
  >
    <div
      className="h-[101%] w-full -translate-y-[0.5%] bg-no-repeat"
      style={{
        backgroundImage: `url("${PEOPLE_OF_RARE_SPREAD_URL}")`,
        backgroundSize: "200% 100%",
        backgroundPosition: side === "left" ? "left center" : "right center",
      }}
    />
  </div>
);

const PeopleOfRareSpreadLeftLayout = () => (
  <PeopleOfRareSpreadHalf side="left" />
);

const PeopleOfRareSpreadRightLayout = () => (
  <PeopleOfRareSpreadHalf side="right" />
);

const CeoSeriesIntroLayout = () => (
  <StandardSeriesIntroLayout
    title="CEO Series"
    subtitle="Leadership, strategy and purpose from the people shaping rare-disease organisations."
    paragraphs={[
      "The CEO Series introduces the leaders guiding charities, companies, research organisations and community initiatives across the rare-disease landscape.",
      "Through first-person interviews, they share the experiences, priorities and decisions behind their work, from building teams and partnerships to navigating innovation, access and long-term impact.",
      "These conversations reveal the people behind leadership roles and the values driving change for rare communities."
    ]}
  />
);

const PatientEngagementSeriesIntroLayout = () => (
  <StandardSeriesIntroLayout
    title={<>Patient Engagement<br />Series</>}
    subtitle="Better research and care begin by involving patients as genuine partners."
    paragraphs={[
      "The Patient Engagement Series explores how lived experience can shape research, clinical development, communication, access and decision-making.",
      "Patients, advocates and professionals discuss practical approaches to collaboration, including advisory work, co-creation, trial design, evidence generation and community-led priorities.",
      "The series highlights what meaningful engagement looks like when people affected by rare disease are included early, listened to consistently and valued for their expertise."
    ]}
  />
);

const RareEntrepreneurSeriesIntroLayout = () => (
  <StandardSeriesIntroLayout
    title={<>Rare Entrepreneur<br />Series</>}
    subtitle="Ideas born from lived experience and turned into practical change."
    paragraphs={[
      "The Rare Entrepreneur Series profiles founders and innovators creating products, services and organisations in response to needs they understand personally.",
      "Their stories cover the realities of starting and growing a venture, from identifying an unmet need and developing a solution to building partnerships, securing support and reaching the people who need it.",
      "Together, they show how rare experience can inspire resourcefulness, leadership and new approaches to inclusion, care and independence."
    ]}
  />
);

const CeoSeriesArchiveLayout = () => (
  <SeriesSixCardArchive
    title="CEO Series"
    items={ceoSeriesItems}
    ariaLabel="CEO Series archive"
  />
);

const PatientEngagementSeriesArchiveLayout = () => (
  <SeriesSixCardArchive
    title="Patient Engagement Series"
    items={patientEngagementSeriesItems}
    ariaLabel="Patient Engagement Series archive"
  />
);

const RareEntrepreneurSeriesArchiveLayout = () => (
  <div className="relative flex h-full w-full flex-col overflow-hidden bg-[#f6fafb] text-[#17384b]">
    <div className="shrink-0 border-b border-[#d8e7ea] bg-white px-8 pb-5 pt-7">
      <p className="mb-1 text-[9px] font-bold uppercase tracking-[0.27em] text-[#30b0be]">
        Rare Entrepreneur Series
      </p>
      <h2 className="text-[28px] font-light leading-none tracking-[-0.035em] text-[#222d33]">
        Explore the series
      </h2>
      <p className="mt-2 text-[11px] text-[#54707d]">
        All {rareEntrepreneurSeriesItems.length} articles
      </p>
    </div>

    <div
      className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5"
      onWheel={(event) => event.stopPropagation()}
      onWheelCapture={(event) => event.stopPropagation()}
      onTouchMove={(event) => event.stopPropagation()}
      onTouchMoveCapture={(event) => event.stopPropagation()}
      aria-label="Scrollable Rare Entrepreneur Series archive containing every article"
    >
      <div className={SERIES_ARCHIVE_GRID_CLASS}>
        {rareEntrepreneurSeriesItems.map((item, index) => {
          const articleTitle = seriesTitleFromUrl(item.url);
          return (
            <a
              key={item.url}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              title={articleTitle}
              aria-label={`Open ${articleTitle} in a new tab`}
              className={`${SERIES_ARCHIVE_CARD_CLASS} border-[#d7e7e9] focus-visible:ring-[#30b0be]`}
            >
              <div className={`${SERIES_ARCHIVE_IMAGE_FRAME_CLASS} bg-[#eef3f4]`}>
                <img
                  src={item.image}
                  alt=""
                  className={SERIES_ARCHIVE_IMAGE_CLASS}
                  loading={index < 4 ? "eager" : "lazy"}
                  draggable={false}
                />
              </div>
              <div className={SERIES_ARCHIVE_BODY_CLASS}>
                <span className="mb-1.5 text-[8px] font-semibold uppercase tracking-[0.12em] text-[#30b0be]">
                  Rare Entrepreneur Series
                </span>
                <h3 className="line-clamp-3 text-[11px] font-semibold leading-[1.28] text-[#243b46]">
                  {articleTitle}
                </h3>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  </div>
);


type DigitalSpotlightItem = {
  title: string;
  url: string;
  image: string;
};

type DigitalSpotlightSection = {
  slug: string;
  title: string;
  items: DigitalSpotlightItem[];
};

const DIGITAL_SPOTLIGHT_SECTIONS: DigitalSpotlightSection[] = [
  {
    slug: "psc",
    title: "Primary sclerosing cholangitis (PSC)",
    items: [
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/life-with-psc-the-visible-and-invisible-toll/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2026/05/15111235/article-2.png"
      },
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/cracking-the-mission-impossible-of-hepatology/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2026/05/15110847/mission-impossible-article-1.png"
      },
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/fire-fuel-and-frustration-hcp-perspective-on-the-unmet-needs-for-primary-sclerosing-cholangitis-psc/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2026/05/15111108/article-3.png"
      },
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/primary-sclerosing-cholangitis-psc-condition-overview-and-infographic/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2026/05/15111519/infographic.png"
      },
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/patient-power-advocates-driving-research-and-policy-reform/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2026/05/15111407/article-4.png"
      }
    ]
  },
  {
    slug: "nf1",
    title: "Neurofibromatosis type 1",
    items: [
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/nf1-healthcare-transition-overview-and-infographic/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2026/04/21090828/Infographic.png"
      },
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/roots-resilience-and-the-reality-of-nf1/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2026/04/16111213/CTT-Digital-SPotlight-card-images.png"
      },
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/empowering-young-voices-the-need-for-improved-transition-for-those-with-nf1/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2026/04/16113133/CTT-Digital-SPotlight-card-images-1.png"
      },
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/the-journey-of-care-in-nf1-referral-review-and-gold-standards-of-care/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2026/04/21101320/care-journey.png"
      },
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/the-window-of-opportunity-why-early-diagnosis-in-nf1-matters/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2026/04/21092216/Window-of-opp.png"
      }
    ]
  },
  {
    slug: "rett",
    title: "Rett syndrome",
    items: [
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/rett-syndrome-condition-overview-and-infographic/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2025/09/30122333/Acadia-small-cards-4.png"
      },
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/monitoring-disease-progression-in-rett-syndrome-the-challenge-of-consensus/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2025/09/26093252/Acadia-small-cards-1-1.png"
      },
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/recognising-rett-professional-and-personal-perspectives-on-diagnostic-challenges-for-rett-syndrome-2/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2025/09/24094149/2.png"
      },
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/rett-uk-supporting-communication-life-long-learning-and-emotional-well-being/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2025/09/25151554/Acadia-small-cards-1.png"
      },
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/who-cares-for-the-carer/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2025/09/24094151/3.png"
      }
    ]
  },
  {
    slug: "waiha",
    title: "Warm autoimmune hemolytic anemia (wAIHA)",
    items: [
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/closing-the-gap-improving-care-for-patients-with-waiha/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2024/11/04134624/Dr-Panch.png"
      },
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/empowered-by-knowledge-strengthened-by-community-mike-and-ginas-story/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2024/11/04133155/Mike-and-Gina.png"
      },
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/riding-the-waiha-rollercoaster-understanding-disease-unpredictability/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2024/11/04131649/Azreen.png"
      },
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/room-for-improvement-removing-uncertainty-for-the-waiha-community/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2024/11/04141129/Room-for-improvement.png"
      },
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/the-impact-of-warm-autoimmune-hemolytic-anemia-waiha-a-condition-overview-and-infographic/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2024/11/04141623/infographic.png"
      }
    ]
  },
  {
    slug: "pfic",
    title: "Progressive familial intrahepatic cholestasis (PFIC)",
    items: [
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/caring-for-children-affected-by-progressive-familial-intrahepatic-cholestasis-pfic/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2024/08/23140032/Ipsen-PFIC-small-card-images-2.png"
      },
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/championing-hope-francescas-fight-for-pfic-awareness/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2024/08/23140230/Ipsen-PFIC-small-card-images-1.png"
      },
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/navigating-rare-waters-lauras-journey-with-a-rare-liver-condition-pfic3/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2024/08/23140233/Laura.png"
      },
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/the-impact-of-progressive-familial-intrahepatic-cholestasis-pfic-a-condition-overview-and-infographic/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2024/08/23140235/Ipsen-PFIC-small-card-images.png"
      },
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/no-family-should-experience-rare-liver-disease-alone/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2024/08/23140231/Emily-.png"
      }
    ]
  },
  {
    slug: "sma",
    title: "Spinal muscular atrophy",
    items: [
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/20-years-of-sma-europe-from-firefighting-to-future-building/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2026/03/31142413/7.png"
      },
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/a-seat-a-voice-a-vote-reimagining-the-role-of-sma-patient-advocates-in-research-and-care/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2026/03/31123138/8.png"
      },
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/care-for-adults-living-with-sma-in-europe-a-benchmarking-report-the-unmet-needs-in-the-uk/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2023/12/30115654/4-12.png"
      },
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/sma-europe-a-global-leader-for-change-for-people-with-spinal-muscular-atrophy/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2023/12/30115657/6-5.png"
      },
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/spinal-muscular-atrophy-sma-adult-care-pathways-in-slovenia/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2023/12/30115659/1-1.png"
      },
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/spearheading-the-change-4th-scientific-international-congress-on-spinal-muscular-atrophy/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2023/12/30115700/2-8.png"
      },
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/what-is-spinal-muscular-atrophy/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2023/12/30115702/3-11.png"
      },
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/the-power-of-working-together-towards-the-same-goal-sma-europe-and-afm-telethon/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2023/12/30115655/5-8.png"
      },
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/two-decades-of-discovery-sma-research-from-darkness-to-hope/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2026/03/31125122/nicole.png"
      }
    ]
  },
  {
    slug: "sjogrens",
    title: "Sjögren’s disease",
    items: [
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/how-does-sjogrens-disease-affect-peoples-quality-of-life/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2021/12/30113513/Janet-2.png"
      },
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/living-better-with-sjogrens-disease/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2024/03/30122614/Susan.png"
      },
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/dr-chiara-baldini-insights-into-care-pathways-in-sjogrens-disease/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2021/12/30113508/Chiara.png"
      },
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/sjogren-europe-shaping-a-brighter-future-for-people-living-with-sjogren-disease/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2021/12/30113514/Sjogren-Europe.png"
      },
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/sjogrens-foundation-raising-awareness-of-sjogrens-disease-an-under-recognised-and-misunderstood-disease/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2021/12/30113511/Janet-1.png"
      },
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/living-well-life-with-sjogrens-disease/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2026/06/05105207/ipsen-PSC-small-card-images.png"
      },
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/when-you-hear-hoofbeats-think-zebras-diagnostic-delay-in-sjogrens-a-patient-advocates-story/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2021/12/30113510/Coralie.png"
      }
    ]
  },
  {
    slug: "pbc",
    title: "PBC",
    items: [
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/leben-mit-fatigue-latoya-asads-weg-mit-primar-biliarer-cholangitis/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2021/12/30113457/400-PATIENT-REPORTED-OUTCOMES-AND-PATIENT-REGISTRIES-2.png"
      },
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/learning-to-live-with-fatigue-latoya-asads-journey-with-primary-biliary-cholangitis/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2021/12/30113457/400-PATIENT-REPORTED-OUTCOMES-AND-PATIENT-REGISTRIES-2.png"
      },
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/die-pbc-foundation-positive-beeinflussung-des-lebens-aller-von-primar-biliarer-cholangitis-betroffenen/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2021/12/30113456/5.png"
      },
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/primar-biliare-cholangitis-in-deutschland-prof-trautweins-perspektive/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2021/12/30113458/400-PATIENT-REPORTED-OUTCOMES-AND-PATIENT-REGISTRIES.png"
      },
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/primary-biliary-cholangitis-in-germany-prof-trautweins-perspective/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2021/12/30113458/400-PATIENT-REPORTED-OUTCOMES-AND-PATIENT-REGISTRIES.png"
      },
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/the-care-pathway-and-unmet-needs-in-primary-biliary-cholangitis-a-rare-autoimmune-disease-of-the-liver-an-interview-with-prof-singal/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2021/12/30113452/3-1.png"
      },
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/the-importance-of-listening-to-people-with-primary-biliary-cholangitis/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2021/12/30113454/4-1.png"
      },
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/the-pbc-foundation-positively-impacting-the-lives-of-all-those-affected-by-pbc/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2021/12/30113456/5.png"
      },
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/versorgungswege-und-ungedeckter-bedarf-bei-primar-biliarer-cholangitis-einer-seltenen-autoimmunerkrankung-der-leber-ein-interview-mit-prof-singal/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2021/12/30113452/3-1.png"
      },
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/warum-es-wichtig-ist-menschen-mit-primar-biliarer-cholangitis-zuzuhoren/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2021/12/30113454/4-1.png"
      }
    ]
  },
  {
    slug: "thyroid-eye",
    title: "Thyroid eye disease",
    items: [
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/layla-lohmanns-unpredictable-journey-living-with-thyroid-eye-disease/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2023/11/30120417/3.png"
      },
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/caring-for-people-with-thyroid-eye-disease-a-healthcare-professionals-experience/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2023/11/30120416/2.png"
      },
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/a-closer-look-at-the-history-and-science-of-thyroid-eye-disease/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2023/11/30120419/5.png"
      },
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/the-work-of-patient-advocacy-organisations-supporting-people-with-thyroid-eye-disease/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2023/11/30120418/4.png"
      },
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/travelling-a-long-road-with-graves-disease-and-thyroid-eye-disease-ted-a-care-partners-perspective/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2023/11/30120415/1.png"
      }
    ]
  },
  {
    slug: "igg4-rd",
    title: "Immunoglobulin G4-related disease (IgG4-RD)",
    items: [
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/addressing-a-prevailing-narrative-through-the-lived-experience-of-women-with-igg4-related-disease/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2024/12/05153604/Horizon-Sjogrens-DS-small-card-images.png"
      },
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/from-misdiagnosis-to-mission-one-couples-charge-to-improve-igg4-rd-awareness-and-care/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2025/02/25120125/1-6.png"
      },
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/dr-john-h-stone-a-physicianinvestigators-journey-with-igg4-related-disease/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2023/12/30120202/1-2.png"
      },
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/rare-but-real-finding-recognition-and-support-for-igg4-rd/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2025/02/25120717/3-8.png"
      },
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/navigating-the-complexities-of-igg4-related-disease-an-experts-insights-on-improving-care-and-awareness-dr-alireza-meysami/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2025/02/25115144/2-5.png"
      },
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/the-alliance-for-patient-access-tackling-barriers-to-healthcare-for-people-with-igg4-rd-and-other-rare-diseases/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2023/12/30120207/4-13.png"
      },
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/the-emerging-advocacy-landscape-for-igg4-related-disease-an-advocates-quest-to-build-a-new-patient-organisation/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2023/12/30120205/3-12.png"
      },
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/the-importance-of-greater-awareness-about-igg4-rd-a-patients-story/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2023/12/30120209/5-9.png"
      },
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/what-is-igg4-related-disease-and-what-are-the-diagnosis-and-treatment-pathways/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2023/12/30120204/2-9.png"
      }
    ]
  },
  {
    slug: "fabry",
    title: "Fabry disease",
    items: [
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/afabry-insights-from-worldsymposium-an-interview-with-giacomo-chiesi/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2023/12/30115556/8-2.png"
      },
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/evolving-screening-and-diagnosis-strategies-in-fabry-disease-professor-camilla-tondels-expert-perspective/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2023/12/30115555/7-3.png"
      },
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/dont-tell-me-what-you-cant-do-tell-me-what-you-can-do-putting-patients-at-the-heart-of-the-conversation/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2023/12/30115550/4-11.png"
      },
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/key-conversations-in-fabry-disease-an-interview-with-professor-roser-torra/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2023/12/30115553/6-4.png"
      },
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/fabry-disease-emerging-treatments-and-unmet-needs/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2023/12/30115557/1.png"
      },
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/living-with-fabry-disease-and-advocating-for-the-community/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2023/12/30115552/5-7.png"
      },
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/the-power-of-a-multi-disciplinary-approach-in-improving-the-care-of-people-living-with-fabry-disease/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2023/12/30115600/3-10.png"
      }
    ]
  },
  {
    slug: "myelofibrosis",
    title: "Myelofibrosis",
    items: [
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/myelofibrosis-in-young-people-carly-pierces-treatment-with-a-stem-cell-transplant-at-33-years-old/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2022/11/30114711/400-PATIENT-REPORTED-OUTCOMES-AND-PATIENT-REGISTRIES-2-1.png"
      },
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/living-with-myelofibrosis-a-caregivers-perspective-on-the-importance-of-teamwork-and-a-positive-mindset/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2022/11/30114714/3-3.png"
      },
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/myelofibrosis-an-overview-myeloproliferative-neoplasms/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2022/11/30114713/400-PATIENT-REPORTED-OUTCOMES-AND-PATIENT-REGISTRIES-1.png"
      },
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/the-mpn-research-foundation-a-catalyst-for-change-for-the-mpn-community/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2022/11/30114716/5-4.png"
      },
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/the-challenges-of-living-with-myelofibrosis-jenny-wilson-anaemia-and-fatigue/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2022/11/30114715/4-3.png"
      }
    ]
  },
  {
    slug: "attrv",
    title: "Hereditary amyloidosis (ATTRv)",
    items: [
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/hereditary-amyloidosis-attrv-an-overview-of-the-condition/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2023/03/30115005/400-PATIENT-REPORTED-OUTCOMES-AND-PATIENT-REGISTRIES-1.png"
      },
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/hereditary-amyloidosis-in-brazil-a-focus-on-access-to-diagnosis-and-treatment/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2023/03/30115007/3-6.png"
      },
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/a-reflection-on-15-years-in-transthyretin-mediated-attr-amyloidosis/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2023/03/30115009/5-5.png"
      },
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/hereditary-amyloidosis-in-spain-a-patient-advocates-insights-into-the-communitys-needs/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2023/03/30115008/4-5.png"
      },
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/two-siblings-reflect-on-the-vital-importance-of-early-diagnosis-and-treatment-in-hereditary-amyloidosis/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2023/03/30115011/400-PATIENT-REPORTED-OUTCOMES-AND-PATIENT-REGISTRIES-2-1.png"
      }
    ]
  },
  {
    slug: "glomerular",
    title: "Glomerular diseases",
    items: [
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/european-kidney-patients-federation/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2022/10/30114323/5-7.png"
      },
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/caring-for-a-family-member-with-fsgs-a-mothers-story/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2022/10/30114325/6-6.png"
      },
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/a-rarer-than-rare-genetic-puzzle-unpicking-a-family-history-of-rare-kidney-disease-c3-glomerulopathy-c3g/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2025/01/30114956/Room-for-improvement.png"
      },
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/glomerular-diseases-a-condition-overview-and-infographic/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2025/02/11135610/Screenshot-2025-02-11-125343.png"
      },
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/glomerular-diseases-pathways-in-diagnosis-and-treatment-and-the-new-developments-for-patients/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2022/10/30114332/4-7.png"
      },
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/living-with-fsgs-pascalines-story/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2022/10/30114327/400-PATIENT-REPORTED-OUTCOMES-AND-PATIENT-REGISTRIES-2-1.png"
      },
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/living-with-glomerular-disease-phil-smiths-unexpected-diagnosis-of-igan/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2022/10/30114328/400-PATIENT-REPORTED-OUTCOMES-AND-PATIENT-REGISTRIES-1.png"
      },
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/navigating-the-complexities-of-glomerular-disease-c3g-and-ic-mpgn-an-hcp-perspective/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2025/02/11140024/3-4.png"
      },
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/nephcure-25-years-of-advancing-research-treatments-and-care-for-rare-kidney-diseases/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2025/02/11131830/5-2.png"
      },
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/resilience-in-the-face-of-a-rare-and-uncertain-diagnosis/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2025/01/30122929/Copy-of-wAIHA-Card-images.png"
      },
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/shining-a-light-on-iga-nephropathy-igan/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2025/09/29120457/Acadia-small-cards-3.png"
      },
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/the-unmet-needs-for-people-with-glomerular-diseases-the-perspective-of-a-lead-research-nurse/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2022/10/30114331/3-7.png"
      }
    ]
  },
  {
    slug: "attp",
    title: "Acquired thrombotic thrombocytopenic purpura (aTTP)",
    items: [
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/acquired-thrombotic-thrombocytopenic-purpura-attp-also-known-as-immune-mediated-ttp-ittp-an-overview/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2022/09/30113927/400-PATIENT-REPORTED-OUTCOMES-AND-PATIENT-REGISTRIES-1.png"
      },
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/12-hours-to-live-a-life-saving-diagnosis-of-attp-in-the-emergency-room/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2022/08/23083540/6.png"
      },
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/patient-advocacy-groups-for-attp/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2022/09/30113931/4-3.png"
      },
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/think-attp-infographic-suspect-treat-confirm-monitor/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2022/09/30113923/6-5.png"
      },
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/ttpnetwork-and-fedhemo-supporting-patients-with-thrombotic-thrombocytopenic-purpura-ttp/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2022/09/30113922/5-5.png"
      },
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/what-does-good-care-look-like-during-an-acute-episode-of-attp/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2022/09/30113929/3-7.png"
      },
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/what-does-good-care-look-like-during-attp-remission/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2022/09/30113926/400-PATIENT-REPORTED-OUTCOMES-AND-PATIENT-REGISTRIES-2-1.png"
      }
    ]
  },
  {
    slug: "aav",
    title: "ANCA-associated vasculitis (AAV)",
    items: [
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/how-patient-reported-outcomes-and-patient-registries-can-improve-outcomes-for-people-living-with-vasculitis/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2022/05/30113743/400-PATIENT-REPORTED-OUTCOMES-AND-PATIENT-REGISTRIES-1.png"
      },
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/treatment-pathways-of-patients-with-vasculitis/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2022/05/30113709/400-Raphaels-TREATMENT-PATHYWAYS_-THE-UNMET-NEEDS-OF-PATIENTS-2.png"
      },
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/vasculitis-internationals-mission-to-encourage-and-support-international-collaboration-between-vasculitis-patient-advocacy-groups-vpags/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2022/05/05090201/400-Vasculitis-Internationals-mission_-to-encourage-and-support-international-collaboration-between-vasculitis-patient-advocacy-groups-VPAGs.png"
      },
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/vasculitis-ireland-awareness-the-vital-importance-of-collaboration-in-driving-improvements-for-the-vasculitis-community/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2022/05/05085711/400-Julie-Vasculitis-Ireland-Awareness_-the-vital-importance-of-collaboration-in-driving-improvements-for-the-vasculitis-community.png"
      },
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/vasculitis-uk-the-efforts-to-improve-quality-of-life-for-the-vasculitis-community-and-its-hopes-for-the-future/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2022/05/05085957/400-Zoi_-Vasculitis-UK_-the-efforts-to-improve-quality-of-life-for-the-vasculitis-community-and-its-hopes-for-the-future-1.png"
      },
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/vasculitis-misconceptions-that-can-delay-diagnosis/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2022/05/06135215/AAV-small-card-images-9.png"
      }
    ]
  },
  {
    slug: "apds",
    title: "Activated PI3K delta syndrome (APDS)",
    items: [
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/caring-for-a-child-with-apds/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2021/11/26131528/Caregiver.png"
      },
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/clinical-management-of-individuals-with-apds-and-pi/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2021/11/26123713/Treatment-and-management-Dalm-2.png"
      },
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/activated-pi3k-delta-syndrome-apds/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2021/12/30113505/Overvire-1.png"
      },
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/life-with-activated-pi3k-delta-syndrome/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2021/12/01125708/Sher-Ling-1-1.png"
      },
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/ipopi-advocacy-support-apds-and-pi/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2021/11/25142100/IPOPI.png"
      },
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/the-link-between-early-diagnosis-and-disease-progression-in-apds/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2021/12/30113502/Genetic-testing.png"
      },
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/understanding-the-apds-patient-journey/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2021/12/03120821/infographic.png"
      }
    ]
  },
  {
    slug: "ftd",
    title: "Frontotemporal dementia",
    items: [
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/gene-therapy-research-for-frontotemporal-dementia/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2021/10/20171931/Untitled-design-27.png"
      },
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/ftd-genetic-confirmation-genetic-counselling/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2021/10/20171208/Untitled-design-25.png"
      },
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/aftd-providing-essential-resources-and-vital-support/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2021/10/20170223/Untitled-design-23-4.png"
      },
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/overview-of-ftd-dr-ahmed/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2021/10/06121815/image-20150119-2735-1g4csgk.jpg"
      },
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/the-ftd-disorders-registry/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2021/10/12134833/New-Website-Blog-Image-Cards-400-x-400-px-4.png"
      },
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/the-genetic-testing-dilemma-understanding-inheritance-risk/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2021/10/20171609/Untitled-design-26.png"
      },
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/understanding-the-impact-of-ftd-diagnosis-on-carers-and-families/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2021/10/20170631/Untitled-design-24.png"
      }
    ]
  },
  {
    slug: "gaucher",
    title: "Gaucher",
    items: [
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/gaucher-consultant-dr-neal-weinreb-the-function-and-complications-of-bones-in-individuals-with-gaucher-and-advice-to-physicians-and-patients-in-managing-and-tracking-symptoms/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2021/10/19154639/New-Website-Blog-Image-Cards-10-2.png"
      },
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/get-the-facts-on-gaucher-and-bone-disease/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2021/10/19160001/New-Website-Blog-Image-Cards-13-1.png"
      },
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/gaucher-disease-and-bones-everything-you-need-to-know/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2021/09/16162318/final-approved-infographic-gaucher-disease-and-bones.png"
      },
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/national-gaucher-foundation-of-canada-the-power-of-individual-stories-to-spark-widespread-advocacy/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2021/10/19153752/New-Website-Blog-Image-Cards-8-3.png"
      },
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/pave-a-path-of-hope-for-gaucher-disease/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2021/10/19155353/New-Website-Blog-Image-Cards-12-1.png"
      },
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/pierre-joly-a-personal-story-of-living-with-gaucher/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2021/10/19153320/New-Website-Blog-Image-Cards-7-3.png"
      },
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/the-international-gaucher-alliance-a-foothold-in-national-grassroots-advocacy-and-a-collaborative-global-perspective/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2021/10/19152646/New-Website-Blog-Image-Cards-6-2.png"
      },
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/the-gaucher-community-alliance-small-but-mighty/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2021/05/19154209/New-Website-Blog-Image-Cards-9.png"
      },
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/the-national-gaucher-foundation-education-and-empowerment/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2021/10/19160155/New-Website-Blog-Image-Cards-14-1.png"
      },
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/uk-gauchers-association-a-foothold-in-national-grassroots-advocacy-and-a-collaborative-global-perspective/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2021/10/19155029/New-Website-Blog-Image-Cards-11-1.png"
      },
      {
        title: "untitled",
        url: "https://rarerevolutionmagazine.com/media-centre/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2021/10/06160342/If-you-are-interested-in-sponsoring-a-digital-spotlight-click-here-to-arrange-a-call-with-our-team-3.png"
      }
    ]
  },
  {
    slug: "cdg",
    title: "CDG",
    items: [
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/a-patient-perspective-on-life-with-congenital-disorders-of-glycosylation-cdg/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2021/10/19165953/New-Website-Blog-Image-Cards-8-4.png"
      },
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/a-familys-global-research-journey-searching-for-a-treatment-for-piga-cdg/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2021/10/19164550/New-Website-Blog-Image-Cards-2-8.png"
      },
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/a-carers-perspective-the-impact-a-diagnosis-of-congenital-disorders-of-glycosylation-cdg-has-on-a-family/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2021/10/19165053/New-Website-Blog-Image-Cards-4-6.png"
      },
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/cdg-allies-ppain-a-people-orientated-research-method-to-turn-families-needs-and-ideas-into-scientific-projects/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2021/10/19164327/Screenshot-2021-10-19-164311.png"
      },
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/cdg-care-a-united-global-front-committed-to-improving-the-quality-of-life-for-all-cdg-families/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2021/10/19165307/New-Website-Blog-Image-Cards-5-6.png"
      },
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/professor-eva-morava-kozicz-the-scientist-dividing-her-time-between-lab-research-and-patient-care-to-improve-the-lives-of-cdg-families-around-the-world/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2021/10/19165517/New-Website-Blog-Image-Cards-6-3.png"
      },
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/wcdgo-a-new-user-friendly-website-to-showcase-practical-signposting-for-the-cdg-community/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2021/10/19163659/New-Website-Blog-Image-Cards-33.png"
      },
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/vanessa-ferreira-driving-people-centric-research-as-a-scientist-and-sister-in-a-cdg-family/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2021/10/19164046/New-Website-Blog-Image-Cards-1-7.png"
      },
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/professor-jaak-jaeken-an-overview-of-the-discovery-and-complexity-of-congenital-disorders-of-glycosylation-cdg/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2021/10/19164741/New-Website-Blog-Image-Cards-3-8.png"
      },
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/world-conference-on-cdg-a-global-platform-for-families-and-stakeholders/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2021/10/19165747/New-Website-Blog-Image-Cards-7-4.png"
      }
    ]
  },
  {
    slug: "acromegaly",
    title: "Acromegaly",
    items: [
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/dan-jeffries-reads-me-myself-eye-exclusively-for-rare-revolution/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2021/09/20131559/dan-book-canada-small_orig.jpg"
      },
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/advocacy-and-acrotales-my-journey-with-acromegaly/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2021/10/19162233/New-Website-Blog-Image-Cards-4-5.png"
      },
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/acromegaly-support/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2021/09/20124243/Digital-Disease-Spotlight-Acromegaly-Signpost-meme-1.png"
      },
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/dr-niki-karavitaki-talks-to-rare-revolution-magazine-for-acromegaly-digital-disease-spotlight/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2021/10/19160836/New-Website-Blog-Image-Cards-32.png"
      },
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/kara-lafrance-shares-her-journey-with-acromegaly-carrying-on-the-fight/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2021/10/19161851/New-Website-Blog-Image-Cards-3-7.png"
      },
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/understanding-acromegaly/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2021/10/19161333/New-Website-Blog-Image-Cards-1-6.png"
      },
      {
        title: "untitled",
        url: "https://rarerevolutionmagazine.com/media-centre/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2021/10/06160342/If-you-are-interested-in-sponsoring-a-digital-spotlight-click-here-to-arrange-a-call-with-our-team-3.png"
      }
    ]
  },
  {
    slug: "framework-action",
    title: "Framework Implementation ACTION",
    items: [
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/a-rare-disease-education-revolution-for-healthcare-professionals/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2021/10/20093208/New-Website-Blog-Image-Cards-11-2.png"
      },
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/access-to-medicines-solving-the-challenges-to-ensure-people-with-rare-conditions-can-access-vital-treatments/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2021/10/20093435/New-Website-Blog-Image-Cards-12-2.png"
      },
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/can-forward-thinking-genomic-and-screening-programmes-expedite-the-diagnostic-odyssey/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2021/10/20093100/New-Website-Blog-Image-Cards-10-3.png"
      },
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/turning-the-talk-into-action-we-must-have-robust-fit-for-purpose-and-funded-solutions-now/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2021/09/10160212/picture-1-edited.jpg"
      },
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/improving-care-for-people-living-with-rare-diseases-and-the-importance-of-a-multi-stakeholder-approach/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2021/10/20093537/New-Website-Blog-Image-Cards-13-2.png"
      },
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/creating-unity-and-equitable-consistency-across-the-home-nations-implementing-the-rare-diseases-framework/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2021/09/13160600/Ben-Allcock.jpg"
      },
      {
        title: "untitled",
        url: "https://rarerevolutionmagazine.com/media-centre/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2021/10/06160342/If-you-are-interested-in-sponsoring-a-digital-spotlight-click-here-to-arrange-a-call-with-our-team-3.png"
      }
    ]
  },
  {
    slug: "early-access",
    title: "Early Access",
    items: [
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/ethics-challenges-in-paediatric-access-to-innovative-experimental-treatments/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2021/10/19145444/New-Website-Blog-Image-Cards-31.png"
      },
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/early-access-essentials-for-the-rare-disease-community/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2021/04/19150555/New-Website-Blog-Image-Cards-4.png"
      },
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/patient-engagement-driving-success-in-early-access-programmes/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2021/09/14144940/Copy-of-Gusset_Victoria_Nicole_SMA-Schweiz_2019_2-scaled.jpg"
      },
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/patient-engagement-in-early-access/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2021/10/19145300/New-Website-Blog-Image-Cards-1-5.png"
      },
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/rising-above-the-confusion-to-streamline-access-a-patient-advocate-fellowship-in-early-access/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2021/10/19150149/New-Website-Blog-Image-Cards-3-6.png"
      },
      {
        title: "Digital Spotlights",
        url: "https://rarerevolutionmagazine.com/digitalspotlight/what-is-the-importance-of-real-world-data-within-early-access-for-rare-diseases/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2021/10/19150750/New-Website-Blog-Image-Cards-5-5.png"
      },
      {
        title: "untitled",
        url: "https://rarerevolutionmagazine.com/media-centre/",
        image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2021/10/06160342/If-you-are-interested-in-sponsoring-a-digital-spotlight-click-here-to-arrange-a-call-with-our-team-3.png"
      }
    ]
  }
];

const DIGITAL_SPOTLIGHT_COVER_URL =
  resolveRepositoryRootAssetUrl("/series/digital-spotlight/digital-spotlight-spread-title-page.png");

const DigitalSpotlightCoverHalf = ({ side }: { side: "left" | "right" }) => (
  <div
    className="h-full w-full overflow-hidden bg-white"
    role="img"
    aria-label={`Digital Spotlight opening spread, ${side} page`}
  >
    <div
      className="h-[101%] w-full -translate-y-[0.5%] bg-no-repeat"
      style={{
        backgroundImage: `url("${DIGITAL_SPOTLIGHT_COVER_URL}")`,
        backgroundSize: "200% 100%",
        backgroundPosition: side === "left" ? "left center" : "right center",
      }}
    />
  </div>
);

const DigitalSpotlightCoverLeftLayout = () => (
  <DigitalSpotlightCoverHalf side="left" />
);

const DigitalSpotlightCoverRightLayout = () => (
  <DigitalSpotlightCoverHalf side="right" />
);

const DigitalSpotlightIntroPage = ({
  section,
}: {
  section: DigitalSpotlightSection;
}) => (
  <div className="relative h-full w-full overflow-hidden bg-[#f8fbfc] text-[#17384b]">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(48,176,190,0.16),transparent_34%),radial-gradient(circle_at_88%_82%,rgba(48,176,190,0.18),transparent_36%),linear-gradient(180deg,#ffffff_0%,#f4fafb_100%)]" />
    <div className="relative flex h-full flex-col px-[44px] pb-[38px] pt-[38px]">
      <img
        src={resolveRepositoryRootAssetUrl("/images/brand/rare-revolution-trademark-logo.png")}
        alt="RARE Revolution Magazine"
        className="mb-8 h-auto w-[330px] object-contain object-left"
        draggable={false}
      />
      <p className="mb-3 text-[9px] font-bold uppercase tracking-[0.3em] text-[#30b0be]">
        Digital Spotlight
      </p>
      <h1 className="max-w-[410px] text-[43px] font-light leading-[0.96] tracking-[-0.045em] text-[#222d33]">
        {section.title}
      </h1>
      <div className="my-6 h-[3px] w-[116px] bg-[#30b0be]" />
      <p className="mb-5 max-w-[390px] text-[18px] font-medium leading-[1.25] text-[#263b45]">
        Focused insight, lived experience and practical information in one dedicated spotlight.
      </p>
      <div className="max-w-[390px] space-y-3 text-[12.5px] leading-[1.48] text-[#315064]">
        <p>
          This Digital Spotlight brings together specialist knowledge, community perspectives
          and practical resources focused on {section.title}.
        </p>
        <p>
          Explore diagnosis, care, research, treatment, advocacy and the everyday experiences
          of patients, families, clinicians and organisations working across this area.
        </p>
        <p>
          The complete article archive appears on the facing page and follows the order used
          by RARE Revolution Magazine.
        </p>
      </div>
      <div className="mt-auto flex items-center gap-3 pt-5">
        <div className="h-px flex-1 bg-[#d8e7ea]" />
        <span className="text-[8px] font-semibold uppercase tracking-[0.22em] text-[#30b0be]">
          RARE Revolution Magazine
        </span>
      </div>
    </div>
  </div>
);

const DigitalSpotlightArchivePage = ({
  section,
}: {
  section: DigitalSpotlightSection;
}) => (
  <SeriesSixCardArchive
    title={section.title}
    items={section.items}
    ariaLabel={`${section.title} Digital Spotlight article archive`}
  />
);

const DigitalSpotlightPscIntroLayout = () => (
  <DigitalSpotlightIntroPage section={DIGITAL_SPOTLIGHT_SECTIONS[0]} />
);

const DigitalSpotlightPscArchiveLayout = () => (
  <DigitalSpotlightArchivePage section={DIGITAL_SPOTLIGHT_SECTIONS[0]} />
);
const DigitalSpotlightNf1IntroLayout = () => (
  <DigitalSpotlightIntroPage section={DIGITAL_SPOTLIGHT_SECTIONS[1]} />
);

const DigitalSpotlightNf1ArchiveLayout = () => (
  <DigitalSpotlightArchivePage section={DIGITAL_SPOTLIGHT_SECTIONS[1]} />
);
const DigitalSpotlightRettIntroLayout = () => (
  <DigitalSpotlightIntroPage section={DIGITAL_SPOTLIGHT_SECTIONS[2]} />
);

const DigitalSpotlightRettArchiveLayout = () => (
  <DigitalSpotlightArchivePage section={DIGITAL_SPOTLIGHT_SECTIONS[2]} />
);
const DigitalSpotlightWaihaIntroLayout = () => (
  <DigitalSpotlightIntroPage section={DIGITAL_SPOTLIGHT_SECTIONS[3]} />
);

const DigitalSpotlightWaihaArchiveLayout = () => (
  <DigitalSpotlightArchivePage section={DIGITAL_SPOTLIGHT_SECTIONS[3]} />
);
const DigitalSpotlightPficIntroLayout = () => (
  <DigitalSpotlightIntroPage section={DIGITAL_SPOTLIGHT_SECTIONS[4]} />
);

const DigitalSpotlightPficArchiveLayout = () => (
  <DigitalSpotlightArchivePage section={DIGITAL_SPOTLIGHT_SECTIONS[4]} />
);
const DigitalSpotlightSmaIntroLayout = () => (
  <DigitalSpotlightIntroPage section={DIGITAL_SPOTLIGHT_SECTIONS[5]} />
);

const DigitalSpotlightSmaArchiveLayout = () => (
  <DigitalSpotlightArchivePage section={DIGITAL_SPOTLIGHT_SECTIONS[5]} />
);
const DigitalSpotlightSjogrensIntroLayout = () => (
  <DigitalSpotlightIntroPage section={DIGITAL_SPOTLIGHT_SECTIONS[6]} />
);

const DigitalSpotlightSjogrensArchiveLayout = () => (
  <DigitalSpotlightArchivePage section={DIGITAL_SPOTLIGHT_SECTIONS[6]} />
);
const DigitalSpotlightPbcIntroLayout = () => (
  <DigitalSpotlightIntroPage section={DIGITAL_SPOTLIGHT_SECTIONS[7]} />
);

const DigitalSpotlightPbcArchiveLayout = () => (
  <DigitalSpotlightArchivePage section={DIGITAL_SPOTLIGHT_SECTIONS[7]} />
);
const DigitalSpotlightThyroidEyeIntroLayout = () => (
  <DigitalSpotlightIntroPage section={DIGITAL_SPOTLIGHT_SECTIONS[8]} />
);

const DigitalSpotlightThyroidEyeArchiveLayout = () => (
  <DigitalSpotlightArchivePage section={DIGITAL_SPOTLIGHT_SECTIONS[8]} />
);
const DigitalSpotlightIgg4RdIntroLayout = () => (
  <DigitalSpotlightIntroPage section={DIGITAL_SPOTLIGHT_SECTIONS[9]} />
);

const DigitalSpotlightIgg4RdArchiveLayout = () => (
  <DigitalSpotlightArchivePage section={DIGITAL_SPOTLIGHT_SECTIONS[9]} />
);
const DigitalSpotlightFabryIntroLayout = () => (
  <DigitalSpotlightIntroPage section={DIGITAL_SPOTLIGHT_SECTIONS[10]} />
);

const DigitalSpotlightFabryArchiveLayout = () => (
  <DigitalSpotlightArchivePage section={DIGITAL_SPOTLIGHT_SECTIONS[10]} />
);
const DigitalSpotlightMyelofibrosisIntroLayout = () => (
  <DigitalSpotlightIntroPage section={DIGITAL_SPOTLIGHT_SECTIONS[11]} />
);

const DigitalSpotlightMyelofibrosisArchiveLayout = () => (
  <DigitalSpotlightArchivePage section={DIGITAL_SPOTLIGHT_SECTIONS[11]} />
);
const DigitalSpotlightAttrvIntroLayout = () => (
  <DigitalSpotlightIntroPage section={DIGITAL_SPOTLIGHT_SECTIONS[12]} />
);

const DigitalSpotlightAttrvArchiveLayout = () => (
  <DigitalSpotlightArchivePage section={DIGITAL_SPOTLIGHT_SECTIONS[12]} />
);
const DigitalSpotlightGlomerularIntroLayout = () => (
  <DigitalSpotlightIntroPage section={DIGITAL_SPOTLIGHT_SECTIONS[13]} />
);

const DigitalSpotlightGlomerularArchiveLayout = () => (
  <DigitalSpotlightArchivePage section={DIGITAL_SPOTLIGHT_SECTIONS[13]} />
);
const DigitalSpotlightAttpIntroLayout = () => (
  <DigitalSpotlightIntroPage section={DIGITAL_SPOTLIGHT_SECTIONS[14]} />
);

const DigitalSpotlightAttpArchiveLayout = () => (
  <DigitalSpotlightArchivePage section={DIGITAL_SPOTLIGHT_SECTIONS[14]} />
);
const DigitalSpotlightAavIntroLayout = () => (
  <DigitalSpotlightIntroPage section={DIGITAL_SPOTLIGHT_SECTIONS[15]} />
);

const DigitalSpotlightAavArchiveLayout = () => (
  <DigitalSpotlightArchivePage section={DIGITAL_SPOTLIGHT_SECTIONS[15]} />
);
const DigitalSpotlightApdsIntroLayout = () => (
  <DigitalSpotlightIntroPage section={DIGITAL_SPOTLIGHT_SECTIONS[16]} />
);

const DigitalSpotlightApdsArchiveLayout = () => (
  <DigitalSpotlightArchivePage section={DIGITAL_SPOTLIGHT_SECTIONS[16]} />
);
const DigitalSpotlightFtdIntroLayout = () => (
  <DigitalSpotlightIntroPage section={DIGITAL_SPOTLIGHT_SECTIONS[17]} />
);

const DigitalSpotlightFtdArchiveLayout = () => (
  <DigitalSpotlightArchivePage section={DIGITAL_SPOTLIGHT_SECTIONS[17]} />
);
const DigitalSpotlightGaucherIntroLayout = () => (
  <DigitalSpotlightIntroPage section={DIGITAL_SPOTLIGHT_SECTIONS[18]} />
);

const DigitalSpotlightGaucherArchiveLayout = () => (
  <DigitalSpotlightArchivePage section={DIGITAL_SPOTLIGHT_SECTIONS[18]} />
);
const DigitalSpotlightCdgIntroLayout = () => (
  <DigitalSpotlightIntroPage section={DIGITAL_SPOTLIGHT_SECTIONS[19]} />
);

const DigitalSpotlightCdgArchiveLayout = () => (
  <DigitalSpotlightArchivePage section={DIGITAL_SPOTLIGHT_SECTIONS[19]} />
);
const DigitalSpotlightAcromegalyIntroLayout = () => (
  <DigitalSpotlightIntroPage section={DIGITAL_SPOTLIGHT_SECTIONS[20]} />
);

const DigitalSpotlightAcromegalyArchiveLayout = () => (
  <DigitalSpotlightArchivePage section={DIGITAL_SPOTLIGHT_SECTIONS[20]} />
);
const DigitalSpotlightFrameworkActionIntroLayout = () => (
  <DigitalSpotlightIntroPage section={DIGITAL_SPOTLIGHT_SECTIONS[21]} />
);

const DigitalSpotlightFrameworkActionArchiveLayout = () => (
  <DigitalSpotlightArchivePage section={DIGITAL_SPOTLIGHT_SECTIONS[21]} />
);
const DigitalSpotlightEarlyAccessIntroLayout = () => (
  <DigitalSpotlightIntroPage section={DIGITAL_SPOTLIGHT_SECTIONS[22]} />
);

const DigitalSpotlightEarlyAccessArchiveLayout = () => (
  <DigitalSpotlightArchivePage section={DIGITAL_SPOTLIGHT_SECTIONS[22]} />
);

const rareSiblingsReportItems = [
  {
    title: "The impact of RARE disease on the sibling experience",
    url: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2023/01/20092626/The-impact-on-RARE-disease-on-siblings-1.pdf",
    image: resolveRepositoryAssetUrl("/images/rare-pages/rare-siblings-impact-report-cover.png")
  },
  {
    title: "RARE Siblings fact sheet 1",
    url: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2026/03/05110836/Siblings-campaign-phase-2-Fact-sheet-1.png",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2026/03/05110836/Siblings-campaign-phase-2-Fact-sheet-1.png"
  },
  {
    title: "RARE Siblings fact sheet 2",
    url: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2026/03/05110851/Siblings-campaign-phase-2-Fact-sheet-2.png",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2026/03/05110851/Siblings-campaign-phase-2-Fact-sheet-2.png"
  },
  {
    title: "RARE Siblings fact sheet 3",
    url: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2026/03/05110906/Siblings-campaign-phase-2-Fact-sheet-3.png",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2026/03/05110906/Siblings-campaign-phase-2-Fact-sheet-3.png"
  },
  {
    title: "RARE Siblings fact sheet 4",
    url: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2026/03/05110858/Siblings-campaign-phase-2-Fact-sheet-4.png",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2026/03/05110858/Siblings-campaign-phase-2-Fact-sheet-4.png"
  },
  {
    title: "RARE Siblings fact sheet 5",
    url: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2026/03/05110913/Siblings-campaign-phase-2-Fact-sheet-5.png",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2026/03/05110913/Siblings-campaign-phase-2-Fact-sheet-5.png"
  },
  {
    title: "RARE Siblings fact sheet 6",
    url: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2026/03/05110920/Siblings-campaign-phase-2-Fact-sheet-6.png",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2026/03/05110920/Siblings-campaign-phase-2-Fact-sheet-6.png"
  },
  {
    title: "RARE Siblings fact sheet 7",
    url: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2026/03/05110844/Siblings-campaign-phase-2-Fact-sheet-7.png",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2026/03/05110844/Siblings-campaign-phase-2-Fact-sheet-7.png"
  },
  {
    title: "RARE siblings aged 8–16",
    url: "https://www.youtube.com/watch?v=TQNt3GcKvow",
    image: "https://img.youtube.com/vi/TQNt3GcKvow/hqdefault.jpg"
  },
  {
    title: "RARE siblings aged 17+",
    url: "https://www.youtube.com/watch?v=IpZ9TKF2vVc",
    image: "https://img.youtube.com/vi/IpZ9TKF2vVc/hqdefault.jpg"
  },
  {
    title: "Parent perspective",
    url: "https://www.youtube.com/watch?v=Qzh2AE8OjEg",
    image: "https://img.youtube.com/vi/Qzh2AE8OjEg/hqdefault.jpg"
  }
] as const;

const rareResourcesItems = [
  {
    title: "Bereavement and financial planning",
    url: "https://rarerevolutionmagazine.com/downloads/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2023/10/05132937/Bereavement-and-Financial-Planning-.png"
  },
  {
    title: "10 Top Tips for RARE parents",
    url: "https://rarerevolutionmagazine.com/downloads/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2021/10/07104412/top-tips-from-rare-dads-for-rare-parents-final_orig.png"
  },
  {
    title: "10 Top Tips for RARE parents of RARE children",
    url: "https://rarerevolutionmagazine.com/downloads/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2021/10/07103400/top-tips-from-a-rare-mum-for-parents-of-rare-children-final_orig.png"
  },
  {
    title: "Top 10 Tips for RARE Healthcare Providers",
    url: "https://rarerevolutionmagazine.com/downloads/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2021/07/19144847/top_10_tips_final-1-scaled.jpeg"
  },
  {
    title: "Bereavement Advice — Navigating RARE Grief",
    url: "https://rarerevolutionmagazine.com/downloads/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2021/07/29121937/bereavement-advice-for-others-jpg_orig-1.jpg"
  },
  {
    title: "Bereavement Advice — Living with RARE Grief",
    url: "https://rarerevolutionmagazine.com/downloads/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2021/07/29122137/bereavement-advice-for-living-with-grief-jpg_orig-1.jpg"
  },
  {
    title: "10 Top Tips for RARE Employees",
    url: "https://rarerevolutionmagazine.com/downloads/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2021/07/29122305/employee-resource_orig-1.png"
  },
  {
    title: "10 Top Tips for RARE Employers",
    url: "https://rarerevolutionmagazine.com/downloads/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2021/07/29122403/employers-top-tip-image_orig-1.png"
  }
] as const;

const SeriesCoverHalf = ({
  side,
  imageUrl,
  label,
}: {
  side: "left" | "right";
  imageUrl: string;
  label: string;
}) => (
  <div
    className="h-full w-full overflow-hidden bg-white"
    role="img"
    aria-label={`${label}, ${side} page`}
  >
    <div
      className="h-[101%] w-full -translate-y-[0.5%] bg-no-repeat"
      style={{
        backgroundImage: `url("${imageUrl}")`,
        backgroundSize: "200% 100%",
        backgroundPosition: side === "left" ? "left center" : "right center",
      }}
    />
  </div>
);

const RareReportsCoverLeftLayout = () => (
  <SeriesCoverHalf
    side="left"
    imageUrl={resolveRepositoryRootAssetUrl("/series/rare-reports/rare-reports-spread-title-page.png")}
    label="RARE Reports opening spread"
  />
);

const RareReportsCoverRightLayout = () => (
  <SeriesCoverHalf
    side="right"
    imageUrl={resolveRepositoryRootAssetUrl("/series/rare-reports/rare-reports-spread-title-page.png")}
    label="RARE Reports opening spread"
  />
);

const ResourcesCoverLeftLayout = () => (
  <SeriesCoverHalf
    side="left"
    imageUrl="https://raw.githubusercontent.com/Joliel21/RRM/main/series-cover/resources.png"
    label="Resources opening spread"
  />
);

const ResourcesCoverRightLayout = () => (
  <SeriesCoverHalf
    side="right"
    imageUrl="https://raw.githubusercontent.com/Joliel21/RRM/main/series-cover/resources.png"
    label="Resources opening spread"
  />
);

const ShopCoverLeftLayout = () => (
  <SeriesCoverHalf
    side="left"
    imageUrl={resolveRepositoryRootAssetUrl("/images/ads/Shop_Rare.png")}
    label="Shop opening spread"
  />
);

const ShopCoverRightLayout = () => (
  <SeriesCoverHalf
    side="right"
    imageUrl={resolveRepositoryRootAssetUrl("/images/ads/Shop_Rare.png")}
    label="Shop opening spread"
  />
);

const RareSiblingsIntroLayout = () => (
  <StandardSeriesIntroLayout
    title="RARE Siblings"
    subtitle="The sibling experience deserves to be recognised, supported and heard."
    paragraphs={[
      "The impact of RARE disease on sibling experience report gives a voice to young people whose lives are shaped by rare disease within their families.",
      "Drawing on insights from 52 siblings aged 8–25 across the UK and USA, the report explores education, family life, relationships, emotional wellbeing and the often-unseen responsibilities carried by siblings.",
      "This series brings together the report, personal perspectives and practical recommendations designed to help families, charities, schools and support organisations better understand and nurture RARE siblings."
    ]}
  />
);

const ResourcesIntroLayout = () => (
  <StandardSeriesIntroLayout
    title="Resources"
    subtitle="Practical guidance created with and for the rare-disease community."
    paragraphs={[
      "RARE Resources brings together downloadable guidance developed through the collective experience of patients, advocates, carers, families and charities.",
      "The collection covers parenting, healthcare communication, bereavement, employment and other issues that shape everyday life with rare disease.",
      "Each resource is designed to be read, saved, printed and shared—turning lived experience into useful support for individuals, families, professionals and organisations."
    ]}
  />
);

const TitledSeriesArchive = ({
  title,
  items,
  ariaLabel,
}: {
  title: string;
  items: readonly { title: string; url: string; image: string }[];
  ariaLabel: string;
}) => (
  <div className="relative flex h-full w-full flex-col overflow-hidden bg-[#f6fafb] text-[#17384b]">
    <div className="shrink-0 border-b border-[#d8e7ea] bg-white px-8 pb-5 pt-7">
      <p className="mb-1 text-[9px] font-bold uppercase tracking-[0.27em] text-[#30b0be]">
        {title}
      </p>
      <h2 className="text-[28px] font-light leading-none tracking-[-0.035em] text-[#222d33]">
        Explore the series
      </h2>
      <p className="mt-2 text-[11px] text-[#54707d]">
        {items.length} items
      </p>
    </div>
    <div
      className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5"
      onWheel={(event) => event.stopPropagation()}
      onWheelCapture={(event) => event.stopPropagation()}
      onTouchMove={(event) => event.stopPropagation()}
      aria-label={ariaLabel}
    >
      <div className={SERIES_ARCHIVE_GRID_CLASS}>
        {items.map((item, index) => (
          <a
            key={`${item.url}-${index}`}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            download={/\.(pdf|png|jpe?g)(?:$|\?)/i.test(item.url) ? "" : undefined}
            title={item.title}
            aria-label={`Open ${item.title} in a new tab`}
            className={`${SERIES_ARCHIVE_CARD_CLASS} border-[#d7e7e9] focus-visible:ring-[#30b0be]`}
          >
            <div className={`${SERIES_ARCHIVE_IMAGE_FRAME_CLASS} bg-[#eef3f4]`}>
              <img
                src={item.image}
                alt=""
                className={SERIES_ARCHIVE_IMAGE_CLASS}
                loading={index < 4 ? "eager" : "lazy"}
                draggable={false}
              />
            </div>
            <div className={SERIES_ARCHIVE_BODY_CLASS}>
              <span className="mb-1.5 text-[8px] font-semibold uppercase tracking-[0.12em] text-[#30b0be]">
                {title}
              </span>
              <h3 className="line-clamp-3 text-[11px] font-semibold leading-[1.28] text-[#243b46]">
                {item.title}
              </h3>
            </div>
          </a>
        ))}
      </div>
    </div>
  </div>
);

const RareSiblingsArchiveLayout = () => (
  <TitledSeriesArchive
    title="RARE Siblings"
    items={rareSiblingsReportItems}
    ariaLabel="RARE Siblings report and video archive"
  />
);

const ResourcesArchiveLayout = () => (
  <TitledSeriesArchive
    title="Resources"
    items={rareResourcesItems}
    ariaLabel="RARE Resources downloadable archive"
  />
);


const CHARITY_PARTNERS_SPREAD_URL = resolveRepositoryAssetUrl("/images/rare-pages/charity-partners-spread.png");

const CharityPartnersSpreadHalf = ({
  side,
}: {
  side: "left" | "right";
}) => (
  <div
    className="h-full w-full overflow-hidden bg-white"
    role="img"
    aria-label={`RARE Revolution charity partners advertisement, ${side} page`}
  >
    <div
      className="h-full w-full bg-no-repeat"
      style={{
        backgroundImage: `url("${CHARITY_PARTNERS_SPREAD_URL}")`,
        backgroundSize: "200% 100%",
        backgroundPosition: side === "left" ? "left center" : "right center",
      }}
    />
  </div>
);

const CharityPartnersSpreadLeftLayout = () => (
  <CharityPartnersSpreadHalf side="left" />
);

const CharityPartnersSpreadRightLayout = () => (
  <CharityPartnersSpreadHalf side="right" />
);


const weblinksReferencesItems = [
  {
    url: "https://rarerevolutionmagazine.com/references-and-signposting-weblinks-for-rare-patient-partners-edition-014/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2021/10/08161442/20.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/digital-health-revolution-and-its-transformative-potential-for-rare-diseases-weblinks-and-references/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2021/10/14094025/Untitled-design-4.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/signposting-weblinks-for-mental-health-special-issue-012s/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2021/10/08161442/21.png"
  },
  {
    url: "https://rarerevolutionmagazine.com/improving-healthcare-communications/",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2021/01/11153307/New-Website-Blog-Image-Cards-9.png"
  }
] as const;

const WeblinksReferencesIntroLayout = () => (
  <StandardSeriesIntroLayout
    title={<>Weblinks &amp;<br />References</>}
    subtitle="Useful links, signposting and source material gathered for the rare-disease community."
    paragraphs={[
      "Weblinks & References brings together supporting information, practical signposting and trusted sources connected to key RARE Revolution features.",
      "These pages help readers continue exploring topics beyond the magazine, including healthcare communication, digital health, mental health and patient partnerships.",
      "Each article offers a focused collection of links and references designed to support further learning, advocacy and informed discussion."
    ]}
  />
);

const WeblinksReferencesArchiveLayout = () => (
  <SeriesSixCardArchive
    title="Weblinks & References"
    items={weblinksReferencesItems}
    ariaLabel="Weblinks and References article archive"
  />
);


const MEDIA_CENTRE_SPREAD_URL = resolveRepositoryAssetUrl("/images/rare-pages/media-centre-spread.png");

const MediaCentreSpreadHalf = ({
  side,
}: {
  side: "left" | "right";
}) => (
  <div
    className="h-full w-full overflow-hidden bg-white"
    role="img"
    aria-label={`RARE Revolution Media Centre spread, ${side} page`}
  >
    <div
      className="h-full w-full bg-no-repeat"
      style={{
        backgroundImage: `url("${MEDIA_CENTRE_SPREAD_URL}")`,
        backgroundSize: "200% 100%",
        backgroundPosition: side === "left" ? "left center" : "right center",
      }}
    />
  </div>
);

const MediaCentreSpreadLeftLayout = () => (
  <MediaCentreSpreadHalf side="left" />
);

const MediaCentreSpreadRightLayout = () => (
  <MediaCentreSpreadHalf side="right" />
);



const previousEditionItems = [
  {
    issue: 36,
    title: "RARE Skin",
    image: "https://rare-revolution-wp-images.s3.eu-west-1.amazonaws.com/wp-content/uploads/2026/07/10104850/RARE-Skin-Cover.png",
    url: "https://bit.ly/RARE-Skin-2026",
    source: "HAR original"
  },
  {
    issue: 35,
    title: "RARE Lysosomal",
    image: "https://raw.githubusercontent.com/Joliel21/RRM/main/previous/issue_035_rare_lysosomal.png",
    url: "https://bit.ly/RARE-lysosomal",
    source: "GitHub original"
  },
  {
    issue: 34,
    title: "RARE & Undiagnosed",
    image: "https://raw.githubusercontent.com/Joliel21/RRM/main/previous/issue_034_rare_and_undiagnosed.png",
    url: "https://bit.ly/RAREAndUndiagnosed",
    source: "GitHub original"
  },
  {
    issue: 33,
    title: "RARE & Social",
    image: "https://raw.githubusercontent.com/Joliel21/RRM/main/previous/issue_033_rare_and_social.png",
    url: "https://bit.ly/RAREandSOCIAL",
    source: "GitHub original"
  },
  {
    issue: 32,
    title: "RARE Neuromuscular",
    image: "https://raw.githubusercontent.com/Joliel21/RRM/main/previous/issue_032_rare_neuromuscular.png",
    url: "https://bit.ly/RARE-Neuromuscular",
    source: "GitHub original"
  },
  {
    issue: 31,
    title: "RARE Siblings",
    image: "https://raw.githubusercontent.com/Joliel21/RRM/main/previous/issue_031_rare_siblings.jpg",
    url: "https://bit.ly/RARE-Siblings",
    source: "GitHub original"
  },
  {
    issue: 30,
    title: "RARE Metabolic",
    image: "https://raw.githubusercontent.com/Joliel21/RRM/main/previous/issue_030_rare_metabolic.jpg",
    url: "https://bit.ly/RARE-Metabolic",
    source: "GitHub original"
  },
  {
    issue: 29,
    title: "RARE Mitochondria",
    image: "https://raw.githubusercontent.com/Joliel21/RRM/main/previous/issue_029_rare_mitochondria.png",
    url: "https://bit.ly/RARE-Mitochondria",
    source: "GitHub original"
  },
  {
    issue: 28,
    title: "RARE & Under-Funded",
    image: "https://raw.githubusercontent.com/Joliel21/RRM/main/previous/issue_028_summer_2024_rare_and_under_funded.png",
    url: "https://bit.ly/RARE-Summer-Issue2024",
    source: "GitHub original"
  },
  {
    issue: 27,
    title: "Women in RARE",
    image: "https://raw.githubusercontent.com/Joliel21/RRM/main/previous/issue_027_women_in_rare.jpg",
    url: "https://bit.ly/WomenInRARE",
    source: "GitHub original"
  },
  {
    issue: 26,
    title: "RARE Holistic Care",
    image: "https://raw.githubusercontent.com/Joliel21/RRM/main/previous/issue_026_rare_holistic_care.png",
    url: "https://bit.ly/RAREHolisticCare",
    source: "GitHub original"
  },
  {
    issue: 25,
    title: "RARE Ophthalmology",
    image: "https://raw.githubusercontent.com/Joliel21/RRM/main/previous/issue_025_rare_ophthalmology.png",
    url: "https://bit.ly/RAREOphthalmology",
    source: "GitHub original"
  },
  {
    issue: 24,
    title: "RARE Neurology",
    image: "https://raw.githubusercontent.com/Joliel21/RRM/main/previous/issue_024_rare_neurology.png",
    url: "https://rarerevolutionmagazine.com/previous-editions/",
    source: "GitHub original"
  },
  {
    issue: 23,
    title: "RARE Primary Immunodeficiency",
    image: "https://raw.githubusercontent.com/Joliel21/RRM/main/previous/issue_023_rare_primary_immunodeficiency.png",
    url: "https://rarerevolutionmagazine.com/previous-editions/",
    source: "GitHub original"
  },
  {
    issue: 22,
    title: "RARE Liver Disorders",
    image: "https://raw.githubusercontent.com/Joliel21/RRM/main/previous/issue_022_rare_liver_disorders.png",
    url: "https://rarerevolutionmagazine.com/previous-editions/",
    source: "GitHub original"
  },
  {
    issue: 21,
    title: "The Future of RARE",
    image: "https://raw.githubusercontent.com/Joliel21/RRM/main/previous/issue_021_the_future_of_rare.png",
    url: "https://rarerevolutionmagazine.com/previous-editions/",
    source: "GitHub original"
  },
  {
    issue: 20,
    title: "RARE & Equitable",
    image: "https://raw.githubusercontent.com/Joliel21/RRM/main/previous/issue_020_summer_2021_rare_and_equitable.jpg",
    url: "https://rarerevolutionmagazine.com/previous-editions/",
    source: "GitHub original"
  },
  {
    issue: 19,
    title: "RARE Bones",
    image: "https://raw.githubusercontent.com/Joliel21/RRM/main/previous/issue_019_spring_2021_rare_bones.jpg",
    url: "https://rarerevolutionmagazine.com/previous-editions/",
    source: "GitHub original"
  },
  {
    issue: 18,
    title: "RARE Transition",
    image: "https://raw.githubusercontent.com/Joliel21/RRM/main/previous/issue_018_winter_2020_21_rare_transition.jpg",
    url: "https://rarerevolutionmagazine.com/previous-editions/",
    source: "GitHub original"
  },
  {
    issue: 17,
    title: "RARE Epilepsy",
    image: "https://raw.githubusercontent.com/Joliel21/RRM/main/previous/issue_017_autumn_2020_rare_epilepsy.jpg",
    url: "https://rarerevolutionmagazine.com/previous-editions/",
    source: "GitHub original"
  },
  {
    issue: 16,
    title: "RARE Nephrology",
    image: "https://raw.githubusercontent.com/Joliel21/RRM/main/previous/issue_016_summer_2020_rare_nephrology.jpg",
    url: "https://rarerevolutionmagazine.com/previous-editions/",
    source: "GitHub original"
  },
  {
    issue: 15,
    title: "Professionals & Places",
    image: "https://raw.githubusercontent.com/Joliel21/RRM/main/previous/issue_015_spring_2020_professionals_and_places.jpg",
    url: "https://rarerevolutionmagazine.com/previous-editions/",
    source: "GitHub original"
  },
  {
    issue: 14,
    title: "RARE Patient Partners",
    image: "https://raw.githubusercontent.com/Joliel21/RRM/main/previous/issue_014_winter_2019_20_rare_patient_partners.jpg",
    url: "https://rarerevolutionmagazine.com/previous-editions/",
    source: "GitHub original"
  },
  {
    issue: 13,
    title: "RARE Gene Therapy",
    image: "https://raw.githubusercontent.com/Joliel21/RRM/main/previous/issue_013_autumn_2019_rare_gene_therapy.jpg",
    url: "https://rarerevolutionmagazine.com/previous-editions/",
    source: "GitHub original"
  },
  {
    issue: 12,
    title: "RARE Cancer",
    image: "https://raw.githubusercontent.com/Joliel21/RRM/main/previous/issue_012_summer_2019_rare_cancer.jpg",
    url: "https://rarerevolutionmagazine.com/previous-editions/",
    source: "GitHub original"
  },
  {
    issue: 11,
    title: "RARE Families",
    image: "https://raw.githubusercontent.com/Joliel21/RRM/main/previous/issue_011_spring_2019_rare_families.jpg",
    url: "https://rarerevolutionmagazine.com/previous-editions/",
    source: "GitHub original"
  },
  {
    issue: 10,
    title: "RARE Blood",
    image: "https://raw.githubusercontent.com/Joliel21/RRM/main/previous/issue_010_winter_2018_19_rare_blood.jpg",
    url: "https://rarerevolutionmagazine.com/previous-editions/",
    source: "GitHub original"
  },
  {
    issue: 9,
    title: "RARE Employment",
    image: "https://raw.githubusercontent.com/Joliel21/RRM/main/previous/issue_009_autumn_2018_rare_employment.jpg",
    url: "https://rarerevolutionmagazine.com/previous-editions/",
    source: "GitHub original"
  },
  {
    issue: 8,
    title: "RARE Senses",
    image: "https://raw.githubusercontent.com/Joliel21/RRM/main/previous/issue_008_summer_2018_rare_senses.jpg",
    url: "https://rarerevolutionmagazine.com/previous-editions/",
    source: "GitHub original"
  },
  {
    issue: 7,
    title: "RARE Babies",
    image: "https://raw.githubusercontent.com/Joliel21/RRM/main/previous/issue_007_spring_2018_rare_babies.jpg",
    url: "https://rarerevolutionmagazine.com/previous-editions/",
    source: "GitHub original"
  },
  {
    issue: 6,
    title: "RARE Minds",
    image: "https://raw.githubusercontent.com/Joliel21/RRM/main/previous/issue_006_winter_2017_rare_minds.jpg",
    url: "https://rarerevolutionmagazine.com/previous-editions/",
    source: "GitHub original"
  },
  {
    issue: 5,
    title: "RARE Science & Technology",
    image: "https://raw.githubusercontent.com/Joliel21/RRM/main/previous/issue_005_autumn_2017_rare_science_tech.jpg",
    url: "https://rarerevolutionmagazine.com/previous-editions/",
    source: "GitHub original"
  },
  {
    issue: 4,
    title: "RARE Skin",
    image: "https://raw.githubusercontent.com/Joliel21/RRM/main/previous/issue_004_summer_2017_rare_skin.jpg",
    url: "https://rarerevolutionmagazine.com/previous-editions/",
    source: "GitHub original"
  },
  {
    issue: 3,
    title: "RARE Corporate",
    image: "https://raw.githubusercontent.com/Joliel21/RRM/main/previous/issue_003_spring_2017_rare_corporate.png",
    url: "https://rarerevolutionmagazine.com/previous-editions/",
    source: "GitHub original"
  },
  {
    issue: 2,
    title: "Ultra RARE",
    image: "https://raw.githubusercontent.com/Joliel21/RRM/main/previous/issue_002_winter_2016_ultra_rare.jpg",
    url: "https://rarerevolutionmagazine.com/previous-editions/",
    source: "GitHub original"
  },
  {
    issue: 1,
    title: "RARE Education",
    image: "https://raw.githubusercontent.com/Joliel21/RRM/main/previous/issue_001_autumn_2016_rare_education.jpg",
    url: "https://rarerevolutionmagazine.com/previous-editions/",
    source: "GitHub original"
  }
] as const;

const previousEditionLatest = previousEditionItems[0];

const PreviousEditionsIntroLayout = () => (
  <div className="relative h-full w-full overflow-hidden bg-white text-[#17384b]">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_10%,rgba(48,176,190,0.13),transparent_32%),linear-gradient(180deg,#ffffff_0%,#f7fbfc_100%)]" />
    <div className="relative flex h-full flex-col px-[44px] pb-[36px] pt-[34px]">
      <img
        src={resolveRepositoryRootAssetUrl("/images/brand/rare-revolution-trademark-logo.png")}
        alt="RARE Revolution Magazine"
        className="mb-10 h-auto w-[230px] object-contain object-left"
        draggable={false}
      />
      <div className="flex max-w-[470px] flex-1 flex-col">
        <p className="mb-3 text-[9px] font-bold uppercase tracking-[0.28em] text-[#30b0be]">
          Magazine archive
        </p>
        <h1 className="text-[58px] font-light uppercase leading-[0.88] tracking-[-0.055em] text-[#111]">
          Previous
          <br />
          <span className="text-[#30b0be]">Editions</span>
        </h1>
        <div className="my-7 h-[3px] w-[118px] bg-[#30b0be]" />
        <p className="mb-6 text-[18px] font-medium leading-[1.28] text-[#263b45]">
          The complete RARE Revolution Magazine collection.
        </p>
        <div className="space-y-4 text-[13px] leading-[1.58] text-[#315064]">
          <p>
            Explore past issues featuring lived experience, expert insight, community
            action, research, advocacy and practical support.
          </p>
          <p>
            The archive follows publication order, newest first. Open any cover on the
            facing page to continue reading online.
          </p>
          <p>
            Together, these editions document the changing rare-disease landscape and
            the people working to make it better.
          </p>
        </div>
        <div className="mt-auto border-t border-[#d8e7ea] pt-5">
          <p className="text-[11px] font-semibold leading-[1.45] text-[#0f7f8e]">
            Because every story matters. Because rare is many.
          </p>
        </div>
      </div>
    </div>
  </div>
);

const PreviousEditionsArchiveLayout = () => (
  <div className="relative flex h-full w-full flex-col overflow-hidden bg-[#f7fbfc] text-[#17384b]">
    <div className="shrink-0 border-b border-[#d8e7ea] bg-white px-7 pb-4 pt-6 text-center">
      <h2 className="text-[25px] font-light uppercase tracking-[0.02em] text-[#0f7f8e]">
        Explore our past editions
      </h2>
      <p className="mt-1 text-[10px] text-[#54707d]">
        Two editions per row. Scroll to browse the full collection.
      </p>
    </div>

    <div
      className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5"
      style={{ direction: "rtl" }}
      onWheel={(event) => event.stopPropagation()}
      onWheelCapture={(event) => event.stopPropagation()}
      onTouchMove={(event) => event.stopPropagation()}
      aria-label="Scrollable previous editions archive"
    >
      <div
        className="grid grid-cols-2 gap-x-5 gap-y-6"
        style={{ direction: "ltr" }}
      >
        {previousEditionItems.map((item, index) => (
          <a
            key={item.issue}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group overflow-hidden rounded-[14px] border border-[#d7e7e9] bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#30b0be]"
            aria-label={`Open Issue ${item.issue}: ${item.title}`}
          >
            <div className="aspect-square overflow-hidden rounded-[10px] bg-[#eef3f4] p-3">
              <img
                src={item.image}
                alt={`Issue ${item.issue} cover`}
                className="h-full w-full object-contain"
                loading={index < 4 ? "eager" : "lazy"}
                draggable={false}
              />
            </div>
            <div className="px-1 pb-1 pt-3">
              <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-[#30b0be]">
                Issue {String(item.issue).padStart(3, "0")}
              </p>
              <p className="mt-1 line-clamp-2 text-[11px] font-semibold leading-[1.3] text-[#243b46]">
                {item.title}
              </p>
            </div>
          </a>
        ))}
      </div>
    </div>
  </div>
);




const spotlightEditionItems = [
  {
    label: "Special edition 019",
    title: "Rett syndrome",
    image: resolveRepositoryAssetUrl("/images/spotlight-editions/spotlight-019-rett.png"),
    url: "https://rarerevolutionmagazine.com/spotlight-editions/"
  },
  {
    label: "Special edition 018",
    title: "Systemic mastocytosis",
    image: resolveRepositoryAssetUrl("/images/spotlight-editions/spotlight-018-mastocytosis.png"),
    url: "https://rarerevolutionmagazine.com/spotlight-editions/"
  },
  {
    label: "Special edition 017",
    title: "CSL Behring spotlight",
    image: resolveRepositoryAssetUrl("/images/spotlight-editions/spotlight-017-csl.jpg"),
    url: "https://rarerevolutionmagazine.com/spotlight-editions/"
  },
  {
    label: "Special edition 016",
    title: "Rare Disease Day 2025",
    image: resolveRepositoryAssetUrl("/images/spotlight-editions/spotlight-016-rdd-2025.png"),
    url: "https://rarerevolutionmagazine.com/spotlight-editions/"
  },
  {
    label: "Special edition 015",
    title: "Rare Disease Day 2024",
    image: resolveRepositoryAssetUrl("/images/spotlight-editions/spotlight-015-rdd-2024.png"),
    url: "https://rarerevolutionmagazine.com/spotlight-editions/"
  },
  {
    label: "Special edition 014",
    title: "CSL Behring Spotlight",
    image: resolveRepositoryAssetUrl("/images/spotlight-editions/spotlight-014-csl.png"),
    url: "https://rarerevolutionmagazine.com/spotlight-editions/"
  },
  {
    label: "Special edition 013",
    title: "Rare and chronic autoimmune diseases",
    image: resolveRepositoryAssetUrl("/images/spotlight-editions/spotlight-013-autoimmune.png"),
    url: "https://rarerevolutionmagazine.com/spotlight-editions/"
  },
  {
    label: "Special edition 012",
    title: "Newborn screening",
    image: resolveRepositoryAssetUrl("/images/spotlight-editions/spotlight-012-newborn.png"),
    url: "https://rarerevolutionmagazine.com/spotlight-editions/"
  },
  {
    label: "Special edition 011",
    title: "Hereditary Angioedema",
    image: resolveRepositoryAssetUrl("/images/spotlight-editions/spotlight-011-hae.png"),
    url: "https://rarerevolutionmagazine.com/spotlight-editions/"
  },
  {
    label: "Third Edition",
    title: "CSL Behring Spotlight",
    image: resolveRepositoryAssetUrl("/images/spotlight-editions/spotlight-third-csl.jpg"),
    url: "https://rarerevolutionmagazine.com/spotlight-editions/"
  },
  {
    label: "Special edition 009",
    title: "Long Term Caregiving",
    image: resolveRepositoryAssetUrl("/images/spotlight-editions/spotlight-009-caregiving.png"),
    url: "https://rarerevolutionmagazine.com/spotlight-editions/"
  },
  {
    label: "Special edition 008",
    title: "RDD Spotlight edition – Innovation and research",
    image: resolveRepositoryAssetUrl("/images/spotlight-editions/spotlight-008-innovation.png"),
    url: "https://rarerevolutionmagazine.com/spotlight-editions/"
  },
  {
    label: "Second Edition",
    title: "CSL Behring Spotlight",
    image: resolveRepositoryAssetUrl("/images/spotlight-editions/spotlight-second-csl.jpg"),
    url: "https://rarerevolutionmagazine.com/spotlight-editions/"
  },
  {
    label: "First Edition",
    title: "CSL Behring Spotlight",
    image: resolveRepositoryAssetUrl("/images/spotlight-editions/spotlight-first-csl.jpg"),
    url: "https://rarerevolutionmagazine.com/spotlight-editions/"
  },
  {
    label: "Clinigen Digital spotlight",
    title: "Early access in rare disease",
    image: resolveRepositoryAssetUrl("/images/spotlight-editions/spotlight-clinigen.jpg"),
    url: "https://rarerevolutionmagazine.com/spotlight-editions/"
  },
  {
    label: "Issue 018",
    title: "February 2021 Rare Disease Day 21",
    image: resolveRepositoryAssetUrl("/images/spotlight-editions/spotlight-rdd-2021.png"),
    url: "https://rarerevolutionmagazine.com/spotlight-editions/"
  },
  {
    label: "Issue 017",
    title: "November 2020 Familial chylomicronaemia syndrome",
    image: resolveRepositoryAssetUrl("/images/spotlight-editions/spotlight-fcs.png"),
    url: "https://rarerevolutionmagazine.com/spotlight-editions/"
  },
  {
    label: "Issue 015",
    title: "May 2020 ANCA-associated Vasculitis",
    image: resolveRepositoryAssetUrl("/images/spotlight-editions/spotlight-aav.png"),
    url: "https://rarerevolutionmagazine.com/spotlight-editions/"
  },
  {
    label: "Issue 014",
    title: "February 2020 Rare Disease Day 20",
    image: resolveRepositoryAssetUrl("/images/spotlight-editions/spotlight-rdd-2020.png"),
    url: "https://rarerevolutionmagazine.com/spotlight-editions/"
  },
  {
    label: "Issue 012",
    title: "October 2019 Mental Health Special",
    image: resolveRepositoryAssetUrl("/images/spotlight-editions/spotlight-mental-health.png"),
    url: "https://rarerevolutionmagazine.com/spotlight-editions/"
  },
  {
    label: "Issue 010",
    title: "February 2019 Rare Disease Day 19",
    image: resolveRepositoryAssetUrl("/images/spotlight-editions/spotlight-rdd-2019.png"),
    url: "https://rarerevolutionmagazine.com/spotlight-editions/"
  }
] as const;

const SpotlightEditionsIntroLayout = () => (
  <div className="relative h-full w-full overflow-hidden bg-white text-[#17384b]">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_88%_14%,rgba(48,176,190,0.15),transparent_34%),radial-gradient(circle_at_12%_86%,rgba(20,77,124,0.09),transparent_36%),linear-gradient(180deg,#ffffff_0%,#f6fafb_100%)]" />
    <div className="relative flex h-full flex-col px-[44px] pb-[36px] pt-[34px]">
      <img
        src={resolveRepositoryRootAssetUrl("/images/brand/rare-revolution-trademark-logo.png")}
        alt="RARE Revolution Magazine"
        className="mb-10 h-auto w-[230px] object-contain object-left"
        draggable={false}
      />
      <div className="flex max-w-[475px] flex-1 flex-col">
        <p className="mb-3 text-[9px] font-bold uppercase tracking-[0.28em] text-[#30b0be]">
          Special collections
        </p>
        <h1 className="text-[55px] font-light uppercase leading-[0.9] tracking-[-0.05em] text-[#111]">
          Spotlight
          <br />
          <span className="text-[#30b0be]">Editions</span>
        </h1>
        <div className="my-7 h-[3px] w-[118px] bg-[#30b0be]" />
        <p className="mb-6 text-[18px] font-medium leading-[1.28] text-[#263b45]">
          Dedicated editions that bring focused rare-disease topics into view.
        </p>
        <div className="space-y-4 text-[13px] leading-[1.58] text-[#315064]">
          <p>
            Spotlight Editions explore individual conditions, awareness moments and
            priority issues through patient stories, clinical insight, advocacy,
            research and practical information.
          </p>
          <p>
            The collection follows the order used on the RARE Revolution website,
            beginning with the newest special edition.
          </p>
          <p>
            Browse the archive on the facing page and open any edition to continue online.
          </p>
        </div>
        <div className="mt-auto border-t border-[#d8e7ea] pt-5">
          <p className="text-[11px] font-semibold leading-[1.45] text-[#0f7f8e]">
            Focused stories. Deeper understanding. Stronger communities.
          </p>
        </div>
      </div>
    </div>
  </div>
);

const SpotlightEditionsArchiveLayout = () => (
  <div className="relative flex h-full w-full flex-col overflow-hidden bg-[#f7fbfc] text-[#17384b]">
    <div className="shrink-0 border-b border-[#d8e7ea] bg-white px-7 pb-4 pt-6 text-center">
      <h2 className="text-[25px] font-light uppercase tracking-[0.02em] text-[#0f7f8e]">
        Explore Spotlight Editions
      </h2>
      <p className="mt-1 text-[10px] text-[#54707d]">
        Two editions per row. Scroll to browse the full collection.
      </p>
    </div>
    <div
      className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5"
      onWheel={(event) => event.stopPropagation()}
      onWheelCapture={(event) => event.stopPropagation()}
      onTouchMove={(event) => event.stopPropagation()}
      aria-label="Scrollable Spotlight Editions archive"
    >
      <div className="grid grid-cols-2 gap-x-5 gap-y-6">
        {spotlightEditionItems.map((item, index) => (
          <a
            key={`${item.label}-${item.title}`}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group overflow-hidden rounded-[14px] border border-[#d7e7e9] bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#30b0be]"
            aria-label={`Open ${item.label}: ${item.title}`}
          >
            <div className="aspect-square overflow-hidden rounded-[10px] bg-[#eef3f4] p-2">
              <img
                src={item.image}
                alt={`${item.title} cover`}
                className="h-full w-full object-contain"
                loading={index < 4 ? "eager" : "lazy"}
                draggable={false}
              />
            </div>
            <div className="px-1 pb-1 pt-3">
              <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-[#30b0be]">
                {item.label}
              </p>
              <p className="mt-1 line-clamp-3 text-[11px] font-semibold leading-[1.3] text-[#243b46]">
                {item.title}
              </p>
            </div>
          </a>
        ))}
      </div>
    </div>
  </div>
);

const RARE_YOUTH_SPREAD_URL = resolveRepositoryRootAssetUrl("/images/ads/rare-youth.png");

const RareYouthAdHalf = ({ side }: { side: "left" | "right" }) => (
  <div
    className="h-full w-full overflow-hidden bg-white"
    role="img"
    aria-label={`Rare Youth Revolution advertisement, ${side} page`}
  >
    <div
      className="h-full w-full bg-no-repeat"
      style={{
        backgroundImage: `url("${RARE_YOUTH_SPREAD_URL}")`,
        backgroundSize: "200% 100%",
        backgroundPosition: side === "left" ? "left -1.5%" : "right -1.5%",
      }}
    />
  </div>
);

const RareYouthAdLeftLayout = () => <RareYouthAdHalf side="left" />;
const RareYouthAdRightLayout = () => <RareYouthAdHalf side="right" />;

const BlankPageLayout = () => (
  <div
    className="h-full w-full"
    aria-label="Blank magazine page"
    style={{ background: "transparent" }}
  />
);

export const LAYOUT_REGISTRY: Record<
  string,
  React.ComponentType<PageLayoutProps>
> = {
  "patient-voice-intro": PatientVoiceIntroLayout,
  "spotlight-editions-intro": SpotlightEditionsIntroLayout,
  "spotlight-editions-archive": SpotlightEditionsArchiveLayout,
  "previous-editions-intro": PreviousEditionsIntroLayout,
  "previous-editions-archive": PreviousEditionsArchiveLayout,
  "media-centre-spread-left": MediaCentreSpreadLeftLayout,
  "media-centre-spread-right": MediaCentreSpreadRightLayout,
  "weblinks-references-intro": WeblinksReferencesIntroLayout,
  "weblinks-references-archive": WeblinksReferencesArchiveLayout,
  "charity-partners-spread-left": CharityPartnersSpreadLeftLayout,
  "charity-partners-spread-right": CharityPartnersSpreadRightLayout,
  "rare-reports-cover-left": RareReportsCoverLeftLayout,
  "rare-reports-cover-right": RareReportsCoverRightLayout,
  "rare-siblings-intro": RareSiblingsIntroLayout,
  "rare-siblings-archive": RareSiblingsArchiveLayout,
  "resources-cover-left": ResourcesCoverLeftLayout,
  "resources-cover-right": ResourcesCoverRightLayout,
  "resources-intro": ResourcesIntroLayout,
  "resources-archive": ResourcesArchiveLayout,
  "shop-cover-left": ShopCoverLeftLayout,
  "shop-cover-right": ShopCoverRightLayout,
  "digital-spotlight-cover-left": DigitalSpotlightCoverLeftLayout,
  "digital-spotlight-cover-right": DigitalSpotlightCoverRightLayout,
  "digital-spotlight-psc-intro": DigitalSpotlightPscIntroLayout,
  "digital-spotlight-psc-archive": DigitalSpotlightPscArchiveLayout,
  "digital-spotlight-nf1-intro": DigitalSpotlightNf1IntroLayout,
  "digital-spotlight-nf1-archive": DigitalSpotlightNf1ArchiveLayout,
  "digital-spotlight-rett-intro": DigitalSpotlightRettIntroLayout,
  "digital-spotlight-rett-archive": DigitalSpotlightRettArchiveLayout,
  "digital-spotlight-waiha-intro": DigitalSpotlightWaihaIntroLayout,
  "digital-spotlight-waiha-archive": DigitalSpotlightWaihaArchiveLayout,
  "digital-spotlight-pfic-intro": DigitalSpotlightPficIntroLayout,
  "digital-spotlight-pfic-archive": DigitalSpotlightPficArchiveLayout,
  "digital-spotlight-sma-intro": DigitalSpotlightSmaIntroLayout,
  "digital-spotlight-sma-archive": DigitalSpotlightSmaArchiveLayout,
  "digital-spotlight-sjogrens-intro": DigitalSpotlightSjogrensIntroLayout,
  "digital-spotlight-sjogrens-archive": DigitalSpotlightSjogrensArchiveLayout,
  "digital-spotlight-pbc-intro": DigitalSpotlightPbcIntroLayout,
  "digital-spotlight-pbc-archive": DigitalSpotlightPbcArchiveLayout,
  "digital-spotlight-thyroid-eye-intro": DigitalSpotlightThyroidEyeIntroLayout,
  "digital-spotlight-thyroid-eye-archive": DigitalSpotlightThyroidEyeArchiveLayout,
  "digital-spotlight-igg4-rd-intro": DigitalSpotlightIgg4RdIntroLayout,
  "digital-spotlight-igg4-rd-archive": DigitalSpotlightIgg4RdArchiveLayout,
  "digital-spotlight-fabry-intro": DigitalSpotlightFabryIntroLayout,
  "digital-spotlight-fabry-archive": DigitalSpotlightFabryArchiveLayout,
  "digital-spotlight-myelofibrosis-intro": DigitalSpotlightMyelofibrosisIntroLayout,
  "digital-spotlight-myelofibrosis-archive": DigitalSpotlightMyelofibrosisArchiveLayout,
  "digital-spotlight-attrv-intro": DigitalSpotlightAttrvIntroLayout,
  "digital-spotlight-attrv-archive": DigitalSpotlightAttrvArchiveLayout,
  "digital-spotlight-glomerular-intro": DigitalSpotlightGlomerularIntroLayout,
  "digital-spotlight-glomerular-archive": DigitalSpotlightGlomerularArchiveLayout,
  "digital-spotlight-attp-intro": DigitalSpotlightAttpIntroLayout,
  "digital-spotlight-attp-archive": DigitalSpotlightAttpArchiveLayout,
  "digital-spotlight-aav-intro": DigitalSpotlightAavIntroLayout,
  "digital-spotlight-aav-archive": DigitalSpotlightAavArchiveLayout,
  "digital-spotlight-apds-intro": DigitalSpotlightApdsIntroLayout,
  "digital-spotlight-apds-archive": DigitalSpotlightApdsArchiveLayout,
  "digital-spotlight-ftd-intro": DigitalSpotlightFtdIntroLayout,
  "digital-spotlight-ftd-archive": DigitalSpotlightFtdArchiveLayout,
  "digital-spotlight-gaucher-intro": DigitalSpotlightGaucherIntroLayout,
  "digital-spotlight-gaucher-archive": DigitalSpotlightGaucherArchiveLayout,
  "digital-spotlight-cdg-intro": DigitalSpotlightCdgIntroLayout,
  "digital-spotlight-cdg-archive": DigitalSpotlightCdgArchiveLayout,
  "digital-spotlight-acromegaly-intro": DigitalSpotlightAcromegalyIntroLayout,
  "digital-spotlight-acromegaly-archive": DigitalSpotlightAcromegalyArchiveLayout,
  "digital-spotlight-framework-action-intro": DigitalSpotlightFrameworkActionIntroLayout,
  "digital-spotlight-framework-action-archive": DigitalSpotlightFrameworkActionArchiveLayout,
  "digital-spotlight-early-access-intro": DigitalSpotlightEarlyAccessIntroLayout,
  "digital-spotlight-early-access-archive": DigitalSpotlightEarlyAccessArchiveLayout,
  "reviews-intro": ReviewsIntroLayout,
  "people-of-rare-spread-left": PeopleOfRareSpreadLeftLayout,
  "people-of-rare-spread-right": PeopleOfRareSpreadRightLayout,
  "ceo-series-intro": CeoSeriesIntroLayout,
  "ceo-series-archive": CeoSeriesArchiveLayout,
  "patient-engagement-series-intro": PatientEngagementSeriesIntroLayout,
  "patient-engagement-series-archive": PatientEngagementSeriesArchiveLayout,
  "rare-entrepreneur-series-intro": RareEntrepreneurSeriesIntroLayout,
  "rare-entrepreneur-series-archive": RareEntrepreneurSeriesArchiveLayout,
  "reviews-archive": ReviewsArchiveLayout,
  "science-tech-intro": ScienceTechIntroLayout,
  "science-tech-archive": ScienceTechArchiveLayout,
  "sunday-sessions-intro": SundaySessionsIntroLayout,
  "sunday-sessions-archive": SundaySessionsArchiveLayout,
  "travel-series-intro": TravelSeriesIntroLayout,
  "travel-series-archive": TravelSeriesArchiveLayout,
  "turning-the-tide-intro": TurningTheTideIntroLayout,
  "turning-the-tide-archive-one": TurningTheTideArchiveOneLayout,
  "turning-the-tide-archive-two": TurningTheTideArchiveTwoLayout,
  "rare-ramblings-intro": RareRamblingsIntroLayout,
  "rare-ramblings-archive": RareRamblingsArchiveLayout,
  "rare-rev-inar-intro": RareRevInarIntroLayout,
  "rare-rev-inar-archive": RareRevInarArchiveLayout,
  "patient-voice-archive": PatientVoiceArchiveLayout,
  "rare-caregiving-intro": RareCaregivingIntroLayout,
  "rare-caregiving-archive": RareCaregivingArchiveLayout,
  "rare-youth-ad-left": RareYouthAdLeftLayout,
  "rare-youth-ad-right": RareYouthAdRightLayout,
  "blank-page": BlankPageLayout,
  "article-image-layout": ArticleImageLayout,
  "article-title-layout": ArticleTitleLayout,
  "article-text-layout": ArticleTextLayout,
  "breathtaking-awareness-ad": BreathtakingAwarenessAdLayout,
  "article-layout": ArticleLayout,
  "inside-cover": InsideCoverLayout,
  "inside-back-cover": InsideBackCoverLayout,
  "page-1": Page1Layout,
  "whats-inside-left-page": WhatsInsideLeftPageLayout,
  "whats-inside-right-page": WhatsInsideRightPageLayout,
  "volume-one-page": ArticleTextLayout,
  "section-divider": SectionDividerLayout,
  "christina-feature": ChristinaFeatureLayout,
  "editorial-team-page-86": EditorialTeamPage86Layout,
  "editorial-team-page-87": EditorialTeamPage87Layout,
  "community-gallery-page-98": CommunityGalleryPage98,
  "community-gallery-page-99": CommunityGalleryPage99,
  "community-gallery-page-100": CommunityGalleryPage100,
  "community-gallery-page-101": CommunityGalleryPage101,
  "community-gallery-page-102": CommunityGalleryPage102,
  "community-gallery-page-103": CommunityGalleryPage103,
  "rare-insights-page-92": RareInsightsPage92Layout,
  "rare-insights-page-93": RareInsightsPage93Layout,
  "rare-insights-page-94": RareInsightsPage94Layout,
  "rare-insights-page-95": RareInsightsPage95Layout,
  "a-day-in-life-intro": ADayInLifeIntroLayout,
  "a-day-in-life-scroll": ADayInLifeScrollLayout,
  "charity-advocacy-intro": CharityAdvocacyIntroLayout,
  "charity-advocacy-archive": CharityAdvocacyArchiveLayout,
  "industry-insights-intro": IndustryInsightsIntroLayout,
  "industry-insights-archive": IndustryInsightsArchiveLayout,
  "news-press-intro": NewsPressReleasesIntroLayout,
  "news-press-quarter": NewsPressReleasesQuarterLayout,
  "news-press-middle": NewsPressReleasesMiddleLayout,
  "news-press-final": NewsPressReleasesFinalLayout,
  "medical-intro": MedicalIntroLayout,
  "medical-archive": MedicalArchiveLayout,
  "editors-letters-left": EditorsLettersLeftLayout,
  "editors-letters-right": EditorsLettersRightLayout,
};