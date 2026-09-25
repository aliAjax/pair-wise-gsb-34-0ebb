import type { ComponentType } from "react";
import { DashboardPage } from "../pages/DashboardPage";
import { DevicesPage } from "../pages/DevicesPage";
import { HazardsPage } from "../pages/HazardsPage";
import { ReportsPage } from "../pages/ReportsPage";
import { TasksPage } from "../pages/TasksPage";

export interface AppRoute {
  name: string;
  route: string;
  component: ComponentType;
}

export const routes: AppRoute[] = [
  { name: "消防合规总览", route: "/dashboard", component: DashboardPage },
  { name: "消防设备台账", route: "/devices", component: DevicesPage },
  { name: "巡检任务", route: "/tasks", component: TasksPage },
  { name: "隐患整改", route: "/hazards", component: HazardsPage },
  { name: "合规报表", route: "/reports", component: ReportsPage },
];
