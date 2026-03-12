# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

单文件 HTML5 Canvas 游戏（坦克大战），约 2500 行代码，包含完整的游戏逻辑、音频系统、语音系统和剧情对话系统。

**版本控制**：此项目当前不是 git 仓库，git 命令不可用。

**自动记忆**：`MEMORY.md` 文件包含详细的技术实现信息（系统集成、补丁位置、API 使用），与本文档互补。

## 开发命令

**运行游戏**：直接在浏览器中打开 `tank-battle.html`

**测试**：无自动化测试框架，通过浏览器手动测试游戏功能。使用浏览器控制台调试（见下方调试技巧）。

**无构建系统**：这是一个纯前端单文件项目，不需要构建、编译或依赖安装。

## 核心架构

### 文件结构

```
tank-battle.html    # 主游戏文件（~2500 行）
img/               # 背景图片资源（bg1.jpg - bg6.jpg）
```

### 代码组织（按出现顺序）

游戏代码使用清晰的分隔符（`// ═══...═══`）组织成以下模块：

1. **CANVAS & SCALE** - Canvas 初始化（1200×720）和响应式缩放
2. **CONSTANTS** - 游戏常量（TILE=48, PI2 等）
3. **UTILITIES** - 工具函数（rnd, clamp, dist, lerp 等）
4. **INPUT** - 键盘输入管理
5. **CAMERA** - 相机跟随系统
6. **PARTICLES** - 粒子效果系统
7. **WEAPON DEFINITIONS** - 6 种武器配置（pistol, shotgun, machinegun, cannon, laser, minigun）
8. **MAP PARSER** - 地图字符串解析器
9. **LEVEL DATA** - 5 个关卡配置（森林、沙漠、雪地、城市、基地）
10. **STORY DATA** - 每关的剧情对话数据（opening, bossIntro, bossDefeated）
11. **MAP CLASS** - GameMap 类（碰撞检测、渲染）
12. **POWER-UP** - 道具类（武器升级、生命值）
13. **BULLET** - 子弹类
14. **LASER BEAM** - 激光束类
15. **TANK COLORS** - 坦克颜色配置（TC 对象）
16. **BASE ENTITY** - TankEntity 基类（移动、碰撞、射击、受伤）
17. **PLAYER** - Player 类（继承 TankEntity）
18. **ENEMY** - Enemy 类（AI 行为）
19. **BOSS** - Boss 类（5 种 Boss 行为模式）
20. **HUD** - HUD 渲染函数
21. **GAME** - Game 主对象（状态机：menu | playing | levelComplete | gameOver | pause）
22. **AUDIO SYSTEM** - AudioSys（Web Audio API 合成音效）
23. **VOICE SYSTEM** - VoiceSys（Web Speech API TTS，角色语音）
24. **DIALOGUE SYSTEM** - DialogueSys（用户控制的对话系统，Space/Click 推进）
25. **AUDIO + STORY PATCHES** - IIFE 中的 monkey-patching（集成音频和剧情触发）
26. **KEYBOARD SHORTCUTS** - 全局键盘事件监听
27. **START** - Game.init() 启动

### 实体继承层次

```
TankEntity (基类)
├── Player    # 玩家坦克
├── Enemy     # 普通敌人（basic, fast, heavy, elite）
└── Boss      # Boss 敌人（boss1-boss5，每关一个）
```

### 游戏状态机

Game 对象管理以下状态：

- `menu` - 主菜单
- `playing` - 游戏进行中
- `levelComplete` - 关卡完成
- `gameOver` - 游戏结束
- `pause` - 暂停

### 关键系统

**AudioSys（音频系统）**

- 使用 Web Audio API 合成所有音效
- 武器音效：`forWeapon(weaponType)` 根据武器类型播放对应音效
- 事件音效：`hitMetal()`, `hitExplosion()`, `pickup()`, `tankDeath()`, `bossRoar()`, `victory()`
- 背景音轨：`startTrack()`, `setTrack(volume)`, `stopTrack()` - 循环播放的低频隆隆声
- 延迟初始化：首次用户手势时调用 `boot()`

**VoiceSys（语音系统）**

- 使用 Web Speech API 实现角色配音
- 角色配置：narrator（旁白）, hero（英雄）, princess（公主）, villain（反派）, boss（Boss）
- 公主语音特殊处理：优先选择女性声音（通过名称关键词匹配）
- `speak(text, role)` - 播放语音，设置 `speaking=true`
- `stop()` - 停止当前语音
- `speaking` 标志用于 DialogueSys 的波形动画

**DialogueSys（对话系统）**

