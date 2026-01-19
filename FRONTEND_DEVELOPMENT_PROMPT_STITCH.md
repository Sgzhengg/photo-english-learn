# 前端开发提示词 - 用于 Google Stitch

> 📌 **使用说明**：将本文档的全部内容复制并发送给 Google Stitch，让它为您开发前端应用。
>
> 🔗 **Google Stitch**: https://stitch.google.com/

---

## 项目概述

**项目名称**: Photo English Learn（拍照学英语）

**项目描述**: 一个基于 AI 的英语学习应用，通过拍照识别物体来学习英语词汇。

**你的角色**: 你是一位专业的 UI/UX 设计师和前端开发工程师，擅长使用现代前端技术栈创建美观、易用的移动端优先应用。

---

## 技术栈

### 核心技术
- **React 18** + **TypeScript**
- **Vite 5** (构建工具)
- **Material-UI (MUI) v5** (UI 组件库)
- **React Router v6** (路由)
- **Axios** (HTTP 客户端)
- **React Context API** (状态管理)

### 设计原则
- **移动端优先** (Mobile First)
- **响应式设计** (Responsive Design)
- **Material Design 3** (Google 最新设计语言)
- **暗色模式支持** (可选)

---

## 后端服务信息

### 已部署的 Zeabur 服务

所有后端服务已部署在 Zeabur 云平台：

```bash
# 认证服务
Auth Service: https://photo-english-learn-auth-service.zeabur.app

# 视觉识别服务
Vision Service: https://vision-service.zeabur.app

# 词汇服务
Word Service: https://word-service.zeabur.app

# 练习服务
Practice Service: https://practice-service.zeabur.app

# 语音合成服务
TTS Service: https://tts-service.zeabur.app
```

---

## 应用功能需求

### 1. 用户认证流程

#### 登录页面 (`/login`)
- **布局**: 居中卡片式设计
- **元素**:
  - 应用 Logo/标题
  - 用户名输入框 (Material UI TextField)
  - 密码输入框 (TextField with type="password")
  - "忘记密码?" 链接
  - 登录按钮 (主按钮)
  - "还没有账号? 注册" 链接

#### 注册页面 (`/register`)
- **布局**: 居中卡片式设计
- **元素**:
  - 应用 Logo/标题
  - 用户名输入框
  - 邮箱输入框
  - 密码输入框
  - 确认密码输入框
  - 注册按钮
  - "已有账号? 登录" 链接

**交互**:
- 表单验证 (必填项、密码长度、邮箱格式)
- 加载状态 (按钮显示 spinner)
- 错误提示 (Snackbar)
- 成功后自动跳转到首页

---

### 2. 首页 (`/`)

#### 顶部导航栏 (AppBar)
- 左侧: 菜单图标 + 应用标题
- 右侧: 用户头像 + 退出登录图标

#### 主要内容区域
**建议布局**: Grid 布局，2x3 卡片网格

**功能卡片**:
1. 📷 **拍照识别** (主卡片，占据 2x1 网格)
   - 大图标 + 文字说明
   - 点击跳转到相机页面
   - 渐变背景色

2. 📖 **我的生词本**
   - 显示生词数量统计
   - 点击跳转到生词本页面

3. 📝 **练习复习**
   - 显示待复习数量
   - 点击跳转到复习页面

4. 📊 **学习统计**
   - 显示今日学习词汇数
   - 简单的进度条

5. 🔍 **单词搜索**
   - 搜索框
   - 点击跳转到搜索页面

6. ⚙️ **设置**
   - 应用设置入口

#### 底部导航栏 (Bottom Navigation) - 移动端
- 首页图标
- 相机图标 (突出显示)
- 生词本图标
- 我的图标

---

### 3. 相机页面 (`/camera`)

#### 页面布局
- **顶部**: 返回按钮 + 标题 "拍照学英语"
- **中间**: 相机取景器或图片预览区
- **底部**: 操作按钮

#### 功能元素
1. **相机取景器** (如果支持)
   - 实时相机预览
   - 对焦框指示器

