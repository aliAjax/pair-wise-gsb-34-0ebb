# 消防设施巡检维保平台

面向园区和物业公司的消防设备巡检、隐患整改、维保计划和合规台账系统：楼栋/设备/任务/检查结果/隐患整改单全链路落库，巡检员领取任务逐项检查后提交，主管对异常结果派单、整改、复验关闭，首页与合规报表实时汇总完成率、逾期整改与设备状态。

## 快速启动

```bash
cp .env.example .env && docker compose up -d
```

## 访问地址或 CLI 示例

前端：<http://localhost:20103>

后端健康检查：<http://localhost:21103/health>

接口示例（先登录拿 token，再访问业务接口）：

```bash
TOKEN=$(curl -s -X POST http://localhost:21103/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"admin","password":"admin123"}' | python3 -c "import sys,json;print(json.load(sys.stdin)['token'])")
curl -s http://localhost:21103/api/dashboard/summary -H "Authorization: Bearer $TOKEN"
```

## 演示账号

| 用户名 | 密码 | 角色 | 能做什么 |
|---|---|---|---|
| admin | admin123 | 物业主管 | 建档/登记设备、创建计划、复核任务、异常派单、复验关闭 |
| inspector1 / inspector2 | inspect123 | 巡检员 | 领取任务、逐项检查、保存草稿、提交巡检 |
| maintainer1 | maintain123 | 维保商 | 查看派给自己的整改单、填写整改 |
| auditor1 | audit123 | 审计员 | 只读查看台账、任务、隐患与报表 |

## 业务闭环

1. **巡检闭环**：主管创建巡检计划（楼栋 + 设备类型 + 计划日期）→ 巡检员领取（任务转 IN_PROGRESS）→ 按“设备 × 检查项”逐项判定正常/异常并填写实测值与说明（可保存草稿）→ 全部完成后提交（转 SUBMITTED，异常设备自动置为“故障”）→ 主管复核（转 REVIEWED）。计划日期过期未完成的任务自动标记“已逾期”。
2. **隐患闭环**：提交后异常结果进入隐患页“待派单”列表 → 主管派单（等级/责任人/期限，生成整改单）→ 维保责任人填写整改（转“待复验”）→ 主管复验：通过则关闭并恢复设备为“正常”，不通过则退回重新整改。超过期限未闭环的整改单计入“逾期整改”。
3. **看板与报表**：首页展示设备状态分布、本月巡检完成率、逾期整改数、高危未闭环隐患与最近操作日志；报表页按月输出巡检完成率、整改关闭率、设备故障率、近 6 个月趋势与楼栋明细，均随最新业务数据实时计算。

## 本地开发方式

- 前端：`cd frontend && npm install && npm run dev`（默认 20103 端口，`/api` 已代理到 21103）
- 后端：`cd backend && pip install -r requirements.txt && uvicorn src.main:app --port 21103`
  - 未配置 `DB_HOST` 时自动使用本地 SQLite 文件（`backend/fire_inspect_local.db`），首次启动自动建表并写入种子数据；配置 `DB_HOST` 后连接 PostgreSQL。
- 接口统一挂在 `/api`，前端只请求相对路径 `/api`，不硬编码任何主机名。

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
- `JWT_SECRET`: JWT 签名密钥（本地默认值仅用于开发）

## Docker 部署说明

- 根 Compose 文件不写 `version`，顶层 `name: fire-inspect`。
- 容器名均使用 `${COMPOSE_PROJECT_NAME:-fire-inspect}` 前缀。
- 数据库使用命名卷，避免绑定中文路径。
- 数据库服务配置 healthcheck，后端通过 `depends_on: condition: service_healthy` 等待数据库；后端提供 `/health` 并配置 healthcheck，前端依赖后端健康。
- 后端启动时自动建表；数据库为空时写入种子数据（楼栋/设备/任务/结果/整改单/账号），重复启动不会重复写入。
- 常见问题：端口占用时修改 `.env` 中端口后重启；需要重置数据时执行 `docker compose down -v`。

## 枚举/常量出现位置清单

- DeviceType: constants/DeviceType、types/DeviceType、constructors、logTemplates、errorMessages、筛选器、展示组件/控制器均有引用。
- InspectionStatus: constants/InspectionStatus、types/InspectionStatus、constructors、logTemplates、errorMessages、筛选器、展示组件/控制器均有引用。
- HazardSeverity: constants/HazardSeverity、types/HazardSeverity、constructors、logTemplates、errorMessages、筛选器、展示组件/控制器均有引用。

## 为什么会牵一发动全身

实体字段、枚举、日志模板、错误消息、构造器、筛选器和展示组件被刻意拆散到多个目录；修改一个状态值通常需要同步类型、构造器、服务、控制器、store、页面、README 与数据库种子。

## License

MIT
