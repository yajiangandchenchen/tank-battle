# 坦克大战重构与扩展实现计划

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将单文件 HTML5 坦克大战游戏重构为生产级别的 TypeScript 多文件项目，并扩展 17 种道具、10 个关卡、三幕剧情和现代化 UI

**Architecture:** 模块化 MVC 架构，清晰的职责分离。核心引擎（Game, Renderer, Physics, Input）+ 实体系统（Player, Enemy, Boss, Bullet）+ 游戏系统（Audio, Voice, Dialogue, PowerUp, Particle）+ 关卡管理 + 剧情系统 + UI 组件

**Tech Stack:** TypeScript 5.x + Vite 5.x + Canvas 2D API + Web Audio API + Web Speech API

---

## Chunk 1: 项目脚手架和基础设施

### Task 1: 初始化 Vite + TypeScript 项目

**Files:**

- Create: `package.json`
- Create: `tsconfig.json`
- Create: `vite.config.ts`
- Create: `index.html`
- Create: `.gitignore`

- [ ] **Step 1: 初始化 npm 项目**

```bash
npm init -y
```

- [ ] **Step 2: 安装依赖**

```bash
npm install -D vite typescript @types/node
npm install -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
npm install -D prettier
```

- [ ] **Step 3: 创建 tsconfig.json**

```json
{
	"compilerOptions": {
		"target": "ES2020",
		"useDefineForClassFields": true,
		"module": "ESNext",
		"lib": ["ES2020", "DOM", "DOM.Iterable"],
		"skipLibCheck": true,
		"moduleResolution": "bundler",
		"allowImportingTsExtensions": true,
		"resolveJsonModule": true,
		"isolatedModules": true,
		"noEmit": true,
		"strict": true,
		"noUnusedLocals": true,
		"noUnusedParameters": true,
		"noFallthroughCasesInSwitch": true,
		"baseUrl": ".",
		"paths": {
			"@/*": ["src/*"]
		}
	},
	"include": ["src"]
}
```

- [ ] **Step 4: 创建 vite.config.ts**

```typescript
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src')
		}
	},
	server: {
		port: 3000
	}
});
```

- [ ] **Step 5: 创建 index.html**

```html
<!DOCTYPE html>
<html lang="zh-CN">
	<head>
		<meta charset="UTF-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<title>Tank Battle</title>
		<style>
			* {
				margin: 0;
				padding: 0;
				box-sizing: border-box;
			}
			body {
				overflow: hidden;
				background: #000;
				display: flex;
				justify-content: center;
				align-items: center;
				min-height: 100vh;
			}
			#gameCanvas {
				display: block;
				image-rendering: pixelated;
				image-rendering: crisp-edges;
			}
		</style>
	</head>
	<body>
		<canvas id="gameCanvas"></canvas>
		<script type="module" src="/src/main.ts"></script>
	</body>
</html>
```

- [ ] **Step 6: 创建 .gitignore**

```
node_modules/
dist/
.DS_Store
*.log
.vscode/
.idea/
```

- [ ] **Step 7: 更新 package.json scripts**

```json
{
	"scripts": {
		"dev": "vite",
		"build": "tsc && vite build",
		"preview": "vite preview"
	}
}
```

- [ ] **Step 8: 测试项目启动**

```bash
npm run dev
```

Expected: Vite 开发服务器启动在 http://localhost:3000

---

### Task 2: 创建基础目录结构和类型定义

**Files:**

- Create: `src/types/index.ts`
- Create: `src/config/constants.ts`
- Create: `src/utils/math.ts`

- [ ] **Step 1: 创建 src/types/index.ts**