- 用户控制，不自动推进（与早期版本不同）
- `update(dt)` 是空操作，只有 `advance()` 或 `stop()` 能推进对话
- Space 键或点击画布推进对话
- 音频波形条：22 个动画条，语音播放时显示波形，静止时显示平线
- 继续提示：语音播放时显示 "SPACE / Click ✕ skip voice"，完成后显示 "▶ continue"
- 说话者名称在 TTS 激活时显示 ♪ 后缀

**STORY_DATA 结构**

- 5 个条目（索引 0-4），对应 5 个关卡
- 每个条目包含：`opening`（开场）, `bossIntro`（Boss 登场）, `bossDefeated`（Boss 战败）
- 剧情：罗兰王子从 5 个 Boss 手中营救艾拉拉公主
- Boss 名称映射：Steel Sergeant, Desert Viper, Frost Commander, Urban Tyrant, General Vex

## 关键开发模式

### Monkey-Patching 模式

音频和剧情系统通过 monkey-patching 集成到现有代码中（第 2398-2497 行的 IIFE）：

**重要规则**：

- Patches 必须在 `_origDraw`/`_origUpdate` 包装器之前运行
- 包装器会捕获已打补丁的版本
- 补丁顺序很重要

**补丁位置**：

- `Player.prototype._fire` → 调用 `AudioSys.forWeapon(weaponType)`
- `Player.prototype._fireLaser` → 激光音效节流（220ms 冷却，`this._lsCD`）
- `TankEntity.prototype.takeDmg` → `AudioSys.hitMetal()`（每个实体 140ms 冷却）
- `TankEntity.prototype.onDeath` → `AudioSys.tankDeath()`
- `Bullet.prototype.die` → 爆炸子弹调用 `AudioSys.hitExplosion()`
- `Player.prototype.collect` → `AudioSys.pickup()`
- `Game.init` → 启动音频/语音，添加 canvas 点击监听器
- `Game.loadLevel` → 重置 `this._sf` 标志，通过 setTimeout 触发开场对话
- `Game.update` → 调用 `DialogueSys.update(dt)`，触发 Boss 登场（距离<500）和战败对话，更新音轨音量
- `Game.draw` → 在游戏世界渲染后调用 `DialogueSys.draw()`
- Keydown handler → Space/Enter 优先推进对话（第 2084 行附近）

### 剧情触发标志

`Game._sf` 对象跟踪每关的剧情状态：

```javascript
{
  openingDone: false,      // 开场对话已播放
  bossIntroDone: false,    // Boss 登场对话已播放
  bossDefeatedDone: false  // Boss 战败对话已播放
}
```

在 `Game.loadLevel` 中初始化，通过 `STORY_DATA[this.levelIdx]` 驱动所有剧情触发。

### 武器系统

6 种武器类型，每种有不同的伤害、射速、子弹速度和特殊效果：

- **pistol** - 基础武器
- **shotgun** - 散弹，一次发射多颗子弹
- **machinegun** - 高射速
- **cannon** - 高伤害，爆炸效果
- **laser** - 持续伤害光束
- **minigun** - 极高射速

### Boss 行为模式

每个 Boss 有独特的 AI 模式（在 `Boss.prototype.update` 中）：

- **boss1** (Steel Sergeant) - 基础追击
- **boss2** (Desert Viper) - 快速机动
- **boss3** (Frost Commander) - 重型坦克
- **boss4** (Urban Tyrant) - 复杂战术
- **boss5** (General Vex) - 最终 Boss，最强 AI

## 修改代码时的注意事项

1. **保持单文件结构** - 不要拆分成多个文件
2. **使用分隔符** - 新增大模块时使用 `// ═══...═══` 分隔符
3. **Monkey-patching 顺序** - 如果修改补丁，确保在包装器之前运行
4. **音频节流** - 高频音效（如激光）需要冷却时间防止音频爆炸
5. **剧情标志管理** - 修改剧情触发时，确保正确设置 `Game._sf` 标志
6. **Canvas 坐标** - 固定 1200×720，通过 `uiScale` 响应式缩放
7. **中文注释** - 代码注释和文档使用中文
8. **Web API 兼容性** - AudioSys 和 VoiceSys 依赖现代浏览器 API

## 调试技巧

**代码导航**：使用 Grep 搜索分隔符 `^// ═+$` 快速定位主要模块，避免读取整个 2500 行文件。

- 在浏览器控制台中访问全局对象：`Game`, `AudioSys`, `VoiceSys`, `DialogueSys`
- 检查游戏状态：`Game.state`
- 查看当前关卡：`Game.levelIdx`
- 测试音效：`AudioSys.forWeapon('cannon')`
- 测试语音：`VoiceSys.speak('测试文本', 'hero')`
- 跳过对话：`DialogueSys.stop()`