2. **上传图片按钮**
   - Material UI FAB (Floating Action Button)
   - 图标: 上传/相册

3. **拍照按钮**
   - 大型圆形按钮
   - 位于底部中央

4. **图片预览** (拍照/上传后)
   - 显示选中的图片
   - "重新拍摄" 按钮
   - "开始识别" 主按钮

#### 交互流程
1. 点击拍照/上传 → 选择图片
2. 显示图片预览
3. 点击"开始识别" → 显示加载状态
4. 识别成功 → 跳转到结果页面

---

### 4. 识别结果页面 (`/result`)

#### 页面布局
- **顶部**: 返回按钮 + 标题 "识别结果"
- **内容**: 滚动列表

#### 显示内容
1. **图片预览** (顶部)
   - 原图，可点击放大

2. **场景描述** (如果有)
   - Card 组件
   - AI 生成的英文描述
   - 中文翻译

3. **检测到的物体列表**
   - 每个物体一个 Card
   - 显示内容:
     - 英文单词 (大字体)
     - 中文翻译
     - 置信度 (Progress Bar 或 Chip)
   - 点击操作:
     - 播放发音
     - 查看详细释义
     - 添加到生词本 (IconButton)

4. **底部操作栏**
   - "全部加入生词本" 按钮
   - "生成练习句子" 按钮

---

### 5. 生词本页面 (`/words`)

#### 页面布局
- **顶部**: 搜索框 + 筛选按钮
- **内容**: 单词卡片列表 (或网格)

#### 顶部栏
- 搜索框 (Search Field)
- 标签筛选下拉菜单 (Select)
  - 全部
  - 今天学习
  - 本周学习
  - 已掌握
  - 待复习

#### 单词卡片
- **布局**: 可以是 List 或 Grid
- **显示内容**:
  - 英文单词 (主要文字)
  - 音标 (次要文字)
  - 中文释义
  - 标签 (Chip)
  - 操作按钮:
    - 播放发音
    - 查看详情
    - 删除 (确认对话框)

#### 交互
- 下拉刷新
- 上拉加载更多
- 点击卡片 → 单词详情弹窗
- 长按卡片 → 多选模式

#### 空状态
- 无单词时显示提示插画
- "开始拍照学习" 按钮

---

### 6. 单词详情弹窗 (Dialog)

#### 布局
- 全屏弹窗或底部抽屉 (Bottom Sheet)

#### 内容
1. **单词** (大字体)
2. **音标** + 播放按钮
3. **中文释义** (列表)
4. **例句**
   - 英文句子
   - 中文翻译
5. **相关图片** (如果有)
6. **操作按钮**
   - 添加/移除生词本
   - 分享
   - 关闭

---

### 7. 练习页面 (`/practice`)

#### 页面布局
- **顶部**: 进度指示器 (Stepper 或 Progress)
- **内容**: 练习卡片

#### 练习卡片
1. **场景图片**
2. **英文句子** (可隐藏，点击显示)
3. **中文翻译** (可隐藏)
4. **关键词** (Chip 列表，可点击查看释义)
5. **操作按钮**
   - 播放发音
   - 标记为已掌握
   - 下一个

#### 学习模式切换
- Tab 切换:
  - 新学习
  - 复习模式
  - 错题集

---

### 8. 个人中心页面 (`/profile`)

#### 页面布局
- **顶部**: 用户信息卡片
- **内容**: 设置选项列表

#### 用户信息卡片
- 头像 (可点击更换)
- 用户名
- 邮箱
- 注册时间

#### 设置选项
- List 组件:
  - 学习统计
  - 每日学习目标设置
  - 通知设置
  - 暗色模式切换
  - 语言设置
  - 关于
  - 退出登录

---

### 9. 搜索页面 (`/search`)

#### 页面布局
- **顶部**: 搜索框
- **内容**: 搜索结果列表

#### 搜索框
- 自动聚焦
- 实时搜索建议
- 清除按钮

#### 搜索结果
- 单词卡片列表
- 高亮搜索词
- 无结果提示

