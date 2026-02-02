# Data Model

## Entities

### User
使用应用的学习者，拥有自己的照片、生词库、练习记录和学习统计数据。

### Photo
用户拍摄的照片记录，包含原始图片、OCR 识别出的单词列表、以及 AI 基于场景生成的英语描述句子。

### Word
从照片中提取的英文生词，包含单词拼写、中文释义、音标、例句等词典信息。

### Tag
用户创建的标签，用于对生词进行分类管理（如"工作词汇"、"考试必备"）。

### Practice
用户的练习记录，包括单词练习（填空/翻译）和场景句子练习，记录题目、用户答案和正确性。

### Review
基于间隔重复算法的复习记录，跟踪每个单词的默写结果和下次复习时间。

### Progress
学习统计数据，包括生词总数、练习正确率、复习次数、学习天数等指标。

## Relationships

- User has many Photos
- Photo has many Words（通过 OCR 识别）
- Photo has one Scene Description（AI 生成的场景句子）
- User has many Words（保存到个人生词库）
- Word has many Tags
- User has many Practices
- User has many Reviews
- Word has many Reviews
- User has one Progress
