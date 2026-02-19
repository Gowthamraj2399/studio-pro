import React, { memo } from "react";
import { FILE_INPUT_ACCEPT } from "../config";

interface UploadZoneProps {
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDrop: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  disabled?: boolean;
}

const UploadZoneInner: React.FC<UploadZoneProps> = ({
  fileInputRef,
  onFileChange,
  onDrop,
  onDragOver,
  disabled,
}) => (
  <div className="mb-10">
    <div
      className="relative flex flex-col items-center justify-center p-16 rounded-3xl border-2 border-dashed border-primary/30 dark:border-gray-800 bg-white dark:bg-gray-900/50 hover:bg-primary/5 hover:border-primary transition-all group"
      onDrop={onDrop}
      onDragOver={onDragOver}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={FILE_INPUT_ACCEPT}
        className="hidden"
        onChange={onFileChange}
        disabled={disabled}
        aria-hidden
      />
      <div className="size-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
        <span className="material-symbols-outlined text-4xl">cloud_upload</span>
      </div>
      <h3 className="text-xl font-bold mb-2">Drag and drop photos here</h3>
      <p className="text-slate-400 text-sm max-w-sm text-center mb-8">
        Or click the button below to browse. Supported: JPG, PNG, WebP, GIF.
        Stored on Cloudinary.
      </p>
      <button
        type="button"
        className="px-8 py-3 bg-primary text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/20 flex items-center gap-2 cursor-pointer hover:opacity-90 transition-opacity"
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled}
      >
        <span className="material-symbols-outlined">add</span>
        Select Files
      </button>
    </div>
  </div>
);

export const UploadZone = memo(UploadZoneInner);
