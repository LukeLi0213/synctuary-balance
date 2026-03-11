import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, BookOpen, FileText, FlaskConical, Briefcase, Dumbbell, MoreHorizontal } from "lucide-react";
import { Task } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import WellbeingAvatar from "@/components/WellbeingAvatar";
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
  avatarMood: AvatarMood;
  xp: number;
  level: number;
  onComplete: (id: string) => void;
  onAdd: (title: string, category: Task["category"]) => void;
}

export default function TasksPage({ tasks, avatarMood, xp, level, onComplete, onAdd }: Props) {
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState<Task["category"]>("studying");

  const handleAdd = () => {
    if (!newTitle.trim()) return;
    onAdd(newTitle.trim(), newCategory);
    setNewTitle("");
    setShowAdd(false);
  };

  const pending = tasks.filter(t => !t.completed);
  const completed = tasks.filter(t => t.completed);

  return (
    <div className="min-h-screen pb-24 px-4 pt-6 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-2">
        <h1 className="font-display text-2xl font-bold">Tasks</h1>
        <Button size="sm" onClick={() => setShowAdd(!showAdd)} className="rounded-xl gap-1">
          <Plus size={16} /> Add
        </Button>
      </div>

      <div className="mb-5">
        <WellbeingAvatar mood={avatarMood} xp={xp} level={level} compact />
      </div>

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
                onChange={e => setNewTitle(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleAdd()}
                className="rounded-xl"
                autoFocus
              />
              <div className="flex flex-wrap gap-1.5">
                {(Object.keys(categoryLabels) as Task["category"][]).map(cat => (
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
              <Button onClick={handleAdd} size="sm" className="w-full rounded-xl">
                Add Task
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pending Tasks */}
      <div className="space-y-2 mb-6">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
          To Do ({pending.length})
        </p>
        {pending.map((task, i) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <TaskRow task={task} onToggle={() => onComplete(task.id)} />
          </motion.div>
        ))}
      </div>

      {/* Completed */}
      {completed.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
            Completed ({completed.length})
          </p>
          {completed.map(task => (
            <TaskRow key={task.id} task={task} onToggle={() => onComplete(task.id)} />
          ))}
        </div>
      )}
    </div>
  );
}

function TaskRow({ task, onToggle }: { task: Task; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className="w-full glass-card p-3.5 flex items-center gap-3 text-left transition-all hover:shadow-md"
    >
      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${
        task.completed ? "bg-primary border-primary" : "border-border hover:border-primary/50"
      }`}>
        {task.completed && <div className="w-2 h-2 bg-primary-foreground rounded-full" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${task.completed ? "line-through text-muted-foreground" : ""}`}>
          {task.title}
        </p>
      </div>
      <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-md ${
        task.completed ? "bg-muted text-muted-foreground" : "bg-secondary text-secondary-foreground"
      }`}>
        {categoryIcons[task.category]} {categoryLabels[task.category]}
      </span>
    </button>
  );
}
