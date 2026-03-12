# 坦克大战重构与扩展设计文档

**日期**：2026-03-11
**版本**：1.0
**状态**：已批准

## 项目概述

将现有的单文件 HTML5 坦克大战游戏（~2500 行）重构为生产级别的多文件 TypeScript 项目，并扩展以下功能：

- 17 种创新道具系统
- 5 个新关卡（总共 10 个关卡）
- 三幕剧情结构，角色声音有辨识度
- 现代化 UI 设计（参考 Diep.io / Tanki Online）
- 子弹生命周期管理系统

## 技术栈

- **核心**：TypeScript 5.x + Vite 5.x
- **渲染**：Canvas 2D API
- **音频**：Web Audio API（合成音效）
- **语音**：Web Speech API（TTS）
- **构建**：Vite（开发服务器 + 生产构建）
- **代码规范**：ESLint + Prettier（Tab 缩进）

## 架构设计

### 模块化 MVC 架构

```
src/
├── main.ts                 # 入口文件
├── config/                 # 配置文件
│   └── constants.ts
├── core/                   # 核心引擎
│   ├── Game.ts
│   ├── Renderer.ts
│   ├── Physics.ts
│   ├── Input.ts
│   └── Camera.ts
├── entities/               # 游戏实体
│   ├── base/
│   │   └── TankEntity.ts
│   ├── Player.ts
│   ├── Enemy.ts
│   ├── Boss.ts
│   ├── Bullet.ts
│   ├── LaserBeam.ts
│   └── PowerUp.ts
├── systems/                # 游戏系统
│   ├── AudioSystem.ts
│   ├── VoiceSystem.ts
│   ├── DialogueSystem.ts
│   ├── PowerUpSystem.ts
│   ├── ParticleSystem.ts
│   └── MapSystem.ts
├── levels/                 # 关卡管理
│   ├── LevelManager.ts
│   └── data/
│       ├── level01-forest.ts
│       ├── level02-desert.ts
│       └── ... (10 个关卡)
├── story/                  # 剧情系统
│   ├── StoryManager.ts
│   ├── Character.ts
│   └── dialogues/
│       ├── act1.ts
│       ├── act2.ts
│       └── act3.ts
├── ui/                     # UI 组件
│   ├── HUD.ts
│   ├── Menu.ts
│   ├── LevelComplete.ts
│   ├── GameOver.ts
│   └── PauseMenu.ts
├── data/                   # 游戏数据配置
│   ├── weapons.ts
│   ├── powerups.ts
│   ├── enemies.ts
│   └── colors.ts
├── utils/                  # 工具函数
│   ├── math.ts
│   ├── collision.ts
│   └── pathfinding.ts
└── types/                  # TypeScript 类型定义
    └── index.ts
```

### 核心架构流程

```
Game (主循环)
  ├─> Input (处理输入)
  ├─> Physics (更新物理)
  ├─> Systems (更新各系统)
  │     ├─> PowerUpSystem (道具生成和效果)
  │     ├─> ParticleSystem (粒子效果)
  │     ├─> DialogueSystem (对话推进)
  │     └─> AudioSystem (音频播放)
  ├─> Entities (更新实体)
  │     ├─> Player
  │     ├─> Enemies
  │     ├─> Bullets
  │     └─> PowerUps
  └─> Renderer (渲染)
        ├─> Camera (相机变换)
        ├─> Map (地图渲染)
        ├─> Entities (实体渲染)
        ├─> Particles (粒子渲染)
        ├─> DialogueSystem (对话框渲染)
        └─> HUD (UI 渲染)
```

### 状态管理

```typescript
enum GameState {
	MENU = 'menu',
	PLAYING = 'playing',
	DIALOGUE = 'dialogue', // 新增：对话中（暂停游戏）
	LEVEL_COMPLETE = 'levelComplete',
	GAME_OVER = 'gameOver',
	PAUSE = 'pause'
}
```

## 道具系统设计

### 17 种道具类型

**攻击性道具（7种）：**

1. **反弹护盾**（Reflect Shield）- 8 秒，反弹所有敌方子弹
2. **时间减速**（Time Warp）- 10 秒，敌方子弹和坦克速度减半
3. **电磁脉冲**（EMP）- 范围爆炸，3 秒内禁用范围内敌人武器
4. **追踪导弹**（Homing Missile）- 发射 3 枚自动追踪导弹
5. **穿透子弹**（Piercing Rounds）- 15 秒，子弹穿透墙壁和敌人
6. **分裂弹药**（Split Shot）- 12 秒，每发子弹分裂成 3 发
7. **毒雾弹**（Toxic Cloud）- 释放持续 8 秒的毒雾，敌人进入持续掉血

