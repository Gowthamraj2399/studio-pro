import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchProjectPhotos, projectPhotosQueryKey } from "../../../lib/project-photos";
import { getProject, projectQueryKey } from "../../../lib/projects";

export function useProjectData() {
  const { projectId: projectIdParam } = useParams();
  const projectId = projectIdParam ? parseInt(projectIdParam, 10) : NaN;
  const isValidProject = !isNaN(projectId) && projectId > 0;

  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: projectQueryKey(projectId),
    queryFn: () => getProject(projectId),
    enabled: isValidProject,
  });

  const { data: photos = [], error: photosError } = useQuery({
    queryKey: projectPhotosQueryKey(projectId),
    queryFn: () => fetchProjectPhotos(projectId),
    enabled: isValidProject,
  });

  return {
    projectId,
    isValidProject,
    project,
    projectLoading,
    photos,
    photosError,
  };
}
