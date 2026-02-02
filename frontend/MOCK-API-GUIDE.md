# 🎉 Mock API 已启用！

## 问题已解决

之前注册失败的原因是：**后端 API 无法访问**（`Failed to fetch`）。

我已经创建了一个 **Mock API 系统**，现在你可以在**没有真实后端**的情况下完整测试应用功能！

---

## ✅ 现在可以测试的功能

### 1️⃣ **注册流程**
1. 打开浏览器访问：`http://localhost:5173/register`
2. 输入邮箱（任意格式，如：`test@example.com`）
3. 点击"发送验证码"
4. **开发模式**：输入任意 6 位数字（如：`123456`）
5. 设置密码（至少 6 位）
6. 勾选"同意用户协议"
7. 点击"注册"
8. ✅ 注册成功！自动跳转到引导页面

### 2️⃣ **登录流程**
1. 访问：`http://localhost:5173/login`
2. 输入注册时的邮箱和密码
3. 点击"登录"
4. ✅ 登录成功！

### 3️⃣ **引导流程**
1. 注册/首次登录后自动进入
2. 滑动查看功能介绍（3页）
3. 选择英语水平和每日目标
4. 点击"开始使用"
5. ✅ 进入主应用！

### 4️⃣ **忘记密码**
1. 访问：`http://localhost:5173/forgot-password`
2. 输入注册邮箱
3. 输入任意 6 位验证码
4. 设置新密码
5. ✅ 密码重置成功！

---

## 🔧 Mock API 特性

### ✅ 已实现的功能
- ✅ 用户注册（数据保存在 localStorage）
- ✅ 用户登录
- ✅ 发送验证码（控制台显示提示）
- ✅ 重置密码
- ✅ 用户偏好设置（引导页）
- ✅ Token 管理（自动刷新）
- ✅ 登出功能

### 📦 数据存储
所有用户数据存储在浏览器的 **localStorage** 中：
- Key: `photoenglish_mock_users`
- 可以在浏览器开发者工具 → Application → Local Storage 中查看

### 🎯 开发模式特点
1. **任意 6 位数字验证码**均可通过
2. 模拟网络延迟（300-800ms）
3. 完整的错误处理
4. 控制台输出验证码提示

---

## 🧪 测试步骤

### 启动开发服务器
```bash
npm run dev
```

### 完整测试流程

#### 1. 注册新用户
```
URL: http://localhost:5173/register

输入：
- 邮箱：test@example.com
- 验证码：123456（任意6位）
- 密码：password123
- 确认密码：password123
- ✅ 同意用户协议

点击"注册" → ✅ 成功 → 跳转到引导页
```

#### 2. 完成引导
```
引导页 → 滑动查看介绍（3页）

第4页：
- 选择英语水平：Intermediate
- 选择每日目标：20 words
- 点击"开始使用" → ✅ 进入主应用
```

#### 3. 测试导航
```
主应用中测试底部导航：
- 📸 拍照识别 → 占位页面
- 📚 生词库 → 占位页面
- ✍️ 练习 → 占位页面
- 📊 统计 → 占位页面

点击用户头像 → 登出 → ✅ 返回登录页
```

#### 4. 测试登录
```
URL: http://localhost:5173/login

输入：
- 邮箱：test@example.com
- 密码：password123

点击"登录" → ✅ 成功 → 跳转到主应用
```

#### 5. 测试忘记密码
```
URL: http://localhost:5173/forgot-password

输入：
- 邮箱：test@example.com
- 验证码：123456
- 新密码：newpassword123
- 确认密码：newpassword123

点击"重置密码" → ✅ 成功 → 返回登录页
```

---

## 🔍 调试技巧

### 查看存储的用户数据
1. 打开浏览器开发者工具（F12）
2. 进入 **Application** 标签
3. 左侧找到 **Local Storage** → `http://localhost:5173`
4. 查看 Key: `photoenglish_mock_users`

### 查看验证码提示
注册/重置密码时，点击"发送验证码"后，**打开浏览器控制台**（F12 → Console），会看到：

```
📱 ===== MOCK VERIFICATION CODE =====
📱 Email/Phone: test@example.com
📱 Verification Code: ANY 6-DIGIT NUMBER
📱 Example: 123456
📱 =================================
```

### 清空测试数据
如果想重新测试，可以：
1. 在浏览器开发者工具中删除 Local Storage
2. 或者清除浏览器缓存

---

## 🚀 切换到真实后端

当后端 API 准备好时，修改 `src/lib/api.ts` 文件第 6 行：

```typescript
// 当前：使用 Mock API（开发模式）
const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === 'true' || import.meta.env.DEV;

// 改为：使用真实 API
const USE_MOCK_API = false;
```

或者设置环境变量：
```bash
# .env.development
VITE_USE_MOCK_API=false
```

---

## 📝 已知限制

### Mock API 当前限制
1. ❌ **不支持社交登录**（仅邮箱/手机号）
2. ❌ **照片识别功能**（Milestone 2 需要额外实现）
3. ❌ **生词库功能**（Milestone 3 需要额外实现）
4. ❌ **练习功能**（Milestone 4 需要额外实现）
5. ❌ **统计功能**（Milestone 5 需要额外实现）

以上功能会在后续 Milestone 中实现！

---

## 🎉 下一步

现在你可以：
1. ✅ **完整测试认证流程**
2. ✅ **测试引导流程**
3. ✅ **测试应用导航**
4. 📸 **准备实现 Milestone 2 - Photo Capture**

需要我继续实现 Milestone 2 吗？或者你想先测试一下当前的功能？
