# PhotoEnglish 章节实现提示词模板

## 定义章节变量

**SECTION_NAME** = [人类可读名称，例如："Invoices" 或 "Project Dashboard"]
**SECTION_ID** = [sections/ 文件夹名称，例如："invoices" 或 "project-dashboard"]
**NN** = [里程碑编号，例如："02" 或 "03" - 章节从 02 开始，因为 01 是 Foundation]

---

我需要你实现 PhotoEnglish 应用的 **SECTION_NAME** 章节。

## 说明

请仔细阅读和分析以下文件：

1. **@product-plan/product-overview.md** - 产品摘要，了解整体上下文
2. **@product-plan/instructions/incremental/NN-SECTION_ID.md** - 本章节的具体说明

同时查看章节资源：
- **@product-plan/sections/SECTION_ID/README.md** - 功能概述和设计意图
- **@product-plan/sections/SECTION_ID/tests.md** - 测试编写说明（使用 TDD 方法）
- **@product-plan/sections/SECTION_ID/components/** - 需要集成的 React 组件
- **@product-plan/sections/SECTION_ID/types.ts** - TypeScript 接口
- **@product-plan/sections/SECTION_ID/sample-data.json** - 测试数据

## 开始之前，请问我：

1. **认证与授权**（如果尚未建立）
   - 用户应该如何认证？
   - 这个章节需要什么权限？

2. **数据关系**
   - 这个章节的数据如何与其他实体相关？
   - 有跨章节依赖吗？

3. **集成点**
   - 这个章节应该如何连接到现有功能？
   - 有已构建的 API 端点供此使用吗？

4. **后端业务逻辑**
   - 除了 UI 显示的，还需要什么服务器端逻辑、验证或进程吗？
   - 需要触发的后台进程、通知或其他进程吗？

5. **其他澄清**
   - 关于此章节中特定用户流程的问题
   - 需要澄清的边界情况

## 实现方法

使用测试驱动开发：
1. 阅读 `tests.md` 并首先编写失败的测试
2. 实现功能使测试通过
3. 保持测试绿色进行重构

最后，询问我是否还有其他注意事项要添加到此实现中。

回答我的问题后，开始实现。