```typescript
// 游戏状态枚举
export enum GameState {
	MENU = 'menu',
	PLAYING = 'playing',
	DIALOGUE = 'dialogue',
	LEVEL_COMPLETE = 'levelComplete',
	GAME_OVER = 'gameOver',
	PAUSE = 'pause'
}

// 武器类型
export enum WeaponType {
	PISTOL = 'pistol',
	SHOTGUN = 'shotgun',
	MACHINEGUN = 'machinegun',
	CANNON = 'cannon',
	LASER = 'laser',
	MINIGUN = 'minigun'
}

// 敌人类型
export enum EnemyType {
	BASIC = 'basic',
	FAST = 'fast',
	HEAVY = 'heavy',
	ELITE = 'elite'
}

// Boss 类型
export enum BossType {
	BOSS1 = 'boss1',
	BOSS2 = 'boss2',
	BOSS3 = 'boss3',
	BOSS4 = 'boss4',
	BOSS5 = 'boss5',
	BOSS6 = 'boss6',
	BOSS7 = 'boss7',
	BOSS8 = 'boss8',
	BOSS9 = 'boss9',
	BOSS10 = 'boss10'
}

// 道具类型
export enum PowerUpType {
	// 攻击性道具
	REFLECT_SHIELD = 'reflectShield',
	TIME_WARP = 'timeWarp',
	EMP = 'emp',
	HOMING_MISSILE = 'homingMissile',
	PIERCING_ROUNDS = 'piercingRounds',
	SPLIT_SHOT = 'splitShot',
	TOXIC_CLOUD = 'toxicCloud',
	// 地图互动道具
	WALL_BOUNCE = 'wallBounce',
	GRAVITY_WELL = 'gravityWell',
	PORTAL = 'portal',
	ICE_FLOOR = 'iceFloor',
	PHANTOM_WALL = 'phantomWall',
	// 防御/辅助道具
	STEALTH = 'stealth',
	SHIELD = 'shield',
	DASH = 'dash',
	REPAIR_KIT = 'repairKit',
	INVINCIBILITY = 'invincibility'
}

// 向量接口
export interface Vector2 {
	x: number;
	y: number;
}

// 武器配置接口
export interface WeaponConfig {
	type: WeaponType;
	damage: number;
	fireRate: number;
	bulletSpeed: number;
	bulletCount: number;
	spread: number;
	explosive: boolean;
}

// 道具配置接口
export interface PowerUpConfig {
	type: PowerUpType;
	name: string;
	duration: number;
	color: string;
	rarity: number;
	icon: string;
	description: string;
}

// 关卡配置接口
export interface LevelConfig {
	index: number;
	name: string;
	theme: string;
	background: string;
	mapData: string;
	bossType: BossType;
	difficulty: number;
}
```

- [ ] **Step 2: 创建 src/config/constants.ts**

```typescript
// Canvas 配置
export const CANVAS_WIDTH = 1200;
export const CANVAS_HEIGHT = 720;

// 游戏常量
export const TILE = 48;
export const PI2 = Math.PI * 2;
export const FPS = 60;
export const FRAME_TIME = 1000 / FPS;

// 子弹配置
export const BULLET_LIFETIME = 10000; // 10 秒
export const MAX_BULLET_BOUNCES = 5;
export const MAX_BULLETS = 200;

// 道具配置
export const POWERUP_DROP_CHANCE = 0.3; // 30%
export const POWERUP_LIFETIME = 20000; // 20 秒
export const MAX_POWERUPS = 5;

// 粒子配置
export const MAX_PARTICLES = 500;

// 性能阈值
export const MIN_FPS = 30;
```

- [ ] **Step 3: 创建 src/utils/math.ts**

```typescript
import type { Vector2 } from '@/types';

// 随机数生成
export function rnd(min: number, max: number): number {
	return Math.random() * (max - min) + min;
}

// 随机整数
export function rndInt(min: number, max: number): number {
	return Math.floor(rnd(min, max + 1));
}

// 限制数值范围
export function clamp(value: number, min: number, max: number): number {
	return Math.max(min, Math.min(max, value));
}

// 计算两点距离
export function dist(x1: number, y1: number, x2: number, y2: number): number {
	const dx = x2 - x1;
	const dy = y2 - y1;
	return Math.sqrt(dx * dx + dy * dy);
}

// 线性插值
export function lerp(a: number, b: number, t: number): number {
	return a + (b - a) * t;
}

// 向量归一化
export function normalize(v: Vector2): Vector2 {
	const len = Math.sqrt(v.x * v.x + v.y * v.y);
	if (len === 0) return { x: 0, y: 0 };
	return { x: v.x / len, y: v.y / len };
}

// 向量长度
export function length(v: Vector2): number {
	return Math.sqrt(v.x * v.x + v.y * v.y);
}

// 向量点积
export function dot(v1: Vector2, v2: Vector2): number {
	return v1.x * v2.x + v1.y * v2.y;
}
```

- [ ] **Step 4: 测试类型和工具函数**

创建临时测试文件 `src/main.ts`:

```typescript
import { rnd, clamp, dist } from '@/utils/math';
import { GameState, WeaponType } from '@/types';

console.log('Math utils test:');
console.log('rnd(0, 10):', rnd(0, 10));
console.log('clamp(15, 0, 10):', clamp(15, 0, 10));
console.log('dist(0, 0, 3, 4):', dist(0, 0, 3, 4));

console.log('Types test:');
console.log('GameState.MENU:', GameState.MENU);
console.log('WeaponType.PISTOL:', WeaponType.PISTOL);
```

Run: `npm run dev`
Expected: 控制台输出测试结果，无错误

---

## Chunk 2: 核心引擎实现

### Task 3: 实现 Input 输入管理器

**Files:**

- Create: `src/core/Input.ts`

- [ ] **Step 1: 创建 Input 类**

