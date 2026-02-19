import { useCallback, useMemo, useState } from "react";
import type { DisplayPhoto } from "../types";

export function useSelection(displayPhotos: DisplayPhoto[]) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    const doneIds = displayPhotos
      .filter((p) => p.status !== "uploading")
      .map((p) => p.id);
    setSelectedIds(new Set(doneIds));
  }, [displayPhotos]);

  const clearSelection = useCallback(() => setSelectedIds(new Set()), []);

  const selectedPhotos = useMemo(
    () =>
      displayPhotos.filter(
        (p) => p.status !== "uploading" && selectedIds.has(p.id)
      ),
    [displayPhotos, selectedIds]
  );

  const hasSelectablePhotos = useMemo(
    () => displayPhotos.some((p) => p.status !== "uploading"),
    [displayPhotos]
  );

  return {
    selectedIds,
    setSelectedIds,
    toggleSelect,
    selectAll,
    clearSelection,
    selectedPhotos,
    hasSelectablePhotos,
  };
}
