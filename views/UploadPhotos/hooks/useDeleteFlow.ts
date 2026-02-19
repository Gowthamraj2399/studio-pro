import { useCallback, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  deleteProjectPhoto,
  projectPhotosQueryKey,
} from "../../../lib/project-photos";
import type { Photo } from "../../../types";

interface UseDeleteFlowArgs {
  projectId: number;
}

export function useDeleteFlow({ projectId }: UseDeleteFlowArgs) {
  const queryClient = useQueryClient();
  const [photoToDelete, setPhotoToDelete] = useState<Photo | null>(null);
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);
  const [deletingMessage, setDeletingMessage] = useState<string | null>(null);

  const deleteMutation = useMutation({
    mutationFn: deleteProjectPhoto,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: projectPhotosQueryKey(projectId),
      });
    },
    onSettled: () =>
      setDeletingMessage((m) => (m === "Deleting photo…" ? null : m)),
  });

  const confirmDelete = useCallback(() => {
    if (!photoToDelete) return;
    const id = photoToDelete.id;
    setPhotoToDelete(null);
    setDeletingMessage("Deleting photo…");
    deleteMutation.mutate(id);
  }, [photoToDelete, deleteMutation]);

  const handleBulkDelete = useCallback(
    (idsToDelete: string[], clearSelection: () => void) => {
      const count = idsToDelete.length;
      setConfirmBulkDelete(false);
      clearSelection();
      setDeletingMessage(
        count === 1 ? "Deleting photo…" : `Deleting ${count} photos…`
      );
      (async () => {
        try {
          for (const id of idsToDelete) {
            try {
              await deleteProjectPhoto(id);
            } catch {
              // continue with rest
            }
          }
          queryClient.invalidateQueries({
            queryKey: projectPhotosQueryKey(projectId),
          });
        } finally {
          setDeletingMessage(null);
        }
      })();
    },
    [queryClient, projectId]
  );

  return {
    photoToDelete,
    setPhotoToDelete,
    confirmBulkDelete,
    setConfirmBulkDelete,
    deletingMessage,
    deleteMutation,
    confirmDelete,
    handleBulkDelete,
  };
}
