# 地图搜索页面需求规格说明

## 项目概述
设计并实现一个类似Domain/Real Estate的房产地图搜索页面，提供直观的地图界面让用户搜索和浏览房产信息。

## 核心功能需求

### 1. 页面布局设计
- **响应式布局**：支持桌面端和移动端
- **桌面端布局**：
  - 左侧：搜索过滤器面板 (300-350px宽度)
  - 中间：交互式地图 (占据剩余空间)
  - 右侧：房产列表侧边栏 (400px宽度，可折叠)
- **移动端布局**：
  - 顶部：搜索栏和过滤器按钮
  - 主体：全屏地图
  - 底部：可滑动的房产卡片列表

### 2. 地图功能
- **地图提供商**：Google Maps (已安装 @googlemaps/js-api-loader)
- **基础功能**：
  - 缩放控制 (zoom in/out)
  - 拖拽平移
  - 地图样式切换 (标准/卫星/混合)
  - 当前位置定位
- **交互功能**：
  - 房产标记点击显示基本信息
  - 地图移动时自动更新房产列表
  - 标记聚类 (当缩放级别较小时)

### 3. 搜索与过滤功能
- **位置搜索**：
  - 地址/suburb/postcode 自动完成搜索
  - 地图边界内搜索
  - 画圈搜索功能
- **价格过滤**：
  - 最小/最大价格滑块
  - 预设价格范围快捷选择
- **房产类型**：
  - House, Unit, Townhouse, Villa, Land 等
  - 多选支持
- **房间数量**：
  - 卧室数量 (Any, 1+, 2+, 3+, 4+, 5+)
  - 浴室数量 (Any, 1+, 2+, 3+)
  - 车位数量 (Any, 1+, 2+, 3+)
- **其他过滤器**：
  - 土地面积范围
  - 上市时间 (最近7天, 30天, 90天)
  - 开放检查时间

### 4. 房产展示
- **地图标记**：
  - 价格标签显示 (紧凑型设计)
  - 不同颜色表示不同价格区间
  - 悬停显示迷你房产卡片 (150x100px)
  - 选中状态放大并高亮显示
- **房产列表卡片** (全新设计)：
  - **紧凑列表模式**：水平布局，高度80px
    - 左侧：缩略图 (80x60px)
    - 中间：地址、价格、基本信息 (床/浴/车位)
    - 右侧：收藏按钮和查看详情按钮
  - **网格模式**：垂直布局，200x240px卡片
    - 顶部：图片 (200x120px) + 价格覆盖
    - 底部：地址和基本信息
  - **地图同步**：点击卡片时地图自动定位并高亮标记
- **房产详情面板**：
  - 右侧滑出式详情面板 (400px宽)
  - 顶部：大图轮播 + 基本信息
  - 中部：详细描述、特征标签
  - 底部：联系代理、收藏、分享按钮
  - 关闭后返回地图视图

### 5. 用户体验功能
- **保存搜索**：
  - 保存当前搜索条件
  - 搜索历史记录
- **收藏房产**：
  - 集成现有的收藏功能
  - 地图上显示收藏状态
- **分享功能**：
  - 生成可分享的搜索链接
  - URL 包含搜索参数
- **性能优化**：
  - 地图标记虚拟化
  - 搜索防抖 (debounce)
  - 图片懒加载

## 技术实现规格

### 1. 组件架构
```
src/app/map-search/
├── page.tsx                 # 主页面组件
├── components/
│   ├── MapContainer.tsx     # 地图容器组件
│   ├── SearchFilters.tsx    # 搜索过滤器面板
│   ├── PropertyMarker.tsx   # 地图标记组件
│   ├── PropertyListCard.tsx # 列表模式房产卡片 (新设计)
│   ├── PropertyGridCard.tsx # 网格模式房产卡片 (新设计)
│   ├── PropertySidebar.tsx  # 房产列表侧边栏
│   ├── PropertyDetailPanel.tsx # 房产详情滑出面板 (新设计)
│   ├── MiniPropertyCard.tsx # 地图悬停迷你卡片 (新设计)
│   └── MobileMapView.tsx    # 移动端专用组件
└── hooks/
    ├── useMapSearch.tsx     # 地图搜索逻辑
    ├── usePropertyData.tsx  # 房产数据管理
    ├── useGeolocation.tsx   # 地理位置功能
    └── useMapSync.tsx       # 地图与列表同步
```

### 2. 数据结构
- **搜索参数接口**：
```typescript
interface SearchFilters {
  location?: string;
  bounds?: google.maps.LatLngBounds;
  priceMin?: number;
  priceMax?: number;
  propertyTypes?: string[];
  bedrooms?: number;
  bathrooms?: number;
  carSpaces?: number;
  landSizeMin?: number;
  landSizeMax?: number;
  listedWithin?: number; // days
}
```

- **地图状态接口**：
```typescript
interface MapState {
  center: { lat: number; lng: number };
  zoom: number;
  bounds?: google.maps.LatLngBounds;
  selectedProperty?: string;
}
```

### 3. API 集成
- **房产搜索 API**：
  - 支持地理边界查询
  - 支持多重过滤条件
  - 返回房产列表和总数
