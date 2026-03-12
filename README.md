# 🎮 Tank Battle - 坦克大战

一个使用 TypeScript + Vite 构建的现代化 HTML5 坦克大战游戏。

## ✨ 特性

### 🎯 游戏内容
- **10 个关卡**：从森林前哨到终极决战
- **10 个独特 Boss**：每个 Boss 都有独特的 AI 行为模式
- **6 种武器**：手枪、霰弹枪、机枪、火炮、激光、加特林
- **17 种创新道具**：攻击性、防御性、地图互动道具
- **完整剧情**：三幕剧情结构，Prince Roland 营救 Princess Elara

### 🎨 技术特性
- **TypeScript** - 类型安全
- **模块化架构** - MVC 设计模式
- **固定时间步长** - 60 FPS 游戏循环
- **Quadtree 优化** - 高效碰撞检测
- **对象池模式** - 性能优化
- **Web Audio API** - 音效合成
- **Web Speech API** - 角色配音
- **响应式设计** - 自适应屏幕尺寸

## 🚀 快速开始

### 安装依赖
```bash
npm install
```

### 开发模式
```bash
npm run dev
```
访问 http://localhost:3000

### 生产构建
```bash
npm run build
```

### 预览构建
```bash
npm run preview
```

## 🎮 游戏操作

### 键盘控制
- **WASD / 方向键** - 移动坦克
- **鼠标** - 瞄准
- **Space** - 射击 / 推进对话 / 开始游戏
- **1-6** - 切换武器
- **ESC** - 暂停游戏

### 武器系统
1. **手枪** - 基础武器，平衡的伤害和射速
2. **霰弹枪** - 散弹攻击，近距离高伤害
3. **机枪** - 高射速，持续火力压制
4. **火炮** - 高伤害，爆炸范围攻击
5. **激光** - 持续伤害光束，不消失
6. **加特林** - 极高射速，弹幕攻击

### 道具系统

#### 攻击性道具
- **反射护盾** - 反弹敌人子弹
- **时间扭曲** - 减慢敌人速度
- **EMP** - 冻结所有敌人
- **追踪导弹** - 自动追踪敌人
- **穿透弹** - 子弹穿透多个敌人
- **分裂弹** - 子弹分裂成多个
- **毒云** - 持续伤害区域

#### 地图互动道具
- **墙壁反弹** - 子弹反弹
- **重力井** - 吸引敌人
- **传送门** - 瞬间移动
- **冰冻地板** - 减慢敌人
- **幻影墙** - 穿墙移动

#### 防御/支援道具
- **隐身** - 敌人无法发现
- **护盾** - 吸收伤害
- **冲刺** - 瞬间加速
- **修复包** - 完全恢复生命值
- **无敌** - 短时间无敌

## 📁 项目结构

```
src/
├── constants/          # 游戏常量
├── core/              # 核心引擎
│   ├── Camera.ts      # 相机系统
│   ├── Game.ts        # 游戏主循环
│   ├── InputManager.ts # 输入管理
│   ├── Map.ts         # 地图系统
│   ├── Physics.ts     # 物理引擎
│   └── Renderer.ts    # 渲染器
├── data/              # 游戏数据
│   ├── colors.ts      # 颜色配置
│   ├── levels.ts      # 关卡配置
│   ├── story.ts       # 剧情数据
│   └── weapons.ts     # 武器配置
├── entities/          # 游戏实体
│   ├── Boss.ts        # Boss 类
│   ├── Bullet.ts      # 子弹类
│   ├── Enemy.ts       # 敌人类
│   ├── LaserBeam.ts   # 激光束类
│   ├── Player.ts      # 玩家类
│   ├── PowerUp.ts     # 道具类
│   └── TankEntity.ts  # 坦克基类
├── systems/           # 游戏系统
│   ├── AudioSystem.ts     # 音频系统
│   ├── DialogueSystem.ts  # 对话系统
│   ├── ParticleSystem.ts  # 粒子系统
│   ├── PowerUpSystem.ts   # 道具系统
│   └── VoiceSystem.ts     # 语音系统
├── types/             # TypeScript 类型定义
├── ui/                # UI 组件
│   ├── HUD.ts         # 游戏 HUD
│   └── Menu.ts        # 菜单界面
└── main.ts            # 入口文件
```

## 🎯 关卡列表

1. **森林前哨** - Steel Sergeant
2. **沙漠要塞** - Desert Viper
3. **雪地堡垒** - Frost Commander
4. **城市废墟** - Urban Tyrant
5. **敌军基地** - General Vex
6. **火山熔岩** - Lava Guardian
7. **冰封洞窟** - Ice Warden
8. **丛林迷宫** - Jungle Predator
9. **工业区** - Steel Colossus
10. **终极决战** - Ultimate Destroyer

## 🛠️ 技术栈

- **TypeScript 5.x** - 类型安全的 JavaScript
- **Vite 7.x** - 快速的构建工具
- **Canvas 2D API** - 游戏渲染
- **Web Audio API** - 音效合成
- **Web Speech API** - 角色配音
- **ESLint + Prettier** - 代码质量保证

## 📝 开发规范

- **缩进**：使用 Tab 缩进
- **注释**：中文注释
- **命名**：camelCase（变量/函数）、PascalCase（类）
- **类型**：严格的 TypeScript 类型检查

## 📊 项目统计

- **源文件**：28 个 TypeScript 文件
- **代码规模**：229 KB
- **构建产物**：64.40 KB（gzip: 19.07 KB）
- **Git 提交**：19 次提交

## 🎨 游戏截图

（游戏运行后可以添加截图）

## 📄 许可证

MIT License

## 👥 贡献者

- Claude Sonnet 4.6 - AI 开发助手

## 🙏 致谢

感谢所有参与开发的 AI agents 和工具！
