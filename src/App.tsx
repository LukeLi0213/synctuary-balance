import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import BottomNav from "@/components/BottomNav";
import DashboardPage from "@/pages/DashboardPage";
import TasksPage from "@/pages/TasksPage";
import RecoveryPage from "@/pages/RecoveryPage";
import StatsPage from "@/pages/StatsPage";
import AvatarPage from "@/pages/AvatarPage";
import CalendarPage from "@/pages/CalendarPage";
import ResourcesPage from "@/pages/ResourcesPage";
import SettingsPage from "@/pages/SettingsPage";
import AuthPage from "@/pages/AuthPage";
import GroupPage from "@/pages/GroupPage";
import NotFound from "@/pages/NotFound";
import { useAppState } from "@/hooks/useAppState";
import { ThemeProvider } from "@/hooks/useThemeSettings";
import { AuthProvider, useAuth } from "@/hooks/useAuth";

const queryClient = new QueryClient();

function AppContent() {
  const { user, loading } = useAuth();
  const { state, calendarEvents, completeTask, addTask, addFolder, deleteFolder, toggleFolderCollapse, submitCheckIn, takeRecoveryBreak, skipRecoveryBreak, purchaseItem, equipItem, addCalendarEvent, addCalendarEvents, updateCalendarEvent, deleteCalendarEvent, toggleCalendarTaskComplete } = useAppState();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse-soft text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <Toaster />
      <Sonner />
      <Routes>
        <Route
          path="/"
          element={
            <DashboardPage
              state={state}
              onCompleteTask={completeTask}
              onCheckIn={submitCheckIn}
            />
          }
        />
        <Route
          path="/tasks"
          element={
            <TasksPage
              tasks={state.tasks}
              folders={state.folders}
              avatarMood={state.avatarMood}
              xp={state.xp}
              level={state.level}
              onComplete={completeTask}
              onAdd={addTask}
              onAddFolder={addFolder}
              onDeleteFolder={deleteFolder}
              onToggleFolder={toggleFolderCollapse}
              onTakeBreak={takeRecoveryBreak}
              onSkipBreak={skipRecoveryBreak}
            />
          }
        />
        <Route
          path="/recovery"
          element={
            <RecoveryPage
              avatarMood={state.avatarMood}
              xp={state.xp}
              level={state.level}
              onTakeBreak={takeRecoveryBreak}
              onSkipBreak={skipRecoveryBreak}
            />
          }
        />
        <Route path="/stats" element={<StatsPage stats={state.weeklyStats} />} />
        <Route
          path="/calendar"
          element={
            <CalendarPage
              tasks={state.tasks}
              recoveryTaken={state.weeklyStats.recoveryTaken}
              events={calendarEvents}
              onAddEvent={addCalendarEvent}
              onAddEvents={addCalendarEvents}
              onUpdateEvent={updateCalendarEvent}
              onDeleteEvent={deleteCalendarEvent}
              onToggleTaskComplete={toggleCalendarTaskComplete}
            />
          }
        />
        <Route
          path="/avatar"
          element={
          <AvatarPage
              inventory={state.inventory}
              avatarMood={state.avatarMood}
              xp={state.xp}
              level={state.level}
              onPurchase={purchaseItem}
              onEquip={equipItem}
            />
          }
        />
        <Route path="/resources" element={<ResourcesPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/group" element={user ? <GroupPage /> : <AuthPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <BottomNav />
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ThemeProvider>
        <TooltipProvider>
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