```typescript
// src/core/Input.ts

/**
 * 输入管理器
 * 处理键盘输入，跟踪按键状态
 */
export class Input {
	private keys: Map<string, boolean> = new Map();
	private keysPressed: Map<string, boolean> = new Map();

	constructor() {
		this.setupEventListeners();
	}

	/**
	 * 设置事件监听器
	 */
	private setupEventListeners(): void {
		window.addEventListener('keydown', (e) => {
			if (!this.keys.get(e.key)) {
				this.keysPressed.set(e.key, true);
			}
			this.keys.set(e.key, true);
		});

		window.addEventListener('keyup', (e) => {
			this.keys.set(e.key, false);
		});

		// 防止空格键滚动页面
		window.addEventListener('keydown', (e) => {
			if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
				e.preventDefault();
			}
		});
	}

	/**
	 * 检查按键是否按下
	 */
	isKeyDown(key: string): boolean {
		return this.keys.get(key) || false;
	}

	/**
	 * 检查按键是否刚按下（单次触发）
	 */
	isKeyPressed(key: string): boolean {
		return this.keysPressed.get(key) || false;
	}

	/**
	 * 清除按键按下状态（每帧调用）
	 */
	clearPressed(): void {
		this.keysPressed.clear();
	}
}
```

- [ ] **Step 2: 测试 Input 类**

更新 `src/main.ts`:

```typescript
import { Input } from '@/core/Input';

const input = new Input();

function gameLoop() {
	// 测试 WASD 键
	if (input.isKeyDown('w')) console.log('W is down');
	if (input.isKeyDown('a')) console.log('A is down');
	if (input.isKeyDown('s')) console.log('S is down');
	if (input.isKeyDown('d')) console.log('D is down');

	// 测试空格键（单次触发）
	if (input.isKeyPressed(' ')) console.log('Space pressed!');

	input.clearPressed();
	requestAnimationFrame(gameLoop);
}

gameLoop();
```

Run: `npm run dev`
Expected: 按下 WASD 键时控制台输出对应信息，按空格键只触发一次

---

### Task 4: 实现 Camera 相机系统

**Files:**

- Create: `src/core/Camera.ts`

- [ ] **Step 1: 创建 Camera 类**

```typescript
// src/core/Camera.ts
import { lerp } from '@/utils/math';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '@/config/constants';

/**
 * 相机系统
 * 实现平滑跟随和边界限制
 */
export class Camera {
	x: number = 0;
	y: number = 0;
	private targetX: number = 0;
	private targetY: number = 0;
	private smoothness: number = 0.1;
	private mapWidth: number = 0;
	private mapHeight: number = 0;

	/**
	 * 设置地图边界
	 */
	setMapBounds(width: number, height: number): void {
		this.mapWidth = width;
		this.mapHeight = height;
	}

	/**
	 * 设置跟随目标
	 */
	follow(x: number, y: number): void {
		this.targetX = x - CANVAS_WIDTH / 2;
		this.targetY = y - CANVAS_HEIGHT / 2;
	}

	/**
	 * 更新相机位置
	 */
	update(): void {
		// 平滑插值
		this.x = lerp(this.x, this.targetX, this.smoothness);
		this.y = lerp(this.y, this.targetY, this.smoothness);

		// 边界限制
		this.x = Math.max(0, Math.min(this.x, this.mapWidth - CANVAS_WIDTH));
		this.y = Math.max(0, Math.min(this.y, this.mapHeight - CANVAS_HEIGHT));
	}

	/**
	 * 应用相机变换到 Canvas 上下文
	 */
	apply(ctx: CanvasRenderingContext2D): void {
		ctx.translate(-this.x, -this.y);
	}

	/**
	 * 重置相机变换
	 */
	reset(ctx: CanvasRenderingContext2D): void {
		ctx.setTransform(1, 0, 0, 1, 0, 0);
	}
}
```

- [ ] **Step 2: 测试 Camera 类**

更新 `src/main.ts`:

```typescript
import { Camera } from '@/core/Camera';

const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
canvas.width = 1200;
canvas.height = 720;
const ctx = canvas.getContext('2d')!;

const camera = new Camera();
camera.setMapBounds(2400, 1440);

let playerX = 600;
let playerY = 360;

function gameLoop() {
	// 模拟玩家移动
	playerX += 2;
	if (playerX > 2400) playerX = 0;

	// 相机跟随
	camera.follow(playerX, playerY);
	camera.update();

	// 渲染
	ctx.fillStyle = '#222';
	ctx.fillRect(0, 0, 1200, 720);

	ctx.save();
	camera.apply(ctx);

	// 绘制地图边界
	ctx.strokeStyle = '#fff';
	ctx.strokeRect(0, 0, 2400, 1440);

	// 绘制玩家
	ctx.fillStyle = '#0f0';
	ctx.fillRect(playerX - 20, playerY - 20, 40, 40);

	ctx.restore();

	requestAnimationFrame(gameLoop);
}

gameLoop();
```

