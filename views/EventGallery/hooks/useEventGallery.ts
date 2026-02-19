import { useState, useMemo, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCloudinaryInstanceOrNull } from "../../../lib/cloudinary";
import {
  getEventByToken,
  eventByTokenQueryKey,
} from "../../../lib/event-access";
import {
  getUserAlbum,
  getAlbumPhotoIds,
  userAlbumQueryKey,
  addPhotoToAlbum,
  removePhotoFromAlbum,
  submitAlbum,
} from "../../../lib/user-albums";
import type { Photo } from "../../../types";

const albumPhotoIdsQueryKey = (albumId: string) =>
  ["album_photo_ids", albumId] as const;

export function useEventGallery() {
  const { token } = useParams<{ token: string }>();
  const queryClient = useQueryClient();
  const isValidToken = Boolean(token?.trim());

  const {
    data: eventData,
    isLoading: eventLoading,
    error: eventError,
  } = useQuery({
    queryKey: eventByTokenQueryKey(token ?? ""),
    queryFn: () => getEventByToken(token!),
    enabled: isValidToken,
  });

  const projectId = eventData?.project?.id ?? 0;
  const project = eventData?.project ?? null;
  const photos = eventData?.photos ?? [];

  const { data: album } = useQuery({
    queryKey: userAlbumQueryKey(projectId),
    queryFn: () => getUserAlbum(projectId),
    enabled: projectId > 0,
  });

  const { data: albumPhotoIds = [] } = useQuery({
    queryKey: albumPhotoIdsQueryKey(album?.id ?? ""),
    queryFn: () => getAlbumPhotoIds(album!.id),
    enabled: Boolean(album?.id),
  });

  const [togglingPhotoId, setTogglingPhotoId] = useState<string | null>(null);

  const addToAlbumMutation = useMutation({
    mutationFn: ({ photoId }: { photoId: string }) =>
      addPhotoToAlbum(projectId, photoId),
    onMutate: ({ photoId }) => setTogglingPhotoId(photoId),
    onSuccess: (_data, _variables, context) => {
      queryClient.invalidateQueries({ queryKey: userAlbumQueryKey(projectId) });
      if (album?.id) {
        queryClient.invalidateQueries({
          queryKey: albumPhotoIdsQueryKey(album.id),
        });
      }
    },
    onSettled: () => setTogglingPhotoId(null),
  });

  const removeFromAlbumMutation = useMutation({
    mutationFn: ({ photoId }: { photoId: string }) =>
      removePhotoFromAlbum(album!.id, photoId),
    onMutate: ({ photoId }) => setTogglingPhotoId(photoId),
    onSuccess: (_data, { photoId }) => {
      if (album?.id) {
        queryClient.setQueryData(
          albumPhotoIdsQueryKey(album.id),
          (prev: string[] | undefined) => prev?.filter((id) => id !== photoId) ?? []
        );
      }
    },
    onSettled: () => setTogglingPhotoId(null),
  });

  const submitAlbumMutation = useMutation({
    mutationFn: () => submitAlbum(album!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userAlbumQueryKey(projectId) });
    },
  });

  const toggleAlbumPhoto = useCallback(
    (photo: Photo) => {
      const inAlbum = albumPhotoIds.includes(photo.id);
      if (inAlbum) {
        removeFromAlbumMutation.mutate({ photoId: photo.id });
      } else {
        addToAlbumMutation.mutate({ photoId: photo.id });
      }
    },
    [albumPhotoIds, addToAlbumMutation, removeFromAlbumMutation]
  );

  const cld = useMemo(() => getCloudinaryInstanceOrNull(), []);

  return {
    token,
    isValidToken,
    project,
    photos,
    eventLoading,
    eventError,
    album,
    albumPhotoIds,
    isInAlbum: (photoId: string) => albumPhotoIds.includes(photoId),
    togglingPhotoId,
    isTogglingPhoto: (photoId: string) => togglingPhotoId === photoId,
    toggleAlbumPhoto,
    addToAlbumMutation,
    removeFromAlbumMutation,
    submitAlbumMutation,
    cld,
  };
}
