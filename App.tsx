import React, { useEffect } from "react";
import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  authQueryKey,
  fetchSession,
  subscribeAuthToQueryClient,
} from "./lib/auth-query";
import {
  userRoleQueryKey,
  fetchMyRole,
  isCreatorRoute,
  isClientRoute,
  isChooseRoleRoute,
} from "./lib/user-roles";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Dashboard from "./views/Dashboard";
import CreateProject from "./views/CreateProject";
import UploadPhotos from "./views/UploadPhotos";
import EventGallery from "./views/EventGallery";
import MyEvents from "./views/MyEvents";
import MyBookmarks from "./views/MyBookmarks";
import {
  SubmissionsListView,
  ProjectSubmissionsView,
  SubmittedAlbumView,
} from "./views/Submissions";
import ProjectSettings from "./views/ProjectSettings";
import ChooseRole from "./views/ChooseRole";
import SignIn from "./views/SignIn";

const App: React.FC = () => {
  return (
    <Router>
      <AuthSync />
      <div className="flex flex-col min-h-screen">
        <Routes>
          <Route path="/signin" element={<SignIn />} />
          <Route path="/*" element={<ProtectedRoutes />} />
        </Routes>
      </div>
    </Router>
  );
};

/** Keeps React Query session cache in sync with Supabase auth state. */
const AuthSync: React.FC = () => {
  const queryClient = useQueryClient();
  useEffect(() => subscribeAuthToQueryClient(queryClient), [queryClient]);
  return null;
};

const ProtectedRoutes: React.FC = () => {
  const location = useLocation();
  const pathname = location.pathname || "/";

  const { data: session, isLoading: sessionLoading } = useQuery({
    queryKey: authQueryKey,
    queryFn: fetchSession,
  });

  const { data: role, isLoading: roleLoading } = useQuery({
    queryKey: userRoleQueryKey,
    queryFn: fetchMyRole,
    enabled: !!session,
  });

  if (sessionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="flex items-center gap-2 text-slate-500">
          <span className="material-symbols-outlined animate-spin">progress_activity</span>
          Loading…
        </div>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  if (roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="flex items-center gap-2 text-slate-500">
          <span className="material-symbols-outlined animate-spin">progress_activity</span>
          Loading…
        </div>
      </div>
    );
  }

  if (role === null) {
    if (isChooseRoleRoute(pathname)) {
      return <ChooseRole />;
    }
    return <Navigate to="/choose-role" state={{ from: location }} replace />;
  }

  return <AuthenticatedLayout role={role} />;
};

const AuthenticatedLayout: React.FC<{ role: "creator" | "client" }> = ({ role }) => {
  const location = useLocation();
  const pathname = location.pathname || "/";

  const isCreator = role === "creator";
  const isClient = role === "client";

  const isCreatorPath =
    pathname === "/" ||
    pathname === "/submissions" ||
    pathname.startsWith("/create-project") ||
    pathname.startsWith("/upload/") ||
    pathname.startsWith("/project/");
  const isClientPath =
    pathname.startsWith("/user/events") ||
    pathname.startsWith("/user/bookmarks") ||
    pathname.startsWith("/event/");

  if (isClient && isCreatorPath) {
    return <Navigate to="/user/events" replace />;
  }
  if (isCreator && isClientPath) {
    return <Navigate to="/" replace />;
  }

  const defaultPath = isCreator ? "/" : "/user/events";

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar role={role} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header role={role} />
        <main className="flex-1 overflow-y-auto no-scrollbar bg-background-light dark:bg-background-dark p-4 md:p-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/create-project" element={<CreateProject />} />
            <Route path="/upload/:projectId" element={<UploadPhotos />} />
            <Route path="/submissions" element={<SubmissionsListView />} />
            <Route path="/project/:projectId/submissions" element={<ProjectSubmissionsView />} />
            <Route path="/project/:projectId/submissions/:albumId" element={<SubmittedAlbumView />} />
            <Route path="/project/:projectId/settings" element={<ProjectSettings />} />
            <Route path="/event/:token" element={<EventGallery />} />
            <Route path="/user/events" element={<MyEvents />} />
            <Route path="/user/bookmarks" element={<MyBookmarks />} />
            <Route path="*" element={<Navigate to={defaultPath} replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default App;
