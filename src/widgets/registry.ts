import React from "react";
import { ClockWidget } from "./information/ClockWidget";
import { TimerWidget } from "./productivity/TimerWidget";
import { PomodoroWidget } from "./productivity/PomodoroWidget";
import { TodoListWidget } from "./productivity/TodoListWidget";

export interface WidgetDefinition {
  type: string;
  name: string;
  category: "productivity" | "information" | "scheduling" | "system-monitor";
  defaultWidth: number;
  defaultHeight: number;
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
    component: ClockWidget,
  },
  timer: {
    type: "timer",
    name: "Countdown Timer",
    category: "productivity",
    defaultWidth: 280,
    defaultHeight: 180,
    component: TimerWidget,
  },
  pomodoro: {
    type: "pomodoro",
    name: "Pomodoro Focus",
    category: "productivity",
    defaultWidth: 290,
    defaultHeight: 200,
    component: PomodoroWidget,
  },
  "todo-list": {
    type: "todo-list",
    name: "To-do List",
    category: "productivity",
    defaultWidth: 320,
    defaultHeight: 320,
    component: TodoListWidget,
  },
};
