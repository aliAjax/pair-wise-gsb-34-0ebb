import { useState } from "react";
import { UserRoleText } from "../constants/UserRole";
import { useAuthStore } from "../stores/AuthStore";

const DEMO_ACCOUNTS = [
  { username: "admin", password: "admin123", desc: "王主管", role: "SUPERVISOR" as const },
  { username: "inspector1", password: "inspect123", desc: "张巡检", role: "INSPECTOR" as const },
  { username: "inspector2", password: "inspect123", desc: "李巡检", role: "INSPECTOR" as const },
  { username: "maintainer1", password: "maintain123", desc: "赵维保", role: "MAINTAINER" as const },
  { username: "auditor1", password: "audit123", desc: "钱审计", role: "AUDITOR" as const },
];

export function LoginPage() {
  const login = useAuthStore((s) => s.login);
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (u = username, p = password) => {
    setBusy(true);
    setError(null);
    try {
      await login(u, p);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="login-shell">
      <form
        className="login-card"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <p className="eyebrow">fire-inspect</p>
        <h1>消防设施巡检维保平台</h1>
        <p className="muted">物业巡检 · 隐患整改 · 合规台账</p>
        <input
          value={username}
          placeholder="用户名"
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          value={password}
          placeholder="密码"
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="danger-text">{error}</p>}
        <button className="primary" disabled={busy} type="submit">
          {busy ? "登录中…" : "登录"}
        </button>
        <div className="demo-accounts">
          <p className="muted">演示账号（点击直接填充并登录）：</p>
          {DEMO_ACCOUNTS.map((a) => (
            <button
              key={a.username}
              type="button"
              className="demo-account"
              onClick={() => {
                setUsername(a.username);
                setPassword(a.password);
                submit(a.username, a.password);
              }}
            >
              <strong>{a.desc}</strong>
              <span>{UserRoleText[a.role]}</span>
              <em>{a.username}</em>
            </button>
          ))}
        </div>
      </form>
    </div>
  );
}
