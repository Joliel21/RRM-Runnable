import React from "react";

interface MagazineCoverContext {
  brandLine1?: string;
  brandLine2?: string;
  title?: string;
  volume?: string;
  logoUrl?: string;
  logoAlt?: string;
}

interface MagazineCoverProps {
  issueTitle?: string;
  className?: string;
  coverContext?: MagazineCoverContext;
}

const MAIN_TITLE_FONT_SIZE = "4.5rem";
const ISSUE_TITLE_FONT_SIZE = "1.5rem";

function CoverLogo({
  logoUrl,
  logoAlt,
}: {
  logoUrl?: string;
  logoAlt?: string;
}) {
  if (!logoUrl) return null;

  return (
    <img
      src={logoUrl}
      alt={logoAlt || ""}
      className="mt-1"
      style={{
        width: "170px",
        height: "auto",
        objectFit: "contain",
      }}
    />
  );
}

function toTitleCase(text: string) {
  return text
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export const MagazineCover: React.FC<MagazineCoverProps> = ({
  issueTitle = "",
  className = "",
  coverContext,
}) => {
  const brandLine1 = coverContext?.brandLine1 || "";
  const brandLine2 = coverContext?.brandLine2 || "";
  const title = coverContext?.title || issueTitle || "";
  const volume = coverContext?.volume || "";

  return (
    <div
      className={`relative w-full h-full bg-[var(--brand-ink)] ${className}`}
      style={{ width: "100%", height: "100%" }}
    >
      <div className="relative w-full h-full flex flex-col items-center justify-center bg-[var(--brand-ink)] overflow-hidden text-center">
        <div className="absolute inset-0 bg-[var(--brand-ink)]" />

        <div
          className="absolute inset-0 opacity-90"
          style={{
            background:
              "radial-gradient(circle at 80% 18%, rgba(43,155,192,0.16), transparent 34%), radial-gradient(circle at 12% 82%, rgba(0,95,115,0.22), transparent 38%), linear-gradient(180deg, #01101C 0%, var(--brand-ink) 48%, #01101C 100%)",
          }}
        />

        <div className="absolute left-[64px] top-[72px] h-[1px] w-[130px] bg-[var(--brand-accent)]/65 z-10" />
        <div className="absolute -right-[120px] top-[-110px] h-[330px] w-[330px] rounded-full border border-[var(--brand-secondary)]/35 z-10" />
        <div className="absolute -left-[160px] bottom-[-150px] h-[360px] w-[360px] rounded-full border border-[var(--brand-secondary)]/32 z-10" />
        <div className="absolute bottom-[24px] right-[-42px] h-[1px] w-[210px] rotate-[-45deg] bg-[var(--brand-accent)]/75 z-10" />

        <div className="absolute z-20 left-0 right-0 top-[118px] flex flex-col items-center w-full px-10">
          <h1
            className="flex flex-col gap-4 text-center tracking-widest"
            style={{
              color: "var(--brand-accent)",
              textShadow: "0 3px 12px rgba(0,0,0,0.75)",
            }}
          >
            <span
              style={{
                fontFamily: "'Pinyon Script', var(--font-serif-primary), serif",
                fontSize: MAIN_TITLE_FONT_SIZE,
                lineHeight: 1.05,
                fontWeight: 400,
                display: "block",
              }}
            >
              {toTitleCase(brandLine1)}
            </span>

            <span
              style={{
                fontFamily: "'Pinyon Script', var(--font-serif-primary), serif",
                fontSize: MAIN_TITLE_FONT_SIZE,
                lineHeight: 1.05,
                fontWeight: 400,
                display: "block",
              }}
            >
              {toTitleCase(brandLine2)}
            </span>
          </h1>

          <div className="w-[260px] h-[2px] bg-[var(--brand-accent)] mt-12 mb-4" />

          <h2
            className="text-center"
            style={{
              color: "var(--brand-surface)",
              fontFamily:
                "var(--font-serif-primary), Georgia, 'Times New Roman', serif",
              fontSize: ISSUE_TITLE_FONT_SIZE,
              lineHeight: 1.08,
              fontWeight: 200,
              textShadow: "0 3px 12px rgba(0,0,0,0.75)",
            }}
          >
            {title}
          </h2>

          <div className="w-[150px] h-[1px] bg-[var(--brand-accent)]/75 mt-8 mb-3" />

          <div
            className="text-center uppercase"
            style={{
              color: "var(--brand-surface)",
              fontFamily: "'Arial Narrow', Arial, sans-serif",
              fontSize: "0.86rem",
              lineHeight: 1.2,
              fontWeight: 700,
              letterSpacing: "0.18em",
              textShadow: "0 3px 12px rgba(0,0,0,0.75)",
            }}
          >
            {volume}
          </div>
        </div>

        <div className="absolute z-20 bottom-[2px] left-0 right-0 flex justify-center w-full px-10">
          <CoverLogo
            logoUrl={coverContext?.logoUrl}
            logoAlt={coverContext?.logoAlt}
          />
        </div>
      </div>
    </div>
  );
};