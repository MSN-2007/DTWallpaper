import React, { useState } from "react";
import { CheckSquare, Plus, Trash2, Check } from "lucide-react";

interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
}

interface TodoListWidgetProps {
  settings?: Record<string, unknown>;
  onUpdateSettings?: (settings: Record<string, unknown>) => void;
}

export const TodoListWidget: React.FC<TodoListWidgetProps> = ({ settings, onUpdateSettings }) => {
  const initialTasks: TodoItem[] = (settings?.tasks as TodoItem[]) || [
    { id: "1", text: "Welcome to Desktop Canvas", completed: true },
    { id: "2", text: "Drag or resize this widget", completed: false },
    { id: "3", text: "Press E to toggle Edit mode", completed: false },
  ];

  const [tasks, setTasks] = useState<TodoItem[]>(initialTasks);
  const [inputText, setInputText] = useState("");

  const updateTasks = (newTasks: TodoItem[]) => {
    setTasks(newTasks);
    onUpdateSettings?.({ ...(settings || {}), tasks: newTasks });
  };

  const toggleTask = (id: string) => {
    updateTasks(tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  };

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    const newTask: TodoItem = {
      id: Date.now().toString(),
      text: inputText.trim(),
      completed: false,
    };
    updateTasks([...tasks, newTask]);
    setInputText("");
  };

  const removeTask = (id: string) => {
    updateTasks(tasks.filter((t) => t.id !== id));
  };

  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <div className="flex flex-col h-full p-3.5 select-none text-white">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/5">
        <div className="flex items-center gap-1.5 text-xs font-medium text-amber-400">
          <CheckSquare className="w-3.5 h-3.5" />
          <span className="uppercase tracking-wider text-[10px]">Tasks</span>
        </div>
        <span className="text-[10px] text-white/40 font-mono">
          {completedCount}/{tasks.length} done
        </span>
      </div>

      {/* Task List */}
      <div className="flex-1 pr-1 overflow-y-auto space-y-1.5">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`group flex items-center justify-between gap-2 p-1.5 rounded-lg border transition-all ${
              task.completed
                ? "bg-white/[0.02] border-white/5 text-white/40"
                : "bg-white/[0.04] border-white/10 text-white/90 hover:border-white/20"
            }`}
          >
            <button
              onClick={() => toggleTask(task.id)}
              className={`flex items-center justify-center w-4 h-4 rounded border transition-colors flex-shrink-0 ${
                task.completed
                  ? "bg-amber-500 border-amber-500 text-black"
                  : "border-white/30 hover:border-amber-400"
              }`}
            >
              {task.completed && <Check className="w-3 h-3 stroke-[3]" />}
            </button>
            <span
              className={`flex-1 text-xs break-all ${
                task.completed ? "line-through text-white/30" : ""
              }`}
            >
              {task.text}
            </span>
            <button
              onClick={() => removeTask(task.id)}
              className="transition-opacity opacity-0 group-hover:opacity-100 p-0.5 text-white/30 hover:text-rose-400"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        ))}
        {tasks.length === 0 && (
          <div className="py-6 text-center text-white/30 text-xs">No tasks yet.</div>
        )}
      </div>

      {/* Add Task Input */}
      <form onSubmit={addTask} className="flex gap-1.5 pt-2 mt-2 border-t border-white/5">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="New task..."
          className="flex-1 px-2.5 py-1 text-xs rounded-md bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-amber-400/50"
        />
        <button
          type="submit"
          className="p-1 rounded-md bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