---

## UI 设计规范

### 颜色方案 (Material Design 3)

#### 主色调 (Primary Colors)
```javascript
const primaryColors = {
  main: '#1976d2',      // 主色
  light: '#42a5f5',     // 浅色
  dark: '#1565c0',      // 深色
  contrastText: '#fff', // 对比文字色
}
```

#### 辅助色 (Secondary Colors)
```javascript
const secondaryColors = {
  main: '#9c27b0',      // 紫色，用于强调
  light: '#ba68c8',
  dark: '#7b1fa2',
}
```

#### 背景色 (Background Colors)
```javascript
const backgroundColors = {
  default: '#f5f5f5',    // 默认背景
  paper: '#ffffff',      // 卡片背景
}
```

#### 语义色 (Semantic Colors)
```javascript
const semanticColors = {
  success: '#4caf50',    // 成功/正确
  warning: '#ff9800',    // 警告
  error: '#f44336',      // 错误
  info: '#2196f3',       // 信息
}
```

---

### 字体规范

#### 字体家族
```css
font-family: 'Roboto', 'Helvetica', 'Arial', sans-serif;
```

#### 字号
- **H1**: 32px (页面标题)
- **H2**: 24px (章节标题)
- **H3**: 20px (卡片标题)
- **Body 1**: 16px (正文)
- **Body 2**: 14px (次要文字)
- **Caption**: 12px (说明文字)
- **Button**: 14px (按钮文字)

#### 字重
- Regular: 400
- Medium: 500
- Bold: 700

---

### 间距规范

使用 Material UI 的 spacing 单位 (8px 基准):
- **xs**: 4px
- **sm**: 8px
- **md**: 16px
- **lg**: 24px
- **xl**: 32px

**卡片间距**: 16px (md)
**页面边距**: 16px (md)
**卡片内边距**: 16px (md)

---

### 圆角规范

- **卡片**: 8px - 12px
- **按钮**: 4px - 8px
- **对话框**: 12px - 16px
- **FAB**: 16px (圆形)

---

### 阴影规范

- **卡片**: elevation 1-2
- **对话框**: elevation 8-12
- **FAB**: elevation 4-6
- **下拉菜单**: elevation 8

---

## 组件使用指南

### 页面布局组件

```jsx
// 使用 Container 限制最大宽度
<Container maxWidth="sm" sx={{ py: 2 }}>
  {/* 内容 */}
</Container>

// 使用 Box 创建间距
<Box sx={{ mb: 2 }}>
  {/* 内容 */}
</Box>

// 使用 Stack 排列元素
<Stack spacing={2} direction="row">
  {/* 内容 */}
</Stack>
```

### 卡片组件

```jsx
// 标准卡片
<Card>
  <CardContent>
    <Typography variant="h5">标题</Typography>
    <Typography variant="body2">内容</Typography>
  </CardContent>
  <CardActions>
    <Button size="small">操作</Button>
  </CardActions>
</Card>

// 可点击卡片
<CardActionArea>
  <CardContent>
    {/* 内容 */}
  </CardContent>
</CardActionArea>
```

### 按钮组件

```jsx
// 主按钮 (Contained)
<Button variant="contained" color="primary">
  主要操作
</Button>

// 次要按钮 (Outlined)
<Button variant="outlined" color="primary">
  次要操作
</Button>

// 文本按钮 (Text)
<Button variant="text" color="primary">
  文本操作
</Button>

// 浮动操作按钮 (FAB)
<FAB color="primary" aria-label="add">
  <AddIcon />
</FAB>
```

### 输入组件

```jsx
// 文本输入框
<TextField
  fullWidth
  label="用户名"
  variant="outlined"
  margin="normal"
/>

// 密码输入框
<TextField
  fullWidth
  label="密码"
  type="password"
  variant="outlined"
  margin="normal"
/>

// 搜索框
<TextField
  fullWidth
  placeholder="搜索单词..."
  InputProps={{
    startAdornment: <SearchIcon />,
  }}
/>
```

