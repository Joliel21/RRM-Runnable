import type { CommunityGalleryImage } from "@/app/data/communityGalleryData";

interface GalleryImageProps {
  image: CommunityGalleryImage;
  className?: string;
  priority?: boolean;
}

const LINKS: Record<string, string> = {
  // Page 95 – Facebook tile
  "gallery_0042_2370x1058":
    "https://www.facebook.com/RareRevolutionMagazine/",

  // Page 95 – Magazine cover tile
  "gallery_0044_linkedin_2370x1058":
    "https://www.linkedin.com/company/rare-revolution-magazine/posts/?feedView=all",
};

export function GalleryImage({
  image,
  className = "",
  priority = false,
}: GalleryImageProps) {
  const href = LINKS[image.id];

  const img = (
    <img
      src={image.src}
      alt={image.alt}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      draggable={false}
      className="max-h-full max-w-full object-contain"
    />
  );

  return (
    <figure
      className={`relative flex items-center justify-center overflow-hidden bg-[#f4efe6] ${className}`}
    >
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-full w-full cursor-pointer items-center justify-center"
          aria-label={image.alt}
        >
          {img}
        </a>
      ) : (
        img
      )}
    </figure>
  );
}