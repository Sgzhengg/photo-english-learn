-- 拍照学英语 - PostgreSQL 数据库初始化脚本

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nickname VARCHAR(50),
    avatar_url VARCHAR(512),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 场景照片表
CREATE TABLE IF NOT EXISTS scenes (
    scene_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    image_url VARCHAR(512) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_scenes_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_scenes_user_id ON scenes(user_id);
CREATE INDEX IF NOT EXISTS idx_scenes_created_at ON scenes(created_at);

-- 检测物体表
CREATE TABLE IF NOT EXISTS detected_objects (
    object_id SERIAL PRIMARY KEY,
    scene_id INT NOT NULL,
    object_name VARCHAR(100) NOT NULL,
    english_word VARCHAR(100) NOT NULL,
    confidence FLOAT,
    bounding_box JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_detected_objects_scene FOREIGN KEY (scene_id) REFERENCES scenes(scene_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_detected_objects_scene_id ON detected_objects(scene_id);
CREATE INDEX IF NOT EXISTS idx_detected_objects_english_word ON detected_objects(english_word);

-- 单词表
CREATE TABLE IF NOT EXISTS words (
    word_id SERIAL PRIMARY KEY,
    english_word VARCHAR(100) NOT NULL UNIQUE,
    chinese_meaning TEXT,
    phonetic_us VARCHAR(50),
    phonetic_uk VARCHAR(50),
    audio_url VARCHAR(512),
    example_sentence TEXT,
    example_translation TEXT,
    image_url VARCHAR(512),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_words_english_word ON words(english_word);

-- 用户生词表
CREATE TABLE IF NOT EXISTS user_words (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    word_id INT NOT NULL,
    scene_id INT,
    tag_id INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_words_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_user_words_word FOREIGN KEY (word_id) REFERENCES words(word_id) ON DELETE CASCADE,
    CONSTRAINT fk_user_words_scene FOREIGN KEY (scene_id) REFERENCES scenes(scene_id) ON DELETE SET NULL,
    CONSTRAINT fk_user_words_tag FOREIGN KEY (tag_id) REFERENCES tags(tag_id),
    CONSTRAINT uk_user_word UNIQUE (user_id, word_id)
);

CREATE INDEX IF NOT EXISTS idx_user_words_user_id ON user_words(user_id);
CREATE INDEX IF NOT EXISTS idx_user_words_tag_id ON user_words(tag_id);

-- 场景短句表
CREATE TABLE IF NOT EXISTS scene_sentences (
    sentence_id SERIAL PRIMARY KEY,
    scene_id INT NOT NULL,
    sentence_text TEXT NOT NULL,
    sentence_translation TEXT,
    audio_url VARCHAR(512),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_scene_sentences_scene FOREIGN KEY (scene_id) REFERENCES scenes(scene_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_scene_sentences_scene_id ON scene_sentences(scene_id);

-- 复习记录表
CREATE TABLE IF NOT EXISTS review_records (
    record_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    word_id INT NOT NULL,
    level INT DEFAULT 0,
    next_review_time TIMESTAMP NOT NULL,
    total_correct INT DEFAULT 0,
    total_wrong INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_review_records_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_review_records_word FOREIGN KEY (word_id) REFERENCES words(word_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_review_records_user_next_review ON review_records(user_id, next_review_time);
CREATE INDEX IF NOT EXISTS idx_review_records_word_id ON review_records(word_id);

-- 标签表
CREATE TABLE IF NOT EXISTS tags (
    tag_id SERIAL PRIMARY KEY,
    tag_name VARCHAR(50) NOT NULL,
    description VARCHAR(255),
    color VARCHAR(7),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 跟读记录表
CREATE TABLE IF NOT EXISTS practice_records (
    record_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    sentence_id INT NOT NULL,
    user_audio_url VARCHAR(512),
    pronunciation_score FLOAT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_practice_records_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_practice_records_sentence FOREIGN KEY (sentence_id) REFERENCES scene_sentences(sentence_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_practice_records_user_id ON practice_records(user_id);

-- 插入默认标签
INSERT INTO tags (tag_name, description, color) VALUES
('生词', '新学习的单词', '#ff6b6b'),
('学习中', '正在学习的单词', '#ffd93d'),
('熟悉', '已经熟悉的单词', '#6bcb77'),
('掌握', '完全掌握的单词', '#4d96ff')
ON CONFLICT DO NOTHING;

-- 创建管理员用户 (密码: admin123, bcrypt hash)
INSERT INTO users (username, email, password_hash, nickname) VALUES
('admin', 'admin@photoenglish.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYzpLaEmc0i', '管理员')
ON CONFLICT (username) DO NOTHING;

-- 创建更新时间戳的触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 为 users 表创建触发器
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 为 review_records 表创建触发器
DROP TRIGGER IF EXISTS update_review_records_updated_at ON review_records;
CREATE TRIGGER update_review_records_updated_at
    BEFORE UPDATE ON review_records
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
