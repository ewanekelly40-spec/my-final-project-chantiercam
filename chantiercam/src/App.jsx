import React from "react";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { DataProvider } from "./context/DataContext";
import { AuthProvider } from "./context/AuthContext";
import { LanguageProvider } from "./context/LanguageContext";
import { ThemeProvider } from "./context/ThemeContext";
import { ToastProvider } from "./context/ToastContext";

import ProtectedRoute from "./components/ProtectedRoute";
import ManagerLayout from "./components/ManagerLayout";
import WorkerLayout from "./components/WorkerLayout";
import ClientLayout from "./components/ClientLayout";
import SimpleSettings from "./components/SimpleSettings";

import Landing from "./pages/Landing";
import Overview from "./pages/manager/Overview";
import Projects from "./pages/manager/Projects";
import Phases from "./pages/manager/Phases";
import Reports from "./pages/manager/Reports";
import Users from "./pages/manager/Users";
import Tasks from "./pages/manager/Tasks";
import Materials from "./pages/manager/Materials";
import Finances from "./pages/manager/Finances";
import Progress from "./pages/manager/Progress";
import Messages from "./pages/manager/Messages";
import Settings from "./pages/manager/Settings";

import WorkerTasks from "./pages/worker/WorkerTasks";
import WorkerPayments from "./pages/worker/WorkerPayments";
import WorkerMessages from "./pages/worker/WorkerMessages";

import ClientProgress from "./pages/client/ClientProgress";
import ClientMessages from "./pages/client/ClientMessages";

export default function App() {
  return (
    <DataProvider>
      <AuthProvider>
        <LanguageProvider>
          <ThemeProvider>
            <ToastProvider>
              <HashRouter>
                <Routes>
                  <Route path="/" element={<Landing />} />

                  <Route path="/manager" element={<ProtectedRoute role="manager"><ManagerLayout /></ProtectedRoute>}>
                    <Route index element={<Overview />} />
                    <Route path="projects" element={<Projects />} />
                    <Route path="phases" element={<Phases />} />
                    <Route path="users" element={<Users />} />
                    <Route path="tasks" element={<Tasks />} />
                    <Route path="materials" element={<Materials />} />
                    <Route path="payments" element={<Navigate to="/manager/finances" replace />} />
                    <Route path="finances" element={<Finances />} />
                    <Route path="reports" element={<Reports />} />
                    <Route path="progress" element={<Progress />} />
                    <Route path="messages" element={<Messages />} />
                    <Route path="settings" element={<Settings />} />
                  </Route>

                  <Route path="/worker" element={<ProtectedRoute role="worker"><WorkerLayout /></ProtectedRoute>}>
                    <Route index element={<WorkerTasks />} />
                    <Route path="payments" element={<WorkerPayments />} />
                    <Route path="messages" element={<WorkerMessages />} />
                    <Route path="settings" element={<SimpleSettings />} />
                  </Route>

                  <Route path="/client" element={<ProtectedRoute role="client"><ClientLayout /></ProtectedRoute>}>
                    <Route index element={<ClientProgress />} />
                    <Route path="messages" element={<ClientMessages />} />
                    <Route path="settings" element={<SimpleSettings />} />
                  </Route>

                  <Route path="*" element={<Landing />} />
                </Routes>
              </HashRouter>
            </ToastProvider>
          </ThemeProvider>
        </LanguageProvider>
      </AuthProvider>
    </DataProvider>
  );
}
