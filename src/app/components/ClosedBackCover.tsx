import { useEffect, useRef, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { Button } from "@/app/components/ui/button";

interface ClosedBackCoverContext {
  imageUrl?: string;
  imageAlt?: string;
}

interface ClosedBackCoverProps {
  coverImageUrl: string;
  issueTitle: string;
  onOpen: () => void;
  onSingleClick?: () => void;
  onDoubleClick?: () => void;
  backCoverContext?: ClosedBackCoverContext;
  width?: number;
  height?: number;
  showButton?: boolean;
  embedded?: boolean;
}

export function ClosedBackCover({
  onOpen,
  onSingleClick,
  onDoubleClick,
  backCoverContext,
  width = 480,
  height = 660,
  showButton = true,
  embedded = false,
}: ClosedBackCoverProps) {
  const clickTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (clickTimerRef.current !== null) {
        window.clearTimeout(clickTimerRef.current);
      }
    };
  }, []);

  const handleSingleClick = () => {
    if (clickTimerRef.current !== null) {
      window.clearTimeout(clickTimerRef.current);
    }

    clickTimerRef.current = window.setTimeout(() => {
      (onSingleClick || onOpen)();
      clickTimerRef.current = null;
    }, 240);
  };

  const handleDoubleClick = () => {
    if (clickTimerRef.current !== null) {
      window.clearTimeout(clickTimerRef.current);
      clickTimerRef.current = null;
    }

    (onDoubleClick || onOpen)();
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      (onSingleClick || onOpen)();
    }
  };

  return (
    <div className="relative flex h-full items-center justify-center">
      <div
        className="relative cursor-pointer overflow-hidden"
        style={{
          width: `${width}px`,
          height: `${height}px`,
          boxShadow: embedded
            ? "none"
            : "0 30px 60px -12px rgba(0, 0, 0, 0.5), 0 18px 36px -18px rgba(0, 0, 0, 0.4)",
        }}
        onClick={handleSingleClick}
        onDoubleClick={handleDoubleClick}
        onKeyDown={handleKeyDown}
        role="button"
        aria-label="Back cover - click once to open the last page; double-click to return to the front cover"
        tabIndex={0}
      >
        {backCoverContext?.imageUrl ? (
          <img
            src={backCoverContext.imageUrl}
            alt={backCoverContext.imageAlt || "Magazine back cover"}
            className="block h-full w-full select-none object-contain"
            draggable={false}
          />
        ) : null}
      </div>

      {showButton ? (
        <div className="absolute bottom-12 left-1/2 flex -translate-x-1/2 flex-col items-center gap-3">
          <Button
            size="lg"
            onClick={onOpen}
            className="px-8 py-6 text-lg shadow-lg"
            aria-label="Return to cover"
          >
            Back to Cover
          </Button>
        </div>
      ) : null}
    </div>
  );
}

export default ClosedBackCover;
