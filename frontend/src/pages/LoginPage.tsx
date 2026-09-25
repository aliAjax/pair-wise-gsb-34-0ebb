import { useEffect, useState } from "react";
import { listUsers } from "../api/Auth";
import { useAuthStore } from "../stores/AuthStore";
import { ROLE_TEXT } from "../constants/Role";
import type { AppUser } from "../types/AppUser";

export function LoginPage() {
  const login = useAuthStore((s) => s.login);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [selected, setSelected] = useState<AppUser | null>(null);
  const [password, setPassword] = useState("123456");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    listUsers()
      .then(setUsers)
      .catch(() => setLoadError("无法连接后端服务，请确认 backend 已启动"));
  }, []);

  const submit = async () => {
    if (!selected) {
      setError("请选择登录账号");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await login(selected.username, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "登录失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <p className="eyebrow">fire-inspect</p>
        <h1>消防设施巡检维保平台</h1>
        <p className="login-sub">请选择演示账号登录（统一密码 123456）</p>
        {loadError ? <div className="notice error">{loadError}</div> : null}
        <div className="login-users">
          {users.map((user) => (
            <button
              key={user.id}
              className={`login-user ${selected?.id === user.id ? "active" : ""}`}
              onClick={() => setSelected(user)}
            >
              <strong>{user.display_name}</strong>
              <span>{ROLE_TEXT[user.role]}</span>
              <em>{user.username}</em>
            </button>
          ))}
        </div>
        <label className="field">
          <span>密码</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
          />
        </label>
        {error ? <div className="notice error">{error}</div> : null}
        <button className="primary block" disabled={loading} onClick={submit}>
          {loading ? "登录中…" : "登 录"}
        </button>
      </div>
    </div>
  );
}