Run: `npm run dev`
Expected: 看到绿色方块在地图上移动，相机平滑跟随

---

### Task 5: 实现 Renderer 渲染管理器

**Files:**

- Create: `src/core/Renderer.ts`

- [ ] **Step 1: 创建 Renderer 类**

```typescript
// src/core/Renderer.ts
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '@/config/constants';
import type { Camera } from './Camera';

/**
 * 渲染管理器
 * 处理 Canvas 初始化、缩放和渲染流程
 */
export class Renderer {
	canvas: HTMLCanvasElement;
	ctx: CanvasRenderingContext2D;
	uiScale: number = 1;

	constructor(canvasId: string) {
		this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
		if (!this.canvas) {
			throw new Error(`Canvas element with id "${canvasId}" not found`);
		}

		const ctx = this.canvas.getContext('2d');
		if (!ctx) {
			throw new Error('Failed to get 2D context');
		}
		this.ctx = ctx;

		this.setupCanvas();
		this.setupResize();
	}

	/**
	 * 设置 Canvas 尺寸
	 */
	private setupCanvas(): void {
		this.canvas.width = CANVAS_WIDTH;
		this.canvas.height = CANVAS_HEIGHT;
	}

	/**
	 * 设置响应式缩放
	 */
	private setupResize(): void {
		const resize = () => {
			const scaleX = window.innerWidth / CANVAS_WIDTH;
			const scaleY = window.innerHeight / CANVAS_HEIGHT;
			this.uiScale = Math.min(scaleX, scaleY);

			this.canvas.style.width = `${CANVAS_WIDTH * this.uiScale}px`;
			this.canvas.style.height = `${CANVAS_HEIGHT * this.uiScale}px`;
		};

		window.addEventListener('resize', resize);
		resize();
	}

	/**
	 * 清空画布
	 */
	clear(color: string = '#000'): void {
		this.ctx.fillStyle = color;
		this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
	}

	/**
	 * 开始世界渲染（应用相机变换）
	 */
	beginWorld(camera: Camera): void {
		this.ctx.save();
		camera.apply(this.ctx);
	}

	/**
	 * 结束世界渲染（重置变换）
	 */
	endWorld(): void {
		this.ctx.restore();
	}

	/**
	 * 绘制文本（居中）
	 */
	drawText(text: string, x: number, y: number, size: number, color: string): void {
		this.ctx.font = `${size}px Arial`;
		this.ctx.fillStyle = color;
		this.ctx.textAlign = 'center';
		this.ctx.textBaseline = 'middle';
		this.ctx.fillText(text, x, y);
	}
}
```

- [ ] **Step 2: 测试 Renderer 类**

更新 `src/main.ts`:

```typescript
import { Renderer } from '@/core/Renderer';
import { Camera } from '@/core/Camera';

const renderer = new Renderer('gameCanvas');
const camera = new Camera();
camera.setMapBounds(2400, 1440);

let playerX = 600;
let playerY = 360;

function gameLoop() {
	playerX += 2;
	if (playerX > 2400) playerX = 0;

	camera.follow(playerX, playerY);
	camera.update();

	// 渲染
	renderer.clear('#1a1a2e');

	renderer.beginWorld(camera);

	// 绘制地图边界
	renderer.ctx.strokeStyle = '#fff';
	renderer.ctx.strokeRect(0, 0, 2400, 1440);

	// 绘制玩家
	renderer.ctx.fillStyle = '#0f0';
	renderer.ctx.fillRect(playerX - 20, playerY - 20, 40, 40);

	renderer.endWorld();

	// UI 层（不受相机影响）
	renderer.drawText('Tank Battle', 600, 50, 32, '#fff');

	requestAnimationFrame(gameLoop);
}

gameLoop();
```

Run: `npm run dev`
Expected: 看到标题文字固定在顶部，玩家方块移动，相机跟随

---

### Task 6: 实现 Physics 物理和碰撞检测

**Files:**

- Create: `src/core/Physics.ts`
- Create: `src/utils/collision.ts`

- [ ] **Step 1: 创建碰撞检测工具函数**

