import type { CanvasWidget } from "@/types";

export interface WorkspaceTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  badge?: string;
  widgetCount: number;
  tags: string[];
  widgets: Omit<CanvasWidget, "id">[];
}

export const WORKSPACE_TEMPLATES: WorkspaceTemplate[] = [
  {
    id: "personal-productivity",
    name: "Personal Productivity",
    category: "Personal Productivity",
    description: "All-in-one focus workspace: live clock, priority tasks, countdown, and custom thoughts.",
    badge: "Popular",
    widgetCount: 4,
    tags: ["Focus", "Daily", "Tasks"],
    widgets: [
      { type: "clock", x: 140, y: 80, width: 260, height: 140, zIndex: 1, settings: {} },
      { type: "todo-list", x: 430, y: 80, width: 330, height: 350, zIndex: 2, settings: {} },
      { type: "pomodoro", x: 790, y: 80, width: 300, height: 210, zIndex: 3, settings: {} },
      { type: "custom", x: 790, y: 310, width: 300, height: 180, zIndex: 4, settings: { title: "Daily Focus Note", content: "1. Ship the Canva UI redesign\n2. Verify Wayland triggers\n3. Review analytics" } },
    ],
  },
  {
    id: "daily-planner",
    name: "Daily Planner",
    category: "Daily Planner",
    description: "Structure your daily timetable alongside quick tasks and focus sessions.",
    badge: "Recommended",
    widgetCount: 4,
    tags: ["Planning", "Agenda", "Schedule"],
    widgets: [
      { type: "clock", x: 120, y: 70, width: 250, height: 130, zIndex: 1, settings: {} },
      { type: "schedule", x: 400, y: 70, width: 320, height: 280, zIndex: 2, settings: {} },
      { type: "todo-list", x: 750, y: 70, width: 330, height: 350, zIndex: 3, settings: {} },
      { type: "timer", x: 120, y: 220, width: 250, height: 170, zIndex: 4, settings: {} },
    ],
  },
  {
    id: "project-management",
    name: "Project Management Board",
    category: "Project Management",
    description: "Track team milestones, active sprint progress, deliverables, and workload analytics.",
    badge: "Trending",
    widgetCount: 3,
    tags: ["Projects", "Milestones", "Agile"],
    widgets: [
      { type: "project-overview", x: 140, y: 80, width: 350, height: 340, zIndex: 1, settings: {} },
      { type: "analytics", x: 520, y: 80, width: 340, height: 240, zIndex: 2, settings: {} },
      { type: "todo-list", x: 890, y: 80, width: 320, height: 340, zIndex: 3, settings: {} },
    ],
  },
  {
    id: "student-workspace",
    name: "Student Study Workspace",
    category: "Student Planner",
    description: "Optimized for study sessions, lecture blocking, pomodoro bursts, and assignment checklists.",
    widgetCount: 4,
    tags: ["Study", "Academics", "Pomodoro"],
    widgets: [
      { type: "pomodoro", x: 140, y: 80, width: 290, height: 200, zIndex: 1, settings: {} },
      { type: "schedule", x: 460, y: 80, width: 310, height: 260, zIndex: 2, settings: {} },
      { type: "todo-list", x: 800, y: 80, width: 320, height: 340, zIndex: 3, settings: {} },
      { type: "custom", x: 140, y: 300, width: 290, height: 180, zIndex: 4, settings: { title: "Study Checklist & Formulas", content: "• Chapter 4 review\n• Discrete Mathematics set theory\n• Lab submission before 5 PM" } },
    ],
  },
  {
    id: "dev-system-monitor",
    name: "Developer & SysOps Monitor",
    category: "Minimal Workspace",
    description: "Keep CPU, RAM, network bandwidth, and active build tasks directly visible on your canvas.",
    widgetCount: 4,
    tags: ["System", "DevOps", "Performance"],
    widgets: [
      { type: "system-monitor", x: 140, y: 80, width: 300, height: 220, zIndex: 1, settings: {} },
      { type: "clock", x: 470, y: 80, width: 260, height: 140, zIndex: 2, settings: {} },
      { type: "todo-list", x: 760, y: 80, width: 330, height: 340, zIndex: 3, settings: {} },
      { type: "analytics", x: 140, y: 320, width: 320, height: 220, zIndex: 4, settings: {} },
    ],
  },
  {
    id: "minimal-zen",
    name: "Minimal Zen Workspace",
    category: "Minimal Workspace",
    description: "Zero clutter: only an obsidian clock, single countdown, and your top priority focus note.",
    widgetCount: 3,
    tags: ["Minimal", "Zen", "Clean"],
    widgets: [
      { type: "clock", x: 260, y: 120, width: 280, height: 150, zIndex: 1, settings: {} },
      { type: "timer", x: 570, y: 120, width: 280, height: 180, zIndex: 2, settings: {} },
      { type: "custom", x: 400, y: 320, width: 340, height: 190, zIndex: 3, settings: { title: "One Big Thing Today", content: "Deliver a world-class desktop productivity canvas." } },
    ],
  },
];

