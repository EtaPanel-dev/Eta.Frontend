# EtaPanel 测试文档

## 环境要求

- **Bun**: 项目使用 Bun 作为包管理器和运行时
- **Vitest**: 测试框架
- **Happy DOM**: 测试环境

## 快速开始

```bash
# 安装依赖
bun install

# 运行测试
bun run test
```

## 测试结构

```
tests/
├── setup.ts                    # 测试环境设置
├── utils/
│   └── test-helpers.ts         # 测试辅助函数
├── composables/
│   ├── useApi.test.ts          # API服务测试
│   └── useNotification.test.ts # 通知系统测试
├── stores/
│   ├── auth.test.ts            # 认证Store测试
│   └── system.test.ts          # 系统Store测试
└── integration/
    └── login-flow.test.ts      # 登录流程集成测试
```

## 运行测试

### 基本命令

```bash
# 运行所有测试
bun run test

# 运行测试并生成覆盖率报告
bun run test:coverage

# 运行测试UI界面
bun run test:ui

# 运行测试一次（CI模式）
bun run test:run
```

### 开发模式

```bash
# 监听模式运行测试
bun run test

# 运行特定测试文件
bunx vitest tests/composables/useApi.test.ts

# 运行匹配模式的测试
bunx vitest --grep "login"
```

## 测试覆盖率

项目设置了以下覆盖率阈值：

- 分支覆盖率: 80%
- 函数覆盖率: 80%
- 行覆盖率: 80%
- 语句覆盖率: 80%

覆盖率报告会生成在 `coverage/` 目录中。

## 测试重点

### 1. 登录错误处理

- ✅ 401 错误返回具体错误信息
- ✅ 不同 HTTP 状态码的处理
- ✅ 网络错误处理
- ✅ 错误标记机制

### 2. 认证流程

- ✅ 成功登录流程
- ✅ Token 存储和验证
- ✅ Token 过期处理
- ✅ 登出功能

### 3. API 请求

- ✅ 认证头添加
- ✅ 错误响应处理
- ✅ 响应数据解析

### 4. 通知系统

- ✅ 不同类型通知
- ✅ 服务端渲染兼容性
- ✅ Toast 配置正确性

### 5. 系统监控

- ✅ 数据获取和更新
- ✅ 错误处理
- ✅ 自动刷新机制

## Mock 策略

测试中使用了以下 Mock：

- `$fetch`: HTTP 请求
- `useCookie`: Cookie 操作
- `navigateTo`: 路由跳转
- `useToast`: Toast 通知
- `useRuntimeConfig`: 运行时配置

## 最佳实践

1. **隔离测试**: 每个测试都应该独立运行
2. **清理 Mock**: 在`beforeEach`中清理所有 Mock
3. **具体断言**: 使用具体的期望值而不是通用匹配
4. **错误测试**: 测试错误情况和边界条件
5. **集成测试**: 测试完整的用户流程

## 调试测试

```bash
# 调试特定测试
bunx vitest --inspect-brk tests/composables/useApi.test.ts

# 查看详细输出
bunx vitest --reporter=verbose

# 运行失败的测试
bunx vitest --run --reporter=verbose --bail=1
```
