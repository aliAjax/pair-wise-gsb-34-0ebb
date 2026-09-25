-- 消防设施巡检维保平台数据库结构（PostgreSQL 15）
-- 仅在建库首次启动时执行；业务数据由后端启动时写入种子。

CREATE TABLE IF NOT EXISTS app_user (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  display_name VARCHAR(50) NOT NULL,
  role VARCHAR(20) NOT NULL,
  password VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS building (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  campus VARCHAR(100) DEFAULT '',
  floor_count INTEGER DEFAULT 1,
  fire_grade VARCHAR(50) DEFAULT '二级',
  manager_id INTEGER DEFAULT 0,
  address_code VARCHAR(50) DEFAULT ''
);

CREATE TABLE IF NOT EXISTS fire_device (
  id SERIAL PRIMARY KEY,
  building_id INTEGER NOT NULL REFERENCES building(id),
  device_code VARCHAR(50) UNIQUE NOT NULL,
  device_type VARCHAR(30) NOT NULL,
  floor VARCHAR(20) DEFAULT '1F',
  location_desc VARCHAR(200) DEFAULT '',
  install_date DATE,
  status VARCHAR(20) DEFAULT 'NORMAL',
  next_maintenance_at DATE
);
CREATE INDEX IF NOT EXISTS idx_fire_device_building ON fire_device(building_id);

CREATE TABLE IF NOT EXISTS inspection_task (
  id SERIAL PRIMARY KEY,
  building_id INTEGER NOT NULL REFERENCES building(id),
  inspector_id INTEGER,
  plan_date DATE,
  task_type VARCHAR(30) DEFAULT 'MONTHLY',
  status VARCHAR(20) DEFAULT 'PLANNED',
  checklist_version VARCHAR(30) DEFAULT 'v2026.09',
  finished_at TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_inspection_task_building ON inspection_task(building_id);

CREATE TABLE IF NOT EXISTS inspection_result (
  id SERIAL PRIMARY KEY,
  task_id INTEGER NOT NULL REFERENCES inspection_task(id),
  device_id INTEGER NOT NULL REFERENCES fire_device(id),
  item_code VARCHAR(50) NOT NULL,
  result_status VARCHAR(20) DEFAULT 'PENDING',
  measured_value VARCHAR(100) DEFAULT '',
  photo_url VARCHAR(300) DEFAULT '',
  note VARCHAR(500) DEFAULT '',
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_inspection_result_task ON inspection_result(task_id);
CREATE INDEX IF NOT EXISTS idx_inspection_result_device ON inspection_result(device_id);

CREATE TABLE IF NOT EXISTS hazard_ticket (
  id SERIAL PRIMARY KEY,
  result_id INTEGER NOT NULL REFERENCES inspection_result(id),
  severity VARCHAR(20) DEFAULT 'MEDIUM',
  owner_id INTEGER DEFAULT 0,
  deadline DATE,
  rectify_status VARCHAR(20) DEFAULT 'OPEN',
  rectify_note VARCHAR(500) DEFAULT '',
  closed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_hazard_ticket_result ON hazard_ticket(result_id);

CREATE TABLE IF NOT EXISTS audit_log (
  id SERIAL PRIMARY KEY,
  actor VARCHAR(50) DEFAULT '',
  action VARCHAR(100) DEFAULT '',
  target_type VARCHAR(50) DEFAULT '',
  target_id VARCHAR(50) DEFAULT '',
  detail VARCHAR(300) DEFAULT '',
  created_at TIMESTAMP DEFAULT NOW()
);