**地图互动道具（5种）：**

1. **墙壁反弹**（Wall Bounce）- 15 秒，所有墙壁变成反弹墙
2. **重力井**（Gravity Well）- 创建黑洞，吸引附近所有子弹和坦克
3. **传送门**（Portal）- 放置入口和出口，可瞬移穿越
4. **冰冻地面**（Ice Floor）- 大范围地面变滑，坦克难以控制
5. **隐形墙**（Phantom Wall）- 创建 3 个临时墙壁（10 秒）

**防御/辅助道具（5种）：**

1. **隐身**（Stealth）- 8 秒完全隐形
2. **护盾**（Shield）- 吸收 3 次伤害
3. **急速冲刺**（Dash）- 3 次瞬间位移能力
4. **修复包**（Repair Kit）- 恢复 50% 生命值
5. **无敌**（Invincibility）- 5 秒完全无敌（金色闪光）

### 道具生成机制

- 击败敌人：30% 概率掉落
- 击败 Boss：100% 掉落稀有道具
- 地图最多同时存在 5 个道具
- 道具存在 20 秒后消失
- 稀有度（1-5）影响掉落概率

## 子弹系统设计

### 生命周期管理

**动能子弹：**

- 生命周期：10 秒后自动消失
- 反弹限制：最多反弹 5 次后消失
- 地图限制：超过 200 颗时强制清理最早的子弹

**激光束：**

- 不受生命周期限制
- 持续时间由武器配置决定
- 不计入地图子弹数量限制

## 关卡系统设计

### 10 个关卡配置

| 关卡 | 主题            | 环境特色 | Boss 名称        | 难度  |
| ---- | --------------- | -------- | ---------------- | ----- |
| 1    | 森林（Forest）  | 绿色植被 | Steel Sergeant   | ★☆☆☆☆ |
| 2    | 沙漠（Desert）  | 黄色沙丘 | Desert Viper     | ★★☆☆☆ |
| 3    | 雪地（Snow）    | 白色冰雪 | Frost Commander  | ★★☆☆☆ |
| 4    | 城市（City）    | 灰色建筑 | Urban Tyrant     | ★★★☆☆ |
| 5    | 基地（Base）    | 军事基地 | General Vex      | ★★★☆☆ |
| 6    | 火山（Volcano） | 熔岩地形 | Inferno Warlord  | ★★★☆☆ |
| 7    | 海洋（Ocean）   | 水下基地 | Tidal Destroyer  | ★★★★☆ |
| 8    | 太空（Space）   | 失重效果 | Cosmic Tyrant    | ★★★★☆ |
| 9    | 丛林（Jungle）  | 密集植被 | Jungle Predator  | ★★★★★ |
| 10   | 废墟（Ruins）   | 末日废土 | Supreme Overlord | ★★★★★ |

### 地图连通性验证

- 使用 Flood Fill 算法验证玩家起点到所有敌人位置可达
- 确保 Boss 房间可达
- 验证道具生成点可达
- 连通性检查失败时控制台警告，允许继续

## 剧情系统设计

### 三幕剧结构

**第一幕（关卡 1-3）：觉醒**

- 主角：罗兰中尉（Lieutenant Roland）
- 任务：调查神秘信号
- 发现：艾拉拉公主被绑架
- Boss：Steel Sergeant, Desert Viper, Frost Commander

**第二幕（关卡 4-6）：追击**

- 深入敌后
- 揭露阴谋：General Vex 企图控制世界
- 新盟友：反抗军领袖 Zara
- Boss：Urban Tyrant, Inferno Warlord, Tidal Destroyer

**第三幕（关卡 7-10）：决战**

- 太空要塞突袭
- 丛林基地渗透
- 最终决战：废墟中的终极对决
- Boss：Cosmic Tyrant, Jungle Predator, Supreme Overlord
- 结局：拯救公主，击败 General Vex

### 角色声音配置

