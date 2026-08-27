import { communityGalleryImages } from "@/app/data/communityGalleryData";
import { GalleryImage } from "./GalleryImage";

const groups = {
  98: communityGalleryImages.slice(0, 4),
  99: communityGalleryImages.slice(4, 12),
  100: communityGalleryImages.slice(12, 20),
  101: communityGalleryImages.slice(20, 28),
  102: communityGalleryImages.slice(28, 36),
  103: communityGalleryImages.slice(36, 44),
};

function PageFrame({
  pageNumber,
  title,
  images,
}: {
  pageNumber: number;
  title: string;
  images: typeof communityGalleryImages;
}) {
  return (
    <section className="relative flex h-full w-full flex-col overflow-hidden bg-[#0b3440] p-5 text-white">
      <div className="mb-3 flex items-end justify-between border-b border-[#55c7d5]/40 pb-2">
        <div>
          <p className="text-[7px] font-semibold uppercase tracking-[0.28em] text-[#7fd6df]">
            Community Gallery
          </p>
          <h2
            className="mt-1 font-serif-primary text-[21px] leading-none text-white"
            style={{ color: "#ffffff" }}
          >
            {title}
          </h2>
        </div>
        <span className="text-[8px] tracking-[0.16em] text-white/60">{pageNumber}</span>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-2 grid-rows-4 gap-2">
        {images.map((image, index) => (
          <GalleryImage
            key={image.id}
            image={image}
            priority={index < 2}
            className="min-h-0 rounded-[2px] border border-white/15 p-1.5"
          />
        ))}
      </div>
    </section>
  );
}

export function CommunityGalleryPage98() {
  const images = groups[98];
  return (
    <section className="relative h-full w-full overflow-hidden bg-[#0b3440] p-6 text-white">
      <div className="grid h-full grid-rows-[auto_1fr] gap-5">
        <header>
          <p className="text-[8px] font-semibold uppercase tracking-[0.28em] text-[#7fd6df]">
            RARE Revolution
          </p>
          <h1
            className="mt-2 font-serif-primary text-[41px] leading-[0.9] text-white"
            style={{ color: "#ffffff" }}
          >
            Community
            <br />
            Gallery
          </h1>
          <p className="mt-4 max-w-[360px] text-[10px] leading-[1.5] text-white/85">
            A visual celebration of the people, families, advocates and organisations shaping the rare-disease community.
          </p>
        </header>
        <div className="grid min-h-0 grid-cols-2 grid-rows-2 gap-3">
          {images.map((image, index) => (
            <GalleryImage
              key={image.id}
              image={image}
              priority={index < 2}
              className="min-h-0 rounded-[2px] border border-white/15 p-2"
            />
          ))}
        </div>
      </div>
      <span className="absolute bottom-3 right-4 text-[8px] tracking-[0.16em] text-white/60">98</span>
    </section>
  );
}

export function CommunityGalleryPage99() {
  return <PageFrame pageNumber={99} title="A Community in Motion" images={groups[99]} />;
}

export function CommunityGalleryPage100() {
  return <PageFrame pageNumber={100} title="Faces of the Community" images={groups[100]} />;
}

export function CommunityGalleryPage101() {
  return <PageFrame pageNumber={101} title="Together, We Are Rare" images={groups[101]} />;
}

export function CommunityGalleryPage102() {
  return <PageFrame pageNumber={102} title="Stories of Strength" images={groups[102]} />;
}

export function CommunityGalleryPage103() {
  return <PageFrame pageNumber={103} title="Seen. Heard. Together." images={groups[103]} />;
}
