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
import NotFound from "@/pages/NotFound";
import { useAppState } from "@/hooks/useAppState";
import { ThemeProvider } from "@/hooks/useThemeSettings";

const queryClient = new QueryClient();

function AppContent() {
  const { state, calendarEvents, completeTask, addTask, addFolder, deleteFolder, toggleFolderCollapse, submitCheckIn, takeRecoveryBreak, skipRecoveryBreak, purchaseItem, equipItem, addCalendarEvent, addCalendarEvents, updateCalendarEvent, deleteCalendarEvent, toggleCalendarTaskComplete } = useAppState();

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
        <Route path="*" element={<NotFound />} />
      </Routes>
      <BottomNav />
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
