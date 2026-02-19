"use client";

import React from "react";
import { useFormStatus } from "react-dom";
import { useToast } from "../components/toast.client";

type Task = {
  id: number;
  title: string;
  description: string | null;
  dueDate: string | null;
  recurrence: string | null;
  completedAt: string | null;
  taskType: string | null;
  bedLabel: string | null;
};

export function TaskList({
  tasks,
  completeAction,
  uncompleteAction,
  deleteAction,
}: {
  tasks: Task[];
  completeAction: (formData: FormData) => Promise<{ success: boolean }>;
  uncompleteAction: (formData: FormData) => Promise<{ success: boolean }>;
  deleteAction: (formData: FormData) => Promise<{ success: boolean }>;
}) {
  const [filter, setFilter] = React.useState<"pending" | "completed" | "all">("pending");
  const { addToast } = useToast();

  const filtered = tasks.filter((t) => {
    if (filter === "pending") return !t.completedAt;
    if (filter === "completed") return !!t.completedAt;
    return true;
  });

  const overdue = filtered.filter((t) => {
    if (t.completedAt || !t.dueDate) return false;
    return new Date(t.dueDate) < new Date(new Date().toISOString().split("T")[0]);
  });

  const upcoming = filtered.filter((t) => {
    if (t.completedAt) return false;
    if (!t.dueDate) return true;
    return new Date(t.dueDate) >= new Date(new Date().toISOString().split("T")[0]);
  });

  const completed = filtered.filter((t) => !!t.completedAt);

  const taskTypeColors: Record<string, string> = {
    indoor_start: "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
    direct_sow: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
    transplant: "bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
    harvest: "bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
    watering: "bg-cyan-50 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400",
    custom: "bg-gray-50 text-gray-600 dark:bg-gray-700 dark:text-gray-400",
  };

  function renderTask(task: Task) {
    const isOverdue = !task.completedAt && task.dueDate && new Date(task.dueDate) < new Date(new Date().toISOString().split("T")[0]);

    return (
      <div
        key={task.id}
        className={`flex items-center gap-3 p-3 rounded-lg transition ${
          task.completedAt
            ? "bg-gray-50 dark:bg-gray-700/30 opacity-60"
            : isOverdue
              ? "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
              : "bg-earth-50 dark:bg-gray-700/50"
        }`}
      >
        <form
          action={async (formData) => {
            const action = task.completedAt ? uncompleteAction : completeAction;
            await action(formData);
            addToast(
              task.completedAt ? "Task reopened" : "Task completed!",
              "success",
            );
          }}
        >
          <input type="hidden" name="id" value={task.id} />
          <button
            type="submit"
            className={`w-5 h-5 rounded border-2 flex items-center justify-center cursor-pointer transition ${
              task.completedAt
                ? "bg-garden-600 border-garden-600 text-white"
                : "border-gray-300 dark:border-gray-500 hover:border-garden-500"
            }`}
          >
            {task.completedAt && (
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </button>
        </form>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium ${task.completedAt ? "line-through text-gray-400 dark:text-gray-500" : "text-gray-900 dark:text-gray-100"}`}>
            {task.title}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            {task.dueDate && (
              <span className={`text-xs ${isOverdue ? "text-red-600 dark:text-red-400 font-medium" : "text-gray-500 dark:text-gray-400"}`}>
                {isOverdue ? "Overdue: " : ""}
                {new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </span>
            )}
            {task.bedLabel && (
              <span className="text-xs text-gray-400 dark:text-gray-500">{task.bedLabel}</span>
            )}
          </div>
        </div>
        {task.taskType && (
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${taskTypeColors[task.taskType] ?? taskTypeColors.custom}`}>
            {task.taskType.replace("_", " ")}
          </span>
        )}
        <form
          action={async (formData) => {
            await deleteAction(formData);
            addToast("Task deleted", "success");
          }}
        >
          <input type="hidden" name="id" value={task.id} />
          <button
            type="submit"
            className="p-1 text-gray-400 hover:text-red-500 dark:hover:text-red-400 cursor-pointer transition"
            title="Delete"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        {(["pending", "completed", "all"] as const).map((f) => (
          <button
            key={f}
            type="button"
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition cursor-pointer ${
              filter === f
                ? "bg-garden-50 text-garden-700 dark:bg-garden-900/30 dark:text-garden-400"
                : "text-gray-500 hover:text-gray-900 hover:bg-earth-50 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-800"
            }`}
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {overdue.length > 0 && filter !== "completed" && (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-wide">
            Overdue ({overdue.length})
          </h3>
          {overdue.map(renderTask)}
        </div>
      )}

      {upcoming.length > 0 && filter !== "completed" && (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Upcoming ({upcoming.length})
          </h3>
          {upcoming.map(renderTask)}
        </div>
      )}

      {completed.length > 0 && filter !== "pending" && (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">
            Completed ({completed.length})
          </h3>
          {completed.map(renderTask)}
        </div>
      )}

      {filtered.length === 0 && (
        <div className="text-center py-8">
          <p className="text-sm text-gray-400 dark:text-gray-500">
            {filter === "pending" ? "No pending tasks. You're all caught up!" : "No tasks found."}
          </p>
        </div>
      )}
    </div>
  );
}

export function AddTaskForm({
  createAction,
}: {
  createAction: (formData: FormData) => Promise<{ success: boolean; error?: string }>;
}) {
  const [open, setOpen] = React.useState(false);
  const { addToast } = useToast();

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-garden-600 dark:text-garden-400 hover:text-garden-700 dark:hover:text-garden-300 cursor-pointer"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        Add Task
      </button>
    );
  }

  return (
    <form
      className="bg-earth-50 dark:bg-gray-700/50 rounded-lg p-4 space-y-3"
      action={async (formData) => {
        const result = await createAction(formData);
        if (result.success) {
          setOpen(false);
          addToast("Task added!", "success");
        } else {
          addToast(result.error ?? "Failed to add task.", "error");
        }
      }}
    >
      <input
        name="title"
        type="text"
        placeholder="Task title..."
        required
        className="w-full rounded-lg border border-earth-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:border-garden-500 focus:ring-2 focus:ring-garden-500/20 focus:outline-none transition placeholder:text-gray-400"
      />
      <div className="grid grid-cols-2 gap-3">
        <input
          name="dueDate"
          type="date"
          className="w-full rounded-lg border border-earth-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:border-garden-500 focus:ring-2 focus:ring-garden-500/20 focus:outline-none transition"
        />
        <select
          name="recurrence"
          className="w-full rounded-lg border border-earth-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:border-garden-500 focus:ring-2 focus:ring-garden-500/20 focus:outline-none transition"
        >
          <option value="">No repeat</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="biweekly">Every 2 weeks</option>
          <option value="monthly">Monthly</option>
        </select>
      </div>
      <textarea
        name="description"
        placeholder="Notes (optional)"
        rows={2}
        className="w-full rounded-lg border border-earth-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:border-garden-500 focus:ring-2 focus:ring-garden-500/20 focus:outline-none transition placeholder:text-gray-400 resize-none"
      />
      <div className="flex items-center gap-2">
        <SubmitButton />
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function SubmitButton() {
  const status = useFormStatus();
  return (
    <button
      type="submit"
      disabled={status.pending}
      className="inline-flex items-center gap-2 rounded-lg bg-garden-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-garden-700 disabled:opacity-50 transition-colors cursor-pointer"
    >
      {status.pending ? "Adding..." : "Add Task"}
    </button>
  );
}