### 列表组件

```jsx
// 标准列表
<List>
  <ListItem>
    <ListItemText primary="项目1" secondary="描述" />
  </ListItem>
  <Divider />
  <ListItem>
    <ListItemText primary="项目2" secondary="描述" />
  </ListItem>
</List>
```

### 导航组件

```jsx
// 底部导航栏
<BottomNavigation value={value} onChange={(event, newValue) => setValue(newValue)}>
  <BottomNavigationAction label="首页" icon={<HomeIcon />} />
  <BottomNavigationAction label="相机" icon={<CameraIcon />} />
  <BottomNavigationAction label="生词本" icon={<BookIcon />} />
</BottomNavigation>

// 标签页 (Tabs)
<Tabs value={value} onChange={handleChange}>
  <Tab label="新学习" />
  <Tab label="复习模式" />
  <Tab label="错题集" />
</Tabs>
```

---

## 响应式设计

### 断点

```javascript
const breakpoints = {
  xs: 0,    // 手机 (< 600px)
  sm: 600,  // 平板 (≥ 600px)
  md: 900,  // 小桌面 (≥ 900px)
  lg: 1200, // 大桌面 (≥ 1200px)
  xl: 1536, // 超大屏幕 (≥ 1536px)
}
```

### 响应式布局示例

```jsx
// Grid 响应式布局
<Grid container spacing={2}>
  <Grid item xs={12} sm={6} md={4}>
    {/* 手机占满，平板占一半，桌面占1/3 */}
  </Grid>
</Grid>

// 隐藏/显示元素
<Box sx={{ display: { xs: 'none', md: 'block' } }}>
  {/* 只在平板以上显示 */}
</Box>
```

---

## 移动端优化

### 触摸目标
- 最小触摸区域: 44x44px
- 按钮/卡片间距: 至少 8px

### 手势支持
- 下拉刷新
- 侧滑删除
- 长按操作
- 双击缩放 (图片)

### 性能优化
- 图片懒加载
- 虚拟滚动 (长列表)
- 代码分割
- 防抖/节流 (搜索输入)

---

## 动画和过渡

### 页面过渡
```javascript
// 淡入淡出
const FadeIn = styled('div')({
  animation: 'fadeIn 0.3s ease-in',
  '@keyframes fadeIn': {
    '0%': { opacity: 0 },
    '100%': { opacity: 1 },
  },
})
```

### 加载动画
- 使用 MUI 的 CircularProgress
- Skeleton 占位符
- 进度条

---

## 错误处理

### 错误提示
- Snackbar: 短暂提示
- Alert: 持续提示
- Dialog: 严重错误

### 表单验证
- 实时验证
- 错误文字显示
- 提交前完整验证

---

## 状态管理

### 使用 React Context

```typescript
// AuthContext
interface AuthContextType {
  user: User | null
  token: string | null
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  loading: boolean
}

// 使用
const { user, login, logout } = useAuth()
```

---

## 路由配置

```typescript
const routes = [
  { path: '/', element: <HomePage />, protected: true },
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  { path: '/camera', element: <CameraPage />, protected: true },
  { path: '/result/:sceneId', element: <ResultPage />, protected: true },
  { path: '/words', element: <WordListPage />, protected: true },
  { path: '/practice', element: <PracticePage />, protected: true },
  { path: '/profile', element: <ProfilePage />, protected: true },
  { path: '/search', element: <SearchPage />, protected: true },
]
```

---

## API 集成示例

### 调用 API

```typescript
// 使用 Axios
import { api } from './api/client'

// 获取生词列表
const fetchWords = async () => {
  try {
    const response = await api.word.get('/list')
    setWords(response.data)
  } catch (error) {
    showError('获取生词本失败')
  }
}

// 添加生词
const addWord = async (wordId: number) => {
  try {
    await api.word.post('/add', { word_id: wordId })
    showSuccess('已添加到生词本')
  } catch (error) {
    showError('添加失败')
  }
}
```

---

## 开发步骤

