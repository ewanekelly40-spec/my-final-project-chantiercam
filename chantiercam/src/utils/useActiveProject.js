import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";

export default function useActiveProject() {
  const { activeProjectId } = useAuth();
  const { store } = useData();
  const project = store.projects.find((p) => p.id === activeProjectId) || null;
  return { project, projectId: activeProjectId };
}
