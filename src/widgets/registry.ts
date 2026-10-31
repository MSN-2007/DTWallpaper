import React from "react";
import { ClockWidget } from "./information/ClockWidget";
import { TimerWidget } from "./productivity/TimerWidget";
import { PomodoroWidget } from "./productivity/PomodoroWidget";
import { TodoListWidget } from "./productivity/TodoListWidget";
import { CustomWidget } from "./custom/CustomWidget";
import { ProjectOverviewWidget } from "./project/ProjectOverviewWidget";
import { DailyScheduleWidget } from "./scheduling/DailyScheduleWidget";
import { ProductivityAnalyticsWidget } from "./analytics/ProductivityAnalyticsWidget";
import { SystemMonitorWidget } from "./system/SystemMonitorWidget";

export type WidgetCategory =
  | "productivity"
  | "project"
  | "scheduling"
  | "analytics"
  | "system"
  | "information"
  | "custom";

export interface WidgetDefinition {
  type: string;
  name: string;
  category: WidgetCategory;
  defaultWidth: number;
  defaultHeight: number;
  description: string;
  badge?: string;
  component: React.ComponentType<{
    settings?: Record<string, unknown>;
    onUpdateSettings?: (settings: Record<string, unknown>) => void;
  }>;
}

export const WIDGET_REGISTRY: Record<string, WidgetDefinition> = {
  // Information
  clock: {
    type: "clock",
    name: "Clock & Date",
    category: "information",
    defaultWidth: 260,
    defaultHeight: 140,
    description: "Displays current time, day, and date in obsidian dark typography.",
    component: ClockWidget,
  },
  // Productivity
  timer: {
    type: "timer",
    name: "Countdown Timer",
    category: "productivity",
    defaultWidth: 280,
    defaultHeight: 180,
    description: "Precision countdown timer with preset buttons and progress bar.",
    component: TimerWidget,
  },
  pomodoro: {
    type: "pomodoro",
    name: "Pomodoro Focus",
    category: "productivity",
    defaultWidth: 290,
    defaultHeight: 200,
    description: "25/5/15 minute interval focus cycles with completed cycle tracking.",
    component: PomodoroWidget,
  },
  "todo-list": {
    type: "todo-list",
    name: "To-do List",
    category: "productivity",
    defaultWidth: 320,
    defaultHeight: 320,
    description: "Interactive task list with completion toggles, counters, and quick add.",
    component: TodoListWidget,
  },
  // Project Management
  "project-overview": {
    type: "project-overview",
    name: "Projects & Milestones",
    category: "project",
    defaultWidth: 320,
    defaultHeight: 260,
    description: "Active sprint roadmaps, milestone percentages, and project deadlines.",
    component: ProjectOverviewWidget,
  },
  // Scheduling
  schedule: {
    type: "schedule",
    name: "Daily Timetable",
    category: "scheduling",
    defaultWidth: 300,
    defaultHeight: 240,
    description: "Time-blocked daily agenda, meetings, and key daily checkpoints.",
    component: DailyScheduleWidget,
  },
  // Analytics
  analytics: {
    type: "analytics",
    name: "Productivity Analytics",
    category: "analytics",
    defaultWidth: 320,
    defaultHeight: 220,
    description: "Task completion velocity graph, deep work hours, and weekly metrics.",
    component: ProductivityAnalyticsWidget,
  },
  // System Monitor
  "system-monitor": {
    type: "system-monitor",
    name: "System Resources",
    category: "system",
    defaultWidth: 280,
    defaultHeight: 210,
    description: "Real-time CPU, RAM, SSD storage, and network bandwidth meters.",
    component: SystemMonitorWidget,
  },
  // Custom
  custom: {
    type: "custom",
    name: "Custom Note & Block",
    category: "custom",
    defaultWidth: 280,
    defaultHeight: 200,
    description: "User-configurable text, code, or markdown notepad block.",
    component: CustomWidget,
  },
};

export function registerWidget(definition: WidgetDefinition) {
  WIDGET_REGISTRY[definition.type] = definition;
}
