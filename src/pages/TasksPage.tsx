import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  BookOpen,
  FileText,
  FlaskConical,
  Briefcase,
  Dumbbell,
  MoreHorizontal,
  FolderPlus,
  ChevronDown,
  ChevronRight,
  Trash2,
  FolderOpen,
} from "lucide-react";
import { Task, TaskFolder, FOLDER_COLORS } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import WellbeingAvatar from "@/components/WellbeingAvatar";
import RecoveryModal from "@/components/RecoveryModal";
import { AvatarMood } from "@/lib/store";

const categoryIcons: Record<Task["category"], React.ReactNode> = {
  studying: <BookOpen size={14} />,
  assignment: <FileText size={14} />,
  lab: <FlaskConical size={14} />,
  internship: <Briefcase size={14} />,
  sports: <Dumbbell size={14} />,
  other: <MoreHorizontal size={14} />,
};

const categoryLabels: Record<Task["category"], string> = {
  studying: "Studying",
  assignment: "Assignment",
  lab: "Lab Work",
  internship: "Internship",
  sports: "Sports",
  other: "Other",
};

interface Props {
  tasks: Task[];
  folders: TaskFolder[];
  avatarMood: AvatarMood;
  xp: number;
  level: number;
  onComplete: (id: string) => void;
  onAdd: (title: string, category: Task["category"], folderId?: string) => void;
  onAddFolder: (name: string, color: string) => void;
  onDeleteFolder: (id: string) => void;
  onToggleFolder: (id: string) => void;
  onTakeBreak: () => void;
  onSkipBreak: () => void;
}