- **地理编码 API**：
  - 地址转坐标
  - 坐标转地址
- **Google Maps API**：
  - 地图显示和交互
  - 地点自动完成
  - 地理编码服务

### 4. 性能要求
- **首屏加载时间**：< 3秒
- **地图交互响应**：< 100ms
- **搜索响应时间**：< 500ms
- **移动端适配**：支持 iOS Safari 和 Android Chrome

## 新组件设计规格

### 1. PropertyListCard (列表模式卡片)
```typescript
// 紧凑水平布局，适合侧边栏快速浏览
interface PropertyListCardProps {
  property: Property;
  isSelected?: boolean;
  onSelect?: (propertyId: string) => void;
  onFavorite?: (propertyId: string) => void;
}
```
**设计特点：**
- 高度固定80px，宽度自适应
- 左侧缩略图80x60px，圆角4px
- 价格显示突出，使用粗体和主色调
- 床/浴/车位信息使用图标+数字，节省空间
- 悬停效果：轻微阴影提升和背景色变化

### 2. PropertyGridCard (网格模式卡片)
```typescript
// 垂直布局，适合宽屏展示更多信息
interface PropertyGridCardProps {
  property: Property;
  isSelected?: boolean;
  onSelect?: (propertyId: string) => void;
  onFavorite?: (propertyId: string) => void;
}
```
**设计特点：**
- 卡片尺寸200x240px
- 顶部图片120px高度，价格覆盖在右上角
- 底部信息区域120px，包含地址和基本信息
- 收藏按钮位于图片右上角
- 点击整个卡片可选中

### 3. MiniPropertyCard (地图悬停卡片)
```typescript
// 地图标记悬停时显示的迷你信息卡
interface MiniPropertyCardProps {
  property: Property;
  position: { x: number; y: number };
  onClose?: () => void;
}
```
**设计特点：**
- 尺寸150x100px，紧凑信息展示
- 白色背景，轻微阴影和边框
- 包含缩略图、价格、地址
- 带有小箭头指向地图标记
- 自动定位避免超出屏幕边界

### 4. PropertyDetailPanel (详情滑出面板)
```typescript
// 右侧滑出的详细信息面板
interface PropertyDetailPanelProps {
  property: Property;
  isOpen: boolean;
  onClose: () => void;
  onFavorite?: (propertyId: string) => void;
}
```
**设计特点：**
- 宽度400px，高度100vh
- 从右侧滑入动画效果
- 顶部图片轮播区域200px高度
- 中部滚动内容区域
- 底部固定操作按钮区域
- 包含关闭按钮和返回地图功能

### 5. PropertyMarker (地图标记)
```typescript
// 地图上的房产标记点
interface PropertyMarkerProps {
  property: Property;
  isSelected?: boolean;
  isHovered?: boolean;
  onClick?: (propertyId: string) => void;
  onHover?: (propertyId: string) => void;
}
```
**设计特点：**
- 价格标签设计，白色背景+阴影
- 根据价格区间使用不同颜色边框
- 选中状态：放大1.2倍+橙色边框
- 悬停状态：轻微放大+显示迷你卡片
- 聚类时显示数量标记

## 设计规范

### 1. 视觉设计
- **配色方案**：沿用现有的 Tailwind CSS 配色
- **地图标记**：
  - 主色调：蓝色系 (#3B82F6)
  - 选中状态：橙色 (#F59E0B)
  - 价格标签：白色背景，深色文字
- **过滤器面板**：
  - 背景：白色
  - 边框：浅灰色
  - 阴影：轻微投影

### 2. 交互设计
- **地图操作**：
  - 鼠标滚轮缩放
  - 拖拽平移
  - 双击放大
- **标记交互**：
  - 悬停显示预览
  - 点击显示详情
  - 选中状态高亮
- **过滤器交互**：
  - 实时搜索更新
  - 清除所有过滤器按钮
  - 折叠/展开分组

### 3. 移动端适配
- **触摸手势**：
  - 双指缩放
  - 单指拖拽
  - 长按显示详情
- **界面适配**：
  - 底部房产卡片可滑动
  - 过滤器抽屉式弹出
  - 搜索栏固定在顶部

## 开发优先级

### Phase 1 (MVP)
1. 基础地图显示和交互
2. 简单的位置搜索
3. 房产标记显示
4. 基础过滤器 (价格、房型、房间数)
5. 房产列表展示

### Phase 2 (增强功能)
1. 高级过滤器
2. 标记聚类
3. 保存搜索功能
4. 移动端优化

### Phase 3 (高级功能)
1. 画圈搜索
2. 搜索历史
3. 性能优化
4. 分享功能

## 测试要求
- **单元测试**：组件功能测试
- **集成测试**：地图和搜索功能测试
- **视觉回归测试**：新设计组件的UI一致性测试
- **端到端测试**：用户完整搜索流程
- **性能测试**：大量数据加载测试
- **兼容性测试**：多浏览器和设备测试

## 部署考虑
- **环境变量**：Google Maps API Key
- **CDN**：地图资源和图片优化
- **缓存策略**：搜索结果和地图瓦片缓存
- **监控**：页面性能和API调用监控