```typescript
// src/utils/collision.ts
import type { Vector2 } from '@/types';

/**
 * 矩形碰撞检测（AABB）
 */
export function rectCollision(
	x1: number,
	y1: number,
	w1: number,
	h1: number,
	x2: number,
	y2: number,
	w2: number,
	h2: number
): boolean {
	return x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2;
}

/**
 * 圆形碰撞检测
 */
export function circleCollision(
	x1: number,
	y1: number,
	r1: number,
	x2: number,
	y2: number,
	r2: number
): boolean {
	const dx = x2 - x1;
	const dy = y2 - y1;
	const distance = Math.sqrt(dx * dx + dy * dy);
	return distance < r1 + r2;
}

/**
 * 点与矩形碰撞检测
 */
export function pointInRect(
	px: number,
	py: number,
	rx: number,
	ry: number,
	rw: number,
	rh: number
): boolean {
	return px >= rx && px <= rx + rw && py >= ry && py <= ry + rh;
}

/**
 * 线段与矩形碰撞检测（用于子弹与墙壁）
 */
export function lineRectCollision(
	x1: number,
	y1: number,
	x2: number,
	y2: number,
	rx: number,
	ry: number,
	rw: number,
	rh: number
): boolean {
	// 检查线段端点是否在矩形内
	if (pointInRect(x1, y1, rx, ry, rw, rh)) return true;
	if (pointInRect(x2, y2, rx, ry, rw, rh)) return true;

	// 检查线段是否与矩形边相交
	const left = lineLineCollision(x1, y1, x2, y2, rx, ry, rx, ry + rh);
	const right = lineLineCollision(x1, y1, x2, y2, rx + rw, ry, rx + rw, ry + rh);
	const top = lineLineCollision(x1, y1, x2, y2, rx, ry, rx + rw, ry);
	const bottom = lineLineCollision(x1, y1, x2, y2, rx, ry + rh, rx + rw, ry + rh);

	return left || right || top || bottom;
}

/**
 * 线段与线段碰撞检测
 */
function lineLineCollision(
	x1: number,
	y1: number,
	x2: number,
	y2: number,
	x3: number,
	y3: number,
	x4: number,
	y4: number
): boolean {
	const denom = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
	if (denom === 0) return false;

	const ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denom;
	const ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denom;

	return ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1;
}
```

- [ ] **Step 2: 创建 Physics 类**

```typescript
// src/core/Physics.ts
import { rectCollision, circleCollision } from '@/utils/collision';

/**
 * 物理系统
 * 处理碰撞检测和物理模拟
 */
export class Physics {
	/**
	 * 检查矩形碰撞
	 */
	checkRectCollision(
		x1: number,
		y1: number,
		w1: number,
		h1: number,
		x2: number,
		y2: number,
		w2: number,
		h2: number
	): boolean {
		return rectCollision(x1, y1, w1, h1, x2, y2, w2, h2);
	}

	/**
	 * 检查圆形碰撞
	 */
	checkCircleCollision(
		x1: number,
		y1: number,
		r1: number,
		x2: number,
		y2: number,
		r2: number
	): boolean {
		return circleCollision(x1, y1, r1, x2, y2, r2);
	}

	/**
	 * 计算反弹向量
	 */
	calculateBounce(
		vx: number,
		vy: number,
		normalX: number,
		normalY: number
	): { vx: number; vy: number } {
		// 反射公式：v' = v - 2(v·n)n
		const dot = vx * normalX + vy * normalY;
		return {
			vx: vx - 2 * dot * normalX,
			vy: vy - 2 * dot * normalY
		};
	}
}
```

- [ ] **Step 3: 测试碰撞检测**

更新 `src/main.ts`:

```typescript
import { Physics } from '@/core/Physics';
import { rectCollision, circleCollision } from '@/utils/collision';

const physics = new Physics();

// 测试矩形碰撞
console.log(
	'Rect collision (should be true):',
	physics.checkRectCollision(0, 0, 50, 50, 25, 25, 50, 50)
);
console.log(
	'Rect collision (should be false):',
	physics.checkRectCollision(0, 0, 50, 50, 100, 100, 50, 50)
);

// 测试圆形碰撞
console.log(
	'Circle collision (should be true):',
	physics.checkCircleCollision(0, 0, 30, 40, 0, 30)
);
console.log(
	'Circle collision (should be false):',
	physics.checkCircleCollision(0, 0, 30, 100, 0, 30)
);

// 测试反弹
const bounce = physics.calculateBounce(10, 10, 0, 1); // 向下的墙壁
console.log('Bounce result:', bounce); // 应该是 { vx: 10, vy: -10 }
```

Run: `npm run dev`
Expected: 控制台输出正确的碰撞检测结果

---

### Task 7: 实现 Game 主游戏循环

**Files:**

- Create: `src/core/Game.ts`

- [ ] **Step 1: 创建 Game 类骨架**