### 第一阶段: 基础架构
1. 创建项目结构
2. 配置路由
3. 创建布局组件 (AppBar, BottomNav)
4. 配置 API 客户端
5. 创建认证上下文

### 第二阶段: 认证流程
1. 设计登录页面 UI
2. 设计注册页面 UI
3. 实现表单验证
4. 连接认证 API
5. 实现路由守卫

### 第三阶段: 核心功能
1. 设计首页 UI
2. 设计相机页面 UI
3. 设计识别结果页面 UI
4. 设计生词本页面 UI
5. 连接各功能 API

### 第四阶段: 练习功能
1. 设计练习页面 UI
2. 设计单词详情弹窗 UI
3. 设计搜索页面 UI
4. 实现 TTS 播放功能

### 第五阶段: 个人中心
1. 设计个人中心页面 UI
2. 设计设置选项 UI
3. 实现用户信息展示
4. 实现退出登录

### 第六阶段: 优化部署
1. 响应式优化
2. 性能优化
3. 暗色模式 (可选)
4. 部署到 Netlify

---

## 设计文件资源

### 图标
- Material Icons (https://mui.com/components/material-icons/)
- 推荐使用的图标:
  - 相机: `camera_alt`, `photo_camera`
  - 搜索: `search`
  - 添加: `add`
  - 播放: `volume_up`, `play_arrow`
  - 删除: `delete`
  - 编辑: `edit`
  - 退出: `logout`
  - 菜单: `menu`
  - 首页: `home`
  - 书籍: `menu_book`, `book`

### 插画
- 空状态插画: https://undraw.co/
- 加载动画: Material UI CircularProgress

---

## 交付要求

请按照以下优先级完成 UI 设计和开发:

### P0 (最高优先级 - 必须完成)
1. ✅ 登录/注册页面 UI
2. ✅ 首页 UI 和导航
3. ✅ 相机页面 UI
4. ✅ 识别结果页面 UI
5. ✅ 生词本页面 UI

### P1 (高优先级)
6. ✅ 单词详情弹窗 UI
7. ✅ 练习页面 UI
8. ✅ 搜索页面 UI
9. ✅ 个人中心页面 UI

### P2 (中优先级)
10. ✅ 响应式适配
11. ✅ 加载状态和错误提示
12. ✅ 表单验证

### P3 (低优先级 - 可选)
13. ✅ 暗色模式
14. ✅ 动画效果
15. ✅ 离线支持

---

## 重要提醒

### 设计原则
1. **简洁至上**: 避免过度设计，保持界面简洁
2. **一致性**: 遵循 Material Design 规范
3. **可访问性**: 确保颜色对比度、字体大小可读
4. **性能优先**: 避免不必要的动画和复杂效果

### 移动端优先
1. 所有页面必须在手机上完美显示
2. 按钮足够大，易于点击
3. 减少输入，增加选择
4. 优化加载速度

### 用户体验
1. 清晰的视觉层次
2. 即时的反馈 (按钮点击、加载状态)
3. 友好的错误提示
4. 引导新用户

---

## 开始开发

请根据以上需求，使用 Google Stitch 为 "Photo English Learn" 应用创建完整的前端 UI。

**建议工作流程**:
1. 先设计整体布局和导航
2. 逐个页面进行设计和开发
3. 确保移动端体验
4. 添加交互和动画
5. 测试和优化

**重点**: 移动端优先、Material Design 3、简洁易用

祝开发顺利！🚀

---

## 参考资料

### Material Design
- [Material Design 3](https://m3.material.io/)
- [Material UI 文档](https://mui.com/)
- [Material Design Icons](https://mui.com/components/material-icons/)

### React 生态
- [React 文档](https://react.dev/)
- [React Router](https://reactrouter.com/)
- [Axios](https://axios-http.com/)

### 设计资源
- [Undraw 插画](https://undraw.co/)
- [Material Design Color Tool](https://material.io/resources/color/)

### API 文档
- 项目后端 API 文档见: FRONTEND_DEVELOPMENT_PROMPT.md
