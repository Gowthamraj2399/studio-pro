import React, { useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { EventPhotoCard } from "./EventPhotoCard";
import type { Cloudinary } from "@cloudinary/url-gen";
import type { Photo } from "../../../types";

const ROW_HEIGHT = 220;
const GAP = 24;
const OVERSCAN = 8;
const COLUMNS = 6;

interface VirtualEventPhotoGridProps {
  photos: Photo[];
  cld: Cloudinary | null;
  isInAlbum: (photoId: string) => boolean;
  isTogglingPhoto: (photoId: string) => boolean;
  isSubmitting: boolean;
  isAlbumLocked: boolean;
  isAlbumFull: boolean;
  onToggleAlbum: (photo: Photo) => void;
  onPreview: (photo: Photo) => void;
}

export const VirtualEventPhotoGrid: React.FC<VirtualEventPhotoGridProps> = ({
  photos,
  cld,
  isInAlbum,
  isTogglingPhoto,
  isSubmitting,
  isAlbumLocked,
  isAlbumFull,
  onToggleAlbum,
  onPreview,
}) => {
  const parentRef = useRef<HTMLDivElement>(null);
  const rowCount = Math.ceil(photos.length / COLUMNS);

  const virtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT + GAP,
    overscan: OVERSCAN,
  });

  const virtualRows = virtualizer.getVirtualItems();

  return (
    <div
      ref={parentRef}
      className="overflow-auto h-[calc(100vh-18rem)] min-h-[400px] rounded-2xl -mx-1 px-1"
      style={{ contain: "strict" }}
    >
      <div
        className="relative w-full"
        style={{
          height: `${virtualizer.getTotalSize()}px`,
        }}
      >
        {virtualRows.map((virtualRow) => {
          const start = virtualRow.index * COLUMNS;
          const rowPhotos = photos.slice(start, start + COLUMNS);
          return (
            <div
              key={virtualRow.key}
              className="absolute left-0 w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6"
              style={{
                top: 0,
                transform: `translateY(${virtualRow.start}px)`,
                height: `${virtualRow.size}px`,
              }}
            >
              {rowPhotos.map((photo) => (
                <EventPhotoCard
                  key={photo.id}
                  photo={photo}
                  cld={cld}
                  isInAlbum={isInAlbum(photo.id)}
                  isToggling={isTogglingPhoto(photo.id)}
                  isSubmitting={isSubmitting}
                  isAlbumLocked={isAlbumLocked}
                  isAlbumFull={isAlbumFull}
                  onToggleAlbum={onToggleAlbum}
                  onPreview={onPreview}
                />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};
