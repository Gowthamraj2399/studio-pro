import React, { useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { PhotoListItem } from "./PhotoListItem";
import type { Cloudinary } from "@cloudinary/url-gen";
import type { DisplayPhoto } from "../types";

const ROW_HEIGHT_ESTIMATE = 88;
const OVERSCAN = 10;

interface VirtualPhotoListProps {
  photos: DisplayPhoto[];
  cld: Cloudinary | null;
  selectedIds: Set<string>;
  isDeleting: boolean;
  onToggleSelect: (id: string) => void;
  onPreview: (photo: DisplayPhoto) => void;
  onDownload: (photo: DisplayPhoto) => void;
  onDelete: (photo: DisplayPhoto) => void;
}

export const VirtualPhotoList: React.FC<VirtualPhotoListProps> = ({
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

  const virtualizer = useVirtualizer({
    count: photos.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT_ESTIMATE,
    overscan: OVERSCAN,
  });

  const virtualItems = virtualizer.getVirtualItems();

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
        {virtualItems.map((virtualRow) => {
          const photo = photos[virtualRow.index];
          return (
            <div
              key={virtualRow.key}
              className="absolute left-0 w-full"
              style={{
                top: 0,
                transform: `translateY(${virtualRow.start}px)`,
                height: `${virtualRow.size}px`,
              }}
            >
              <PhotoListItem
                photo={photo}
                cld={cld}
                isSelected={selectedIds.has(photo.id)}
                isDeleting={isDeleting}
                onToggleSelect={onToggleSelect}
                onPreview={onPreview}
                onDownload={onDownload}
                onDelete={onDelete}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
