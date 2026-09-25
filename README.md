# 消防设施巡检维保平台

面向园区和物业公司的消防设备巡检、隐患整改、维保计划和合规台账系统。

## 快速启动

```bash
cp .env.example .env && docker compose up -d
```

## 访问地址或 CLI 示例

前端：<http://localhost:20103>

后端健康检查：<http://localhost:21103/health>

## 演示账号（统一密码 `123456`）

| 账号 | 姓名 | 角色 | 能做什么 |
|---|---|---|---|
| `wangjianguo` | 王建国 | 物业主管 | 楼栋/设备建档、创建任务、复核、隐患派单、整改、复验关闭 |
| `lilei` / `hanmeimei` | 李雷 / 韩梅梅 | 巡检员 | 领取任务、逐项填写检查项、提交 |
| `zhaosi` | 赵四 | 维保商 | 填写整改结果 |
| `qianshen` | 钱审计 | 审计员 | 只读查看 + 操作日志 |

## 一次完整巡检流程

1. 主管登录 →「巡检任务」新建任务（按楼栋设备自动生成检查项）。
2. 巡检员登录 →「巡检任务」领取任务 →「填写检查」逐项判定正常/异常并提交。
3. 主管在「巡检任务」复核通过。
4. 主管在「隐患整改」对待派单的异常结果派单（定级、责任人、期限），设备自动标记为故障。
5. 维保商或主管填写整改结果 → 主管复验关闭，设备无其他未闭环隐患时自动恢复正常。
6. 「消防合规总览」与「合规报表」实时汇总完成率、逾期整改数与设备状态。

## 本地开发方式

- 前端：`cd frontend && npm install && npm run dev`（已配置 `/api` 代理到 `localhost:21103`）
- 后端：`cd backend && pip install -r requirements.txt && uvicorn src.main:app --port 21103`，接口统一挂在 `/api`。
- 本地无 PostgreSQL 时可用 `DATABASE_URL=sqlite:///./dev.db uvicorn src.main:app` 调试；首次启动自动建表并写入种子数据。

## 技术栈

| 层 | 技术 |
|---|---|
| 前端 | React 18 + TypeScript + Vite + Material UI + Redux Toolkit |
| 后端 | FastAPI + Python 3.11 + SQLAlchemy 2.0 |
| 数据库 | PostgreSQL 15 |
| 部署 | Docker Compose |

## 项目目录结构

```text
frontend/src/api, stores, types, constants, constructors, components/common, hooks, pages, router, utils, mocks
backend/src/routes, controllers, services, models, repositories, middlewares, constants, constructors, utils, types, config
```

## 环境变量说明

- `COMPOSE_PROJECT_NAME`: Compose 项目名，默认 `fire-inspect`
- `FRONTEND_PORT`: 前端端口，默认 `20103`
- `BACKEND_PORT`: 后端端口，默认 `21103`
- `DB_PORT`: 数据库宿主机端口
- `DB_USER/DB_PASSWORD/DB_NAME`: 本地数据库凭据
- `JWT_SECRET`: JWT 签名密钥，默认 `local-dev-secret`
- `JWT_EXPIRE_MINUTES`: 登录态有效期（分钟），默认 `720`
- `RATE_LIMIT_PER_MINUTE`: 单 IP 每分钟请求上限，默认 `600`
- `DATABASE_URL`: 后端连接串整体覆盖项，默认按 `DB_*` 拼接 PostgreSQL 地址

## Docker 部署说明

- 根 Compose 文件不写 `version`，顶层 `name: fire-inspect`。
- 容器名均使用 `${COMPOSE_PROJECT_NAME:-fire-inspect}` 前缀。
- 数据库使用命名卷，避免绑定中文路径。
- 数据库与后端均配置 healthcheck，前端等待后端健康后启动。
- 数据库表结构由 `database/init.sql` 创建，种子数据由后端首次启动时写入（仅空库）。
- 常见问题：端口占用时修改 `.env` 中端口后重启；需要重置数据时执行 `docker compose down -v`。

## 枚举/常量出现位置清单

- DeviceType: `frontend/src/constants/DeviceType.ts` + `types/DeviceType.ts`、`backend/src/constants/device_type.py`、前后端构造器、`constants/checklistItems.*`、日志模板、错误消息、设备页筛选器、展示组件均有引用。
- InspectionStatus: `frontend/src/constants/InspectionStatus.ts` + `types/InspectionStatus.ts`、`backend/src/constants/inspection_status.py`、构造器、日志模板、错误消息、任务页筛选器、StatusBadge 均有引用。
- HazardSeverity: `frontend/src/constants/HazardSeverity.ts` + `types/HazardSeverity.ts`、`backend/src/constants/hazard_severity.py`、构造器、日志模板、错误消息、隐患页筛选器、HazardSeverityTag 均有引用。
- DeviceStatus / ResultStatus / RectifyStatus / TaskType / Role: 同目录下同名常量与类型文件成对出现，并被构造器、格式化器、筛选器与页面引用。

## 为什么会牵一发动全身

实体字段、枚举、日志模板、错误消息、构造器、筛选器和展示组件被刻意拆散到多个目录；修改一个状态值通常需要同步类型、构造器、服务、控制器、store、页面、README 与数据库种子。

## License

MIT
