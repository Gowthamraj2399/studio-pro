import React, { memo } from "react";
import { AdvancedImage } from "@cloudinary/react";
import { PhotoImage } from "./PhotoImage";
import type { Cloudinary } from "@cloudinary/url-gen";
import type { Photo } from "../../../types";

interface PreviewModalProps {
  photo: Photo;
  cld: Cloudinary | null;
  onClose: () => void;
}

const PreviewModalInner: React.FC<PreviewModalProps> = ({
  photo,
  cld,
  onClose,
}) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
    onClick={onClose}
    role="dialog"
    aria-modal="true"
    aria-label="Image preview"
  >
    <button
      type="button"
      className="absolute top-4 right-4 size-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors z-10"
      onClick={onClose}
      aria-label="Close preview"
    >
      <span className="material-symbols-outlined">close</span>
    </button>
    <div
      className="relative max-w-[90vw] max-h-[90vh] flex items-center justify-center"
      onClick={(e) => e.stopPropagation()}
    >
      {photo.url ? (
        <img
          src={photo.url}
          alt={photo.filename}
          className="max-w-full max-h-[90vh] w-auto h-auto object-contain rounded-lg"
        />
      ) : cld && photo.public_id ? (
        <AdvancedImage
          cldImg={cld.image(photo.public_id)}
          className="max-w-full max-h-[90vh] w-auto h-auto object-contain rounded-lg"
        />
      ) : (
        <PhotoImage photo={photo} cld={cld} className="max-w-full max-h-[90vh]" />
      )}
    </div>
    <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/80 text-sm font-medium truncate max-w-[90vw]">
      {photo.filename}
    </p>
  </div>
);

export const PreviewModal = memo(PreviewModalInner);
