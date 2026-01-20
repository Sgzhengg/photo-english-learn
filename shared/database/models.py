"""
共享数据库模型
"""
from datetime import datetime, timezone
from typing import Optional
from pydantic import BaseModel, Field
from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey, JSON, Index
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship

Base = declarative_base()


def utc_now():
    """获取当前 UTC 时间（不带时区信息）"""
    return datetime.now(timezone.utc).replace(tzinfo=None)


# SQLAlchemy Models
class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(100), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    nickname = Column(String(50))
    avatar_url = Column(String(512))
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)


class Scene(Base):
    __tablename__ = "scenes"

    scene_id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False, index=True)
    image_url = Column(String(512), nullable=False)
    description = Column(Text)
    created_at = Column(DateTime, default=utc_now, index=True)

    user = relationship("User", backref="scenes")
    detected_objects = relationship("DetectedObject", backref="scene", cascade="all, delete-orphan")
    sentences = relationship("SceneSentence", backref="scene", cascade="all, delete-orphan")


class DetectedObject(Base):
    __tablename__ = "detected_objects"

    object_id = Column(Integer, primary_key=True, autoincrement=True)
    scene_id = Column(Integer, ForeignKey("scenes.scene_id", ondelete="CASCADE"), nullable=False, index=True)
    object_name = Column(String(100), nullable=False)
    english_word = Column(String(100), nullable=False, index=True)
    confidence = Column(Float)
    bounding_box = Column(JSON)
    created_at = Column(DateTime, default=utc_now)


class Word(Base):
    __tablename__ = "words"

    word_id = Column(Integer, primary_key=True, autoincrement=True)
    english_word = Column(String(100), unique=True, nullable=False, index=True)
    chinese_meaning = Column(Text)
    # phonetic_us = Column(String(50))  # 暂时注释，待数据库更新后启用
    # phonetic_uk = Column(String(50))  # 暂时注释，待数据库更新后启用
    audio_url = Column(String(512))
    example_sentence = Column(Text)
    example_translation = Column(Text)
    image_url = Column(String(512))
    created_at = Column(DateTime, default=utc_now)


class Tag(Base):
    __tablename__ = "tags"

    tag_id = Column(Integer, primary_key=True, autoincrement=True)
    tag_name = Column(String(50), nullable=False)
    description = Column(String(255))
    color = Column(String(7))
    created_at = Column(DateTime, default=utc_now)


class UserWord(Base):
    __tablename__ = "user_words"
    __table_args__ = (
        Index('idx_user_id', 'user_id'),
        Index('idx_tag_id', 'tag_id'),
    )

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    word_id = Column(Integer, ForeignKey("words.word_id", ondelete="CASCADE"), nullable=False)
    scene_id = Column(Integer, ForeignKey("scenes.scene_id", ondelete="SET NULL"))
    tag_id = Column(Integer, ForeignKey("tags.tag_id"), default=1)
    created_at = Column(DateTime, default=utc_now)

    user = relationship("User", backref="user_words")
    word = relationship("Word", backref="user_words")
    scene = relationship("Scene", backref="user_words")
    tag = relationship("Tag", backref="user_words")


class SceneSentence(Base):
    __tablename__ = "scene_sentences"

    sentence_id = Column(Integer, primary_key=True, autoincrement=True)
    scene_id = Column(Integer, ForeignKey("scenes.scene_id", ondelete="CASCADE"), nullable=False, index=True)
    sentence_text = Column(Text, nullable=False)
    sentence_translation = Column(Text)
    audio_url = Column(String(512))
    created_at = Column(DateTime, default=utc_now)


class ReviewRecord(Base):
    __tablename__ = "review_records"
    __table_args__ = (
        Index('idx_user_next_review', 'user_id', 'next_review_time'),
        Index('idx_word_id', 'word_id'),
    )

    record_id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    word_id = Column(Integer, ForeignKey("words.word_id", ondelete="CASCADE"), nullable=False)
    level = Column(Integer, default=0)
    next_review_time = Column(DateTime, nullable=False)
    total_correct = Column(Integer, default=0)
    total_wrong = Column(Integer, default=0)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    user = relationship("User", backref="review_records")
    word = relationship("Word", backref="review_records")


class PracticeRecord(Base):
    __tablename__ = "practice_records"

    record_id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False, index=True)
    sentence_id = Column(Integer, ForeignKey("scene_sentences.sentence_id", ondelete="CASCADE"), nullable=False)
    user_audio_url = Column(String(512))
    pronunciation_score = Column(Float)
    created_at = Column(DateTime, default=utc_now)

    user = relationship("User", backref="practice_records")
    sentence = relationship("SceneSentence", backref="practice_records")


# Pydantic Schemas
class UserBase(BaseModel):
    username: str
    email: str
    nickname: Optional[str] = None


class UserCreate(UserBase):
    password: str


class UserLogin(BaseModel):
    username: str
    password: str


class UserResponse(UserBase):
    user_id: int
    avatar_url: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class DetectedObjectCreate(BaseModel):
    object_name: str
    english_word: str
    confidence: Optional[float] = None
    bounding_box: Optional[dict] = None


class DetectedObjectResponse(BaseModel):
    object_id: int
    scene_id: int
    object_name: str
    english_word: str
    confidence: Optional[float] = None
    bounding_box: Optional[dict] = None

    class Config:
        from_attributes = True


class SceneCreate(BaseModel):
    image_url: str
    description: Optional[str] = None


class SceneResponse(BaseModel):
    scene_id: int
    user_id: int
    image_url: str
    description: Optional[str] = None
    created_at: datetime
    detected_objects: list[DetectedObjectResponse] = []

    class Config:
        from_attributes = True


class WordCreate(BaseModel):
    english_word: str
    chinese_meaning: Optional[str] = None
    phonetic_us: Optional[str] = None
    phonetic_uk: Optional[str] = None
    example_sentence: Optional[str] = None
    example_translation: Optional[str] = None


class WordResponse(BaseModel):
    word_id: int
    english_word: str
    chinese_meaning: Optional[str] = None
    phonetic_us: Optional[str] = None
    phonetic_uk: Optional[str] = None
    audio_url: Optional[str] = None
    example_sentence: Optional[str] = None
    example_translation: Optional[str] = None
    image_url: Optional[str] = None

    class Config:
        from_attributes = True


class UserWordCreate(BaseModel):
    word_id: int
    scene_id: Optional[int] = None
    tag_id: Optional[int] = 1


class UserWordResponse(BaseModel):
    id: int
    user_id: int
    word_id: int
    scene_id: Optional[int] = None
    tag_id: int
    created_at: datetime
    word: Optional[WordResponse] = None
    tag: Optional[dict] = None

    class Config:
        from_attributes = True


class SceneSentenceCreate(BaseModel):
    scene_id: int
    sentence_text: str
    sentence_translation: Optional[str] = None


class SceneSentenceResponse(BaseModel):
    sentence_id: int
    scene_id: int
    sentence_text: str
    sentence_translation: Optional[str] = None
    audio_url: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class ReviewRecordResponse(BaseModel):
    record_id: int
    user_id: int
    word_id: int
    level: int
    next_review_time: datetime
    total_correct: int
    total_wrong: int
    word: Optional[WordResponse] = None

    class Config:
        from_attributes = True


class PracticeRecordCreate(BaseModel):
    sentence_id: int
    user_audio_url: str


class PracticeRecordResponse(BaseModel):
    record_id: int
    user_id: int
    sentence_id: int
    user_audio_url: Optional[str] = None
    pronunciation_score: Optional[float] = None
    created_at: datetime

    class Config:
        from_attributes = True
