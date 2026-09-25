import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { routes } from "./router/routes";
import { useAuthStore } from "./stores/AuthStore";
import { ROLE_TEXT } from "./constants/Role";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { DevicesPage } from "./pages/DevicesPage";
import { TasksPage } from "./pages/TasksPage";
import { HazardsPage } from "./pages/HazardsPage";
import { ReportsPage } from "./pages/ReportsPage";
import "./styles.css";

const PAGES: Record<string, () => React.JSX.Element> = {
  "/dashboard": DashboardPage,
  "/devices": DevicesPage,
  "/tasks": TasksPage,
  "/hazards": HazardsPage,
  "/reports": ReportsPage,
};

function currentRoute(): string {
  const hash = window.location.hash.replace(/^#/, "");
  return PAGES[hash] ? hash : "/dashboard";
}

function App() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [route, setRoute] = useState(currentRoute);

  useEffect(() => {
    const onHashChange = () => setRoute(currentRoute());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  if (!user) {
    return <LoginPage />;
  }

  const Page = PAGES[route] ?? DashboardPage;
  const navigate = (target: string) => {
    window.location.hash = target;
  };

  return (
    <div className="shell">
      <aside>
        <div className="brand">消防设施巡检维保平台</div>
        <nav>
          {routes.map((item) => (
            <button key={item.route} className={route === item.route ? "active" : ""} onClick={() => navigate(item.route)}>
              {item.name}
            </button>
          ))}
        </nav>
        <div className="user-box">
          <strong>{user.display_name}</strong>
          <span>{ROLE_TEXT[user.role]}</span>
          <button onClick={logout}>退出登录</button>
        </div>
      </aside>
      <Page />
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