| 角色     | 名称        | Pitch | Rate | 音色特征           |
| -------- | ----------- | ----- | ---- | ------------------ |
| narrator | 旁白        | 0.92  | 0.78 | 中性声音           |
| roland   | 罗兰中尉    | 1.14  | 1.04 | 低沉男声           |
| elara    | 艾拉拉公主  | 1.72  | 1.06 | 柔和女声           |
| vex      | General Vex | 0.36  | 0.68 | 反派声音（极低沉） |
| zara     | Zara        | 1.45  | 0.95 | 坚定女声           |
| boss     | Boss        | 0.40  | 0.82 | 攻击性声音         |

**语音选择策略：**

- 公主优先选择女性声音（通过名称关键词匹配）
- 反派使用极低 pitch 增强威胁感
- 每个角色有独特的 pitch/rate 组合，确保辨识度

## UI 设计

### 现代化风格（参考 Diep.io / Tanki Online）

**主菜单：**

- 大标题动画效果
- 渐变背景（深色主题）
- 发光按钮（hover 效果）
- 关卡选择界面（卡片式布局）

**游戏内 HUD：**

- 左上角：生命值条（红色渐变）
- 右上角：当前武器图标 + 弹药
- 底部中央：道具栏（最多 3 个激活道具）
- 小地图（右下角）

**对话框：**

- 半透明黑色背景
- 角色头像（左侧圆形）
- 打字机效果文字
- 音频波形动画（语音播放时）
- 继续提示：语音播放时显示 "SPACE / Click ✕ skip voice"，完成后显示 "▶ continue"

## 资源需求

### 背景图片（2K 分辨率）

| 文件名           | 主题     | 分辨率    | 来源建议                   |
| ---------------- | -------- | --------- | -------------------------- |
| bg06-volcano.jpg | 火山熔岩 | 2560×1440 | Unsplash: volcano lava     |
| bg07-ocean.jpg   | 水下基地 | 2560×1440 | Unsplash: underwater ocean |
| bg08-space.jpg   | 太空站   | 2560×1440 | Unsplash: space station    |
| bg09-jungle.jpg  | 密集丛林 | 2560×1440 | Unsplash: dense jungle     |
| bg10-ruins.jpg   | 末日废墟 | 2560×1440 | Unsplash: apocalypse ruins |

## 错误处理策略

### 关键错误处理点

1. **资源加载失败**：
   - 背景图片加载失败 → 使用纯色背景降级
   - 音频初始化失败 → 静音模式继续游戏

2. **Web Speech API 不可用**：
   - 检测浏览器支持 → 降级为纯文字对话
   - 语音合成失败 → 跳过语音，显示文字

3. **地图验证失败**：
   - 连通性检查失败 → 控制台警告，允许继续
   - 关卡数据错误 → 加载默认关卡

4. **性能问题**：
   - 子弹数量过多（>200）→ 强制清理最早的子弹
   - 粒子数量过多（>500）→ 停止生成新粒子
   - 帧率过低（<30fps）→ 降低粒子质量

## 性能优化

- **对象池**：子弹、粒子使用对象池复用
- **空间分区**：使用四叉树优化碰撞检测
- **Canvas 优化**：离屏 Canvas 缓存静态元素
- **音频节流**：高频音效（激光）使用冷却时间（220ms）

## 开发优先级

1. 项目脚手架搭建（Vite + TypeScript）
2. 核心引擎迁移（Game, Renderer, Physics, Input）
3. 实体系统重构（Player, Enemy, Boss, Bullet）
4. 道具系统实现（17 种道具）
5. 新关卡设计（5 个新主题 + 地图连通性验证）
6. 剧情系统扩展（三幕剧情 + 角色声音）
7. UI 现代化改造
8. 背景图片集成（2K 分辨率）
9. 性能优化和测试

## 技术约束

- Canvas 固定分辨率：1200×720
- 通过 `uiScale` 实现响应式缩放
- 代码规范：Tab 缩进，中文注释
- 浏览器兼容性：现代浏览器（Chrome, Firefox, Edge）
- 不使用外部依赖库（纯 TypeScript + Canvas）

## 成功标准

- ✅ 项目结构清晰，模块化良好
- ✅ 17 种道具全部实现且平衡
- ✅ 10 个关卡全部可玩，地图连通性验证通过
- ✅ 剧情完整，角色声音有辨识度
- ✅ UI 现代化，视觉体验优秀
- ✅ 性能稳定，60fps 流畅运行
- ✅ 错误处理完善，降级策略有效
- ✅ 代码符合全局 CLAUDE.md 规范