export default function TasksPage({
  tasks,
  folders,
  avatarMood,
  xp,
  level,
  onComplete,
  onAdd,
  onAddFolder,
  onDeleteFolder,
  onToggleFolder,
  onTakeBreak,
  onSkipBreak,
}: Props) {
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState<Task["category"]>("studying");
  const [newFolderId, setNewFolderId] = useState<string | undefined>(undefined);
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryTimer, setRecoveryTimer] = useState<number | null>(null);
  const [timerSeconds, setTimerSeconds] = useState(20 * 60);

  // Folder creation
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderColor, setNewFolderColor] = useState(FOLDER_COLORS[0]);

  const handleAdd = () => {
    if (!newTitle.trim()) return;
    onAdd(newTitle.trim(), newCategory, newFolderId);
    setNewTitle("");
    setShowAdd(false);
  };

  const handleAddFolder = () => {
    if (!newFolderName.trim()) return;
    onAddFolder(newFolderName.trim(), newFolderColor);
    setNewFolderName("");
    setShowNewFolder(false);
  };

  const handleComplete = useCallback(
    (id: string) => {
      const task = tasks.find((t) => t.id === id);
      if (task && !task.completed) {
        onComplete(id);
        setShowRecovery(true);
      } else {
        onComplete(id);
      }
    },
    [tasks, onComplete]
  );

  const handleStartBreak = (minutes: number) => {
    setShowRecovery(false);
    setTimerSeconds(minutes * 60);
    const interval = window.setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setRecoveryTimer(null);
          onTakeBreak();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    setRecoveryTimer(interval);
  };

  const handleSkipBreak = () => {
    setShowRecovery(false);
    onSkipBreak();
  };

  useEffect(() => {
    return () => {
      if (recoveryTimer) clearInterval(recoveryTimer);
    };
  }, [recoveryTimer]);

  // Separate tasks
  const unfiledTasks = tasks.filter((t) => !t.folderId);
  const pendingUnfiled = unfiledTasks.filter((t) => !t.completed);
  const completedUnfiled = unfiledTasks.filter((t) => t.completed);

  return (
    <div className="min-h-screen pb-24 px-4 pt-6 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h1 className="font-display text-2xl font-bold">Tasks</h1>
        <div className="flex gap-1.5">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowNewFolder(!showNewFolder)}
            className="rounded-xl gap-1"
          >
            <FolderPlus size={14} />
          </Button>
          <Button
            size="sm"
            onClick={() => setShowAdd(!showAdd)}
            className="rounded-xl gap-1"
          >
            <Plus size={16} /> Add
          </Button>
        </div>
      </div>

      <div className="mb-5">
        <WellbeingAvatar mood={avatarMood} xp={xp} level={level} compact />
      </div>

      {/* New Folder Form */}
      <AnimatePresence>
        {showNewFolder && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-4"
          >
            <div className="glass-card-elevated p-4 space-y-3">
              <div className="flex items-center gap-2">
                <FolderOpen size={16} className="text-primary" />
                <span className="text-sm font-medium">New Project Folder</span>
              </div>
              <Input
                placeholder="Project name (e.g. Bio Lab Report)"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddFolder()}
                className="rounded-xl"
                autoFocus
              />
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Color:</span>
                <div className="flex gap-1.5">
                  {FOLDER_COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setNewFolderColor(c)}
                      className={`w-5 h-5 rounded-full transition-all ${
                        newFolderColor === c
                          ? "ring-2 ring-offset-2 ring-offset-background ring-primary scale-110"
                          : "hover:scale-110"
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
              <Button
                onClick={handleAddFolder}
                size="sm"
                className="w-full rounded-xl"
              >
                Create Folder
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Task Form */}
      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-4"
          >
            <div className="glass-card-elevated p-4 space-y-3">
              <Input
                placeholder="Task name..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                className="rounded-xl"
                autoFocus
              />
              {/* Category selector */}
              <div className="flex flex-wrap gap-1.5">
                {(
                  Object.keys(categoryLabels) as Task["category"][]
                ).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setNewCategory(cat)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                      newCategory === cat
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {categoryIcons[cat]} {categoryLabels[cat]}
                  </button>
                ))}
              </div>
              {/* Folder selector */}
              {folders.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-xs text-muted-foreground">
                    Add to folder:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      onClick={() => setNewFolderId(undefined)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                        !newFolderId
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      No folder
                    </button>
                    {folders.map((f) => (
                      <button
                        key={f.id}
                        onClick={() => setNewFolderId(f.id)}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                          newFolderId === f.id
                            ? "text-primary-foreground"
                            : "bg-secondary text-muted-foreground"
                        }`}
                        style={
                          newFolderId === f.id
                            ? { backgroundColor: f.color }
                            : undefined
                        }
                      >
                        <FolderOpen size={12} /> {f.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <Button
                onClick={handleAdd}
                size="sm"
                className="w-full rounded-xl"
              >
                Add Task
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Project Folders */}
      {folders.map((folder) => {
        const folderTasks = tasks.filter((t) => t.folderId === folder.id);
        const folderPending = folderTasks.filter((t) => !t.completed);
        const folderCompleted = folderTasks.filter((t) => t.completed);
        const progress =
          folderTasks.length > 0
            ? Math.round((folderCompleted.length / folderTasks.length) * 100)
            : 0;

        return (
          <motion.div
            key={folder.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4"
          >
            <div className="glass-card-elevated overflow-hidden">
              {/* Folder Header */}
              <button
                onClick={() => onToggleFolder(folder.id)}
                className="w-full p-3.5 flex items-center gap-3 text-left"
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: folder.color + "20" }}
                >
                  <FolderOpen
                    size={16}
                    style={{ color: folder.color }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold truncate">
                      {folder.name}
                    </p>
                    <span className="text-[10px] text-muted-foreground">
                      {folderCompleted.length}/{folderTasks.length}
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full h-1.5 bg-secondary rounded-full mt-1.5 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: folder.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteFolder(folder.id);
                    }}
                    className="p-1 text-muted-foreground hover:text-destructive rounded-lg transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                  {folder.collapsed ? (
                    <ChevronRight size={16} className="text-muted-foreground" />
                  ) : (
                    <ChevronDown size={16} className="text-muted-foreground" />
                  )}
                </div>
              </button>

              {/* Folder Tasks */}
              <AnimatePresence>
                {!folder.collapsed && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-3 pb-3 space-y-1.5">
                      {folderPending.map((task) => (
                        <TaskRow
                          key={task.id}
                          task={task}
                          onToggle={() => handleComplete(task.id)}
                          indent
                        />
                      ))}
                      {folderCompleted.map((task) => (
                        <TaskRow
                          key={task.id}
                          task={task}
                          onToggle={() => handleComplete(task.id)}
                          indent
                        />
                      ))}
                      {folderTasks.length === 0 && (
                        <p className="text-xs text-muted-foreground text-center py-2 italic">
                          No tasks yet — add one above
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        );
      })}

      {/* Unfiled Tasks */}
      <div className="space-y-2 mb-6">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
          To Do ({pendingUnfiled.length})
        </p>
        {pendingUnfiled.map((task, i) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <TaskRow task={task} onToggle={() => handleComplete(task.id)} />
          </motion.div>
        ))}
        {pendingUnfiled.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-3 italic">
            All caught up! 🎉
          </p>
        )}
      </div>

      {/* Completed Unfiled */}
      {completedUnfiled.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
            Completed ({completedUnfiled.length})
          </p>
          {completedUnfiled.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              onToggle={() => handleComplete(task.id)}
            />
          ))}
        </div>
      )}

      {/* Recovery Timer Overlay */}
      <AnimatePresence>
        {recoveryTimer !== null && timerSeconds > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="glass-card-elevated p-8 max-w-xs w-full text-center"
            >
              <div className="mb-4">
                <WellbeingAvatar mood="calm" xp={xp} level={level} compact />
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                Recovery break in progress
              </p>
              <p className="font-display text-5xl font-bold text-primary">
                {Math.floor(timerSeconds / 60)}:
                {String(timerSeconds % 60).padStart(2, "0")}
              </p>
              <p className="text-xs text-muted-foreground mt-3">
                Breathe and relax
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recovery Modal */}
      <RecoveryModal
        open={showRecovery}
        onStart={handleStartBreak}
        onSkip={handleSkipBreak}
        onClose={() => setShowRecovery(false)}
      />
    </div>
  );
}

function TaskRow({
  task,
  onToggle,
  indent = false,
}: {
  task: Task;
  onToggle: () => void;
  indent?: boolean;
}) {
  return (
    <button
      onClick={onToggle}
      className={`w-full glass-card p-3.5 flex items-center gap-3 text-left transition-all hover:shadow-md ${
        indent ? "ml-2" : ""
      }`}
    >
      <div
        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${
          task.completed
            ? "bg-primary border-primary"
            : "border-border hover:border-primary/50"
        }`}
      >
        {task.completed && (
          <div className="w-2 h-2 bg-primary-foreground rounded-full" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-medium truncate ${
            task.completed ? "line-through text-muted-foreground" : ""
          }`}
        >
          {task.title}
        </p>
      </div>
      <span
        className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-md ${
          task.completed
            ? "bg-muted text-muted-foreground"
            : "bg-secondary text-secondary-foreground"
        }`}
      >
        {categoryIcons[task.category]} {categoryLabels[task.category]}
      </span>
    </button>
  );
}