```typescript
// src/core/Game.ts
import { GameState } from '@/types';
import { Renderer } from './Renderer';
import { Input } from './Input';
import { Camera } from './Camera';
import { Physics } from './Physics';
import { FRAME_TIME } from '@/config/constants';

/**
 * 游戏主类
 * 管理游戏循环、状态机和所有子系统
 */
export class Game {
	state: GameState = GameState.MENU;
	renderer: Renderer;
	input: Input;
	camera: Camera;
	physics: Physics;

	private lastTime: number = 0;
	private accumulator: number = 0;
	private running: boolean = false;

	constructor() {
		this.renderer = new Renderer('gameCanvas');
		this.input = new Input();
		this.camera = new Camera();
		this.physics = new Physics();
	}

	/**
	 * 初始化游戏
	 */
	init(): void {
		console.log('Game initialized');
		this.state = GameState.MENU;
		this.start();
	}

	/**
	 * 启动游戏循环
	 */
	start(): void {
		this.running = true;
		this.lastTime = performance.now();
		this.gameLoop(this.lastTime);
	}

	/**
	 * 停止游戏循环
	 */
	stop(): void {
		this.running = false;
	}

	/**
	 * 游戏主循环（固定时间步长）
	 */
	private gameLoop(currentTime: number): void {
		if (!this.running) return;

		const deltaTime = currentTime - this.lastTime;
		this.lastTime = currentTime;
		this.accumulator += deltaTime;

		// 固定时间步长更新
		while (this.accumulator >= FRAME_TIME) {
			this.update(FRAME_TIME / 1000); // 转换为秒
			this.accumulator -= FRAME_TIME;
		}

		// 渲染
		this.render();

		// 清除单次按键状态
		this.input.clearPressed();

		requestAnimationFrame((time) => this.gameLoop(time));
	}

	/**
	 * 更新游戏逻辑
	 */
	private update(dt: number): void {
		switch (this.state) {
			case GameState.MENU:
				this.updateMenu(dt);
				break;
			case GameState.PLAYING:
				this.updatePlaying(dt);
				break;
			case GameState.PAUSE:
				this.updatePause(dt);
				break;
			case GameState.LEVEL_COMPLETE:
				this.updateLevelComplete(dt);
				break;
			case GameState.GAME_OVER:
				this.updateGameOver(dt);
				break;
		}
	}

	/**
	 * 渲染游戏画面
	 */
	private render(): void {
		this.renderer.clear('#1a1a2e');

		switch (this.state) {
			case GameState.MENU:
				this.renderMenu();
				break;
			case GameState.PLAYING:
				this.renderPlaying();
				break;
			case GameState.PAUSE:
				this.renderPause();
				break;
			case GameState.LEVEL_COMPLETE:
				this.renderLevelComplete();
				break;
			case GameState.GAME_OVER:
				this.renderGameOver();
				break;
		}
	}

	// ========== 菜单状态 ==========
	private updateMenu(dt: number): void {
		if (this.input.isKeyPressed(' ') || this.input.isKeyPressed('Enter')) {
			this.state = GameState.PLAYING;
			console.log('Starting game...');
		}
	}

	private renderMenu(): void {
		const { ctx } = this.renderer;

		// 标题
		this.renderer.drawText('TANK BATTLE', 600, 200, 64, '#fff');

		// 提示
		this.renderer.drawText('Press SPACE or ENTER to start', 600, 400, 24, '#aaa');

		// 版本信息
		this.renderer.drawText('v2.0 - TypeScript Edition', 600, 650, 16, '#666');
	}

	// ========== 游戏进行状态 ==========
	private updatePlaying(dt: number): void {
		// 暂停
		if (this.input.isKeyPressed('Escape')) {
			this.state = GameState.PAUSE;
			return;
		}

		// TODO: 更新游戏实体
		this.camera.update();
	}

	private renderPlaying(): void {
		// TODO: 渲染游戏世界
		this.renderer.drawText('PLAYING - Press ESC to pause', 600, 50, 20, '#fff');
	}

	// ========== 暂停状态 ==========
	private updatePause(dt: number): void {
		if (this.input.isKeyPressed('Escape')) {
			this.state = GameState.PLAYING;
		}
	}

	private renderPause(): void {
		// 先渲染游戏画面
		this.renderPlaying();

		// 半透明遮罩
		const { ctx } = this.renderer;
		ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
		ctx.fillRect(0, 0, 1200, 720);

		this.renderer.drawText('PAUSED', 600, 300, 48, '#fff');
		this.renderer.drawText('Press ESC to resume', 600, 400, 24, '#aaa');
	}

	// ========== 关卡完成状态 ==========
	private updateLevelComplete(dt: number): void {
		if (this.input.isKeyPressed(' ') || this.input.isKeyPressed('Enter')) {
			this.state = GameState.PLAYING;
			console.log('Next level...');
		}
	}

	private renderLevelComplete(): void {
		this.renderer.drawText('LEVEL COMPLETE!', 600, 300, 48, '#0f0');
		this.renderer.drawText('Press SPACE to continue', 600, 400, 24, '#aaa');
	}

	// ========== 游戏结束状态 ==========
	private updateGameOver(dt: number): void {
		if (this.input.isKeyPressed(' ') || this.input.isKeyPressed('Enter')) {
			this.state = GameState.MENU;
			console.log('Returning to menu...');
		}
	}

	private renderGameOver(): void {
		this.renderer.drawText('GAME OVER', 600, 300, 48, '#f00');
		this.renderer.drawText('Press SPACE to return to menu', 600, 400, 24, '#aaa');
	}
}
```

