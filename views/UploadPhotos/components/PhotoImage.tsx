import React, { memo } from "react";
import { fill } from "@cloudinary/url-gen/actions/resize";
import type { Cloudinary } from "@cloudinary/url-gen";
import type { Photo } from "../../../types";

interface PhotoImageProps {
  photo: Pick<Photo, "url" | "filename" | "public_id">;
  cld: Cloudinary | null;
  /** For thumbnails: width/height for resize. Omit for full size (e.g. preview). */
  thumbSize?: number;
  className?: string;
}

const PhotoImageInner: React.FC<PhotoImageProps> = ({
  photo,
  cld,
  thumbSize,
  className,
}) => {
  if (photo.url) {
    return (
      <img
        src={photo.url}
        alt={photo.filename}
        className={className}
        loading={thumbSize ? "lazy" : undefined}
      />
    );
  }
  if (cld && photo.public_id) {
    const img = thumbSize
      ? cld.image(photo.public_id).resize(fill().width(thumbSize).height(thumbSize))
      : cld.image(photo.public_id);
    const url = img.toURL();
    return (
      <img
        src={url}
        alt={photo.filename}
        className={className}
        loading={thumbSize ? "lazy" : undefined}
      />
    );
  }
  return (
    <div
      className={`bg-slate-200 dark:bg-gray-700 flex items-center justify-center ${className ?? ""}`}
    >
      <span className="material-symbols-outlined text-4xl text-slate-400">
        broken_image
      </span>
    </div>
  );
};

export const PhotoImage = memo(PhotoImageInner);
