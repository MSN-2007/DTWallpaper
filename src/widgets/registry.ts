import React from "react";
import { ClockWidget } from "./information/ClockWidget";
import { TimerWidget } from "./productivity/TimerWidget";
import { PomodoroWidget } from "./productivity/PomodoroWidget";
import { TodoListWidget } from "./productivity/TodoListWidget";
import { CustomWidget } from "./custom/CustomWidget";

export interface WidgetDefinition {
  type: string;
  name: string;
  category: "productivity" | "information" | "scheduling" | "system-monitor" | "custom";
  defaultWidth: number;
  defaultHeight: number;
  description?: string;
  component: React.ComponentType<{
    settings?: Record<string, unknown>;
    onUpdateSettings?: (settings: Record<string, unknown>) => void;
  }>;
}

export const WIDGET_REGISTRY: Record<string, WidgetDefinition> = {
  clock: {
    type: "clock",
    name: "Clock & Date",
    category: "information",
    defaultWidth: 260,
    defaultHeight: 140,
    description: "Displays current time, day, and date in obsidian dark style.",
    component: ClockWidget,
  },
  timer: {
    type: "timer",
    name: "Countdown Timer",
    category: "productivity",
    defaultWidth: 280,
    defaultHeight: 180,
    description: "Precision countdown timer with preset shortcuts and progress tracking.",
    component: TimerWidget,
  },
  pomodoro: {
    type: "pomodoro",
    name: "Pomodoro Focus",
    category: "productivity",
    defaultWidth: 290,
    defaultHeight: 200,
    description: "25/5/15 minute focus cycle timer with completed session counters.",
    component: PomodoroWidget,
  },
  "todo-list": {
    type: "todo-list",
    name: "To-do List",
    category: "productivity",
    defaultWidth: 320,
    defaultHeight: 320,
    description: "Interactive task manager with completion toggles and persistent items.",
    component: TodoListWidget,
  },
  custom: {
    type: "custom",
    name: "Custom Note & Block",
    category: "custom",
    defaultWidth: 280,
    defaultHeight: 200,
    description: "User-configurable custom text, code, or markdown block.",
    component: CustomWidget,
  },
};

/**
 * Register a new custom widget at runtime or via plugins.
 */
export function registerWidget(definition: WidgetDefinition) {
  WIDGET_REGISTRY[definition.type] = definition;
}