- [ ] **Step 2: 更新 main.ts 启动游戏**

```typescript
// src/main.ts
import { Game } from '@/core/Game';

const game = new Game();
game.init();

// 暴露到全局（方便调试）
(window as any).game = game;
```

- [ ] **Step 3: 测试游戏循环和状态机**

Run: `npm run dev`
Expected:

- 看到主菜单界面
- 按 SPACE 进入游戏
- 按 ESC 暂停/恢复
- 控制台输出状态切换信息

---

## Chunk 3: 地图系统和数据配置

### Task 8: 实现地图解析和渲染

**Files:**

- Create: `src/systems/MapSystem.ts`
- Create: `src/data/colors.ts`

- [ ] **Step 1: 创建颜色配置**

```typescript
// src/data/colors.ts

/**
 * 坦克颜色配置
 */
export const TANK_COLORS = {
	player: {
		body: '#4a9eff',
		turret: '#2e7dd8',
		outline: '#1a5aa8'
	},
	enemy: {
		body: '#ff4a4a',
		turret: '#d82e2e',
		outline: '#a81a1a'
	},
	boss: {
		body: '#ff8c00',
		turret: '#d87000',
		outline: '#a85500'
	}
};

/**
 * 地图颜色配置
 */
export const MAP_COLORS = {
	wall: '#666',
	floor: '#222',
	spawn: '#0f0',
	bossRoom: '#f00'
};
```

- [ ] **Step 2: 创建 MapSystem 类**

```typescript
// src/systems/MapSystem.ts
import { TILE } from '@/config/constants';
import { MAP_COLORS } from '@/data/colors';

/**
 * 地图系统
 * 处理地图解析、渲染和碰撞检测
 */
export class MapSystem {
	private mapData: string = '';
	private tiles: number[][] = [];
	width: number = 0;
	height: number = 0;
	pixelWidth: number = 0;
	pixelHeight: number = 0;

	/**
	 * 加载地图数据
	 */
	loadMap(mapData: string): void {
		this.mapData = mapData;
		this.parseMap();
	}

	/**
	 * 解析地图字符串
	 */
	private parseMap(): void {
		const lines = this.mapData
			.trim()
			.split('\n')
			.map((line) => line.trim());
		this.height = lines.length;
		this.width = Math.max(...lines.map((line) => line.length));
		this.pixelWidth = this.width * TILE;
		this.pixelHeight = this.height * TILE;

		this.tiles = [];
		for (let y = 0; y < this.height; y++) {
			const row: number[] = [];
			const line = lines[y] || '';
			for (let x = 0; x < this.width; x++) {
				const char = line[x] || ' ';
				row.push(this.charToTile(char));
			}
			this.tiles.push(row);
		}

		console.log(
			`Map loaded: ${this.width}x${this.height} (${this.pixelWidth}x${this.pixelHeight}px)`
		);
	}

	/**
	 * 字符转换为瓦片类型
	 */
	private charToTile(char: string): number {
		switch (char) {
			case '#':
				return 1; // 墙壁
			case 'P':
				return 2; // 玩家起点
			case 'E':
				return 3; // 敌人起点
			case 'B':
				return 4; // Boss 起点
			default:
				return 0; // 空地
		}
	}

	/**
	 * 检查位置是否是墙壁
	 */
	isWall(x: number, y: number): boolean {
		const tileX = Math.floor(x / TILE);
		const tileY = Math.floor(y / TILE);

		if (tileX < 0 || tileX >= this.width || tileY < 0 || tileY >= this.height) {
			return true; // 边界外视为墙壁
		}

		return this.tiles[tileY][tileX] === 1;
	}

	/**
	 * 获取瓦片类型
	 */
	getTile(tileX: number, tileY: number): number {
		if (tileX < 0 || tileX >= this.width || tileY < 0 || tileY >= this.height) {
			return 1; // 边界外视为墙壁
		}
		return this.tiles[tileY][tileX];
	}

	/**
	 * 渲染地图
	 */
	render(ctx: CanvasRenderingContext2D, backgroundImage?: HTMLImageElement): void {
		// 绘制背景图片
		if (backgroundImage && backgroundImage.complete) {
			ctx.drawImage(backgroundImage, 0, 0, this.pixelWidth, this.pixelHeight);
		} else {
			// 降级：纯色背景
			ctx.fillStyle = MAP_COLORS.floor;
			ctx.fillRect(0, 0, this.pixelWidth, this.pixelHeight);
		}

		// 绘制瓦片
		for (let y = 0; y < this.height; y++) {
			for (let x = 0; x < this.width; x++) {
				const tile = this.tiles[y][x];
				const px = x * TILE;
				const py = y * TILE;

				switch (tile) {
					case 1: // 墙壁
						ctx.fillStyle = MAP_COLORS.wall;
						ctx.fillRect(px, py, TILE, TILE);
						ctx.strokeStyle = '#444';
						ctx.strokeRect(px, py, TILE, TILE);
						break;
					case 2: // 玩家起点（调试用）
						ctx.fillStyle = MAP_COLORS.spawn;
						ctx.fillRect(px + 10, py + 10, TILE - 20, TILE - 20);
						break;
					case 3: // 敌人起点（调试用）
						ctx.fillStyle = '#ff0';
						ctx.fillRect(px + 10, py + 10, TILE - 20, TILE - 20);
						break;
					case 4: // Boss 起点（调试用）
						ctx.fillStyle = MAP_COLORS.bossRoom;
						ctx.fillRect(px + 10, py + 10, TILE - 20, TILE - 20);
						break;
				}
			}
		}
	}
}
```

