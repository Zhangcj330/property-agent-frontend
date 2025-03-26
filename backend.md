聊天相关 API：
目前聊天功能使用的是模拟数据和本地响应
需要实现的 API：
/api/chat - 处理用户消息并返回 AI 响应
/api/chat/property-recommendation - 基于用户输入推荐房产
房产相关 API：
目前使用的是 mockProperties 数据
需要实现的 API：
/api/properties - 获取房产列表
/api/properties/{id} - 获取单个房产详情
/api/properties/search - 搜索房产
/api/properties/recommendations - 获取推荐房产
用户相关 API：
目前用户配置文件使用的是默认值
需要实现的 API：
/api/user/profile - 获取和更新用户资料
/api/user/preferences - 获取和更新用户偏好设置
收藏相关 API：
目前收藏功能使用的是模拟数据
需要实现的 API：
/api/saved-properties - 获取收藏的房产列表
/api/saved-properties/{id} - 添加/删除收藏的房产
/api/property-feedback - 处理用户对房产的反馈
技术实现建议：
已经安装了 axios 包（版本 1.8.4），可以用来处理 API 请求
建议创建一个统一的 API 客户端配置，例如在 src/lib/api-client.ts 中
可以使用 Next.js 的 API 路由功能来实现后端 API
建议添加请求拦截器处理认证和错误
考虑添加请求缓存和状态管理（如 React Query）
需要创建的文件结构：
