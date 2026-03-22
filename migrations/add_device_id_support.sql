-- 添加设备ID支持，允许匿名用户登录
-- 执行时间：2024年

-- 添加 device_id 字段
ALTER TABLE users ADD COLUMN device_id VARCHAR(255) UNIQUE DEFAULT NULL;
CREATE INDEX idx_device_id ON users(device_id);

-- 添加 is_anonymous 字段
ALTER TABLE users ADD COLUMN is_anonymous INT DEFAULT 0 COMMENT '是否为匿名用户：0=否，1=是';

-- 修改 password_hash 为可选（对于已有数据不会有影响）
-- ALTER TABLE users MODIFY password_hash VARCHAR(255) NULL;
