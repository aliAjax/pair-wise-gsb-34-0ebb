import { useState } from "react";
import { createRoot } from "react-dom/client";
import { StatusBadge } from "./components/common/StatusBadge";
import { UserRoleText } from "./constants/UserRole";
import { LoginPage } from "./pages/LoginPage";
import { routes } from "./router/routes";
import { useAuthStore } from "./stores/AuthStore";
import "./styles.css";

function Shell() {
  const [active, setActive] = useState<string>(routes[0].route);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const current = routes.find((route) => route.route === active) ?? routes[0];
  const Page = current.component;

  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="shell">
      <aside>
        <div className="brand">消防设施巡检维保平台</div>
        <nav>
          {routes.map((route) => (
            <button
              key={route.route}
              className={active === route.route ? "active" : ""}
              onClick={() => setActive(route.route)}
            >
              {route.name}
            </button>
          ))}
        </nav>
        <div className="user-card">
          <strong>{user.display_name}</strong>
          <span>{UserRoleText[user.role as keyof typeof UserRoleText] ?? user.role}</span>
          <button className="ghost logout" onClick={logout}>退出登录</button>
        </div>
      </aside>
      <main className="page">
        <section className="page-head">
          <div>
            <p className="eyebrow">fire-inspect</p>
            <h1>{current.name}</h1>
          </div>
          <StatusBadge value={user.role} />
        </section>
        <Page key={active} />
      </main>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<Shell />);