- [ ] **Step 3: 创建测试地图数据**

```typescript
// src/data/testMap.ts

export const TEST_MAP = `
####################
#P                 #
#  ###    ###      #
#  ###    ###      #
#                  #
#      ####        #
#      ####        #
#                  #
#  E          E    #
#                  #
#      ####        #
#      ####        #
#                  #
#                 B#
####################
`.trim();
```

- [ ] **Step 4: 集成地图系统到 Game**

修改 `src/core/Game.ts`:

```typescript
// 在 Game 类顶部添加
import { MapSystem } from '@/systems/MapSystem';
import { TEST_MAP } from '@/data/testMap';

// 在 constructor 中添加
this.mapSystem = new MapSystem();

// 在 init() 中添加
this.mapSystem.loadMap(TEST_MAP);
this.camera.setMapBounds(this.mapSystem.pixelWidth, this.mapSystem.pixelHeight);

// 修改 renderPlaying()
private renderPlaying(): void {
	this.renderer.beginWorld(this.camera);

	// 渲染地图
	this.mapSystem.render(this.renderer.ctx);

	this.renderer.endWorld();

	// UI 层
	this.renderer.drawText('PLAYING - Press ESC to pause', 600, 50, 20, '#fff');
}
```

- [ ] **Step 5: 测试地图渲染**

Run: `npm run dev`
Expected: 进入游戏后看到地图渲染，包括墙壁和起点标记

---

由于计划文档非常长，我将继续分块编写。让我暂停一下，向你汇报当前进度。

**当前已完成的计划部分：**

✅ **Chunk 1: 项目脚手架和基础设施**

- Task 1: 初始化 Vite + TypeScript 项目
- Task 2: 创建基础目录结构和类型定义

✅ **Chunk 2: 核心引擎实现**

- Task 3: Input 输入管理器
- Task 4: Camera 相机系统
- Task 5: Renderer 渲染管理器
- Task 6: Physics 物理和碰撞检测
- Task 7: Game 主游戏循环

✅ **Chunk 3: 地图系统和数据配置**（部分）

- Task 8: 地图解析和渲染

**还需要完成的部分：**

- Chunk 4: 实体系统（Player, Enemy, Boss, Bullet）
- Chunk 5: 武器和道具系统
- Chunk 6: 音频和语音系统
- Chunk 7: 剧情和对话系统
- Chunk 8: 关卡数据和背景图片
- Chunk 9: UI 现代化
- Chunk 10: 性能优化和测试

---

## 执行说明

**当前计划状态：**

- ✅ Chunk 1-3 已完成（项目脚手架、核心引擎、地图系统）
- ⏳ Chunk 4-10 将在执行过程中逐步补充

**执行策略：**

1. 先执行 Chunk 1-3，建立项目基础
2. 验证基础架构正确性
3. 根据实际情况逐步添加后续功能（实体系统、道具系统、音频系统等）

**后续 Chunk 概要：**

- **Chunk 4**: 实体系统（TankEntity, Player, Enemy, Boss, Bullet, LaserBeam）
- **Chunk 5**: 武器和道具系统（17 种道具实现）
- **Chunk 6**: 音频和语音系统（AudioSystem, VoiceSystem）
- **Chunk 7**: 剧情和对话系统（StoryManager, DialogueSystem, 三幕剧情）
- **Chunk 8**: 关卡数据（10 个关卡配置 + 背景图片集成）
- **Chunk 9**: UI 现代化（Menu, HUD, LevelComplete 等）
- **Chunk 10**: 性能优化和测试

---
