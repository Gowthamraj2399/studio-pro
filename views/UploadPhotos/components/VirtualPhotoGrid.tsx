import React, { useRef, useMemo } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { PhotoCard } from "./PhotoCard";
import type { Cloudinary } from "@cloudinary/url-gen";
import type { DisplayPhoto } from "../types";

const ROW_HEIGHT = 220;
const GAP = 24;
const OVERSCAN = 8;
const COLUMNS = 6;

interface VirtualPhotoGridProps {
  photos: DisplayPhoto[];
  cld: Cloudinary | null;
  selectedIds: Set<string>;
  isDeleting: boolean;
  onToggleSelect: (id: string) => void;
  onPreview: (photo: DisplayPhoto) => void;
  onDownload: (photo: DisplayPhoto) => void;
  onDelete: (photo: DisplayPhoto) => void;
}

export const VirtualPhotoGrid: React.FC<VirtualPhotoGridProps> = ({
  photos,
  cld,
  selectedIds,
  isDeleting,
  onToggleSelect,
  onPreview,
  onDownload,
  onDelete,
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
      className="overflow-auto h-[calc(100vh-22rem)] min-h-[400px] rounded-2xl -mx-1 px-1"
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
                <PhotoCard
                  key={photo.id}
                  photo={photo}
                  cld={cld}
                  isSelected={selectedIds.has(photo.id)}
                  isDeleting={isDeleting}
                  onToggleSelect={onToggleSelect}
                  onPreview={onPreview}
                  onDownload={onDownload}
                  onDelete={onDelete}
                />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};
