// ═══════════════════════════════════════════════════════════════════════════
// 游戏主类 - 整合所有系统
// ═══════════════════════════════════════════════════════════════════════════

import type { GameState, DialogueLine } from '@/types';
import { FIXED_TIMESTEP, CANVAS_WIDTH, CANVAS_HEIGHT } from '@/constants';
import { InputManager } from './InputManager';
import { Camera } from './Camera';
import { Renderer } from './Renderer';
import { Quadtree } from './Physics';
import { GameMap } from './Map';
import { Player } from '@/entities/Player';
import { Enemy } from '@/entities/Enemy';
import { Boss } from '@/entities/Boss';
import { Bullet } from '@/entities/Bullet';
import { LaserBeam } from '@/entities/LaserBeam';
import { audioSystem } from '@/systems/AudioSystem';
import { VoiceSystem } from '@/systems/VoiceSystem';
import { DialogueSystem } from '@/systems/DialogueSystem';
import { PowerUpSystem } from '@/systems/PowerUpSystem';
import { ParticleSystem } from '@/systems/ParticleSystem';
import { HUD } from '@/ui/HUD';
import { Menu } from '@/ui/Menu';
import { LEVELS } from '@/data/levels';
import { STORY_DATA } from '@/data/story';

/**
 * 剧情触发标志
 */
interface StoryFlags {
	openingDone: boolean;
	bossIntroDone: boolean;
	bossDefeatedDone: boolean;
}

/**
 * 游戏主类 - 管理游戏循环、状态机和所有系统
 */
export class Game {
	// 游戏状态
	state: GameState;
	levelIdx: number;
	private storyFlags: StoryFlags;

	// 核心系统
	private input: InputManager;
	private camera: Camera;
	private renderer: Renderer;
	private quadtree: Quadtree;

	// 游戏系统
	private voiceSystem: VoiceSystem;
	private dialogueSystem: DialogueSystem;
	private powerUpSystem: PowerUpSystem;
	private particleSystem: ParticleSystem;
	private hud: HUD;
	private menu: Menu;

	// 游戏实体
	private map: GameMap | null;
	private player: Player | null;
	private enemies: Enemy[];
	private boss: Boss | null;
	private bullets: Bullet[];
	private laserBeams: LaserBeam[];

	// 鼠标位置（世界坐标）
	private mouseWorldX: number;
	private mouseWorldY: number;

	// 游戏循环
	private lastTime: number;
	private accumulator: number;
	private running: boolean;

	constructor(canvas: HTMLCanvasElement) {
		// 初始化状态
		this.state = 'menu';
		this.levelIdx = 0;
		this.storyFlags = {
			openingDone: false,
			bossIntroDone: false,
			bossDefeatedDone: false,
		};

		// 初始化核心系统
		this.input = new InputManager();
		this.camera = new Camera();
		this.renderer = new Renderer(canvas, this.camera);
		this.quadtree = new Quadtree({
			x: 0,
			y: 0,
			width: CANVAS_WIDTH * 2,
			height: CANVAS_HEIGHT * 2,
		});

		// 初始化游戏系统
		this.voiceSystem = new VoiceSystem();
		this.dialogueSystem = new DialogueSystem(this.voiceSystem);
		this.powerUpSystem = new PowerUpSystem();
		this.particleSystem = new ParticleSystem();
		this.hud = new HUD(this.renderer.ctx);
		this.menu = new Menu(this.renderer.ctx);

		// 初始化实体
		this.map = null;
		this.player = null;
		this.enemies = [];
		this.boss = null;
		this.bullets = [];
		this.laserBeams = [];

		// 初始化鼠标位置
		this.mouseWorldX = 0;
		this.mouseWorldY = 0;

		// 初始化游戏循环
		this.lastTime = 0;
		this.accumulator = 0;
		this.running = false;

		// 绑定事件监听器
		this.setupEventListeners(canvas);
	}

	/**
	 * 设置事件监听器
	 */
	private setupEventListeners(canvas: HTMLCanvasElement): void {
		// 鼠标移动事件
		canvas.addEventListener('mousemove', (e) => {
			const rect = canvas.getBoundingClientRect();
			const scaleX = CANVAS_WIDTH / rect.width;
			const scaleY = CANVAS_HEIGHT / rect.height;
			const canvasX = (e.clientX - rect.left) * scaleX;
			const canvasY = (e.clientY - rect.top) * scaleY;

			// 转换为世界坐标
			this.mouseWorldX = canvasX + this.camera.x - CANVAS_WIDTH / 2;
			this.mouseWorldY = canvasY + this.camera.y - CANVAS_HEIGHT / 2;
		});

		// 鼠标点击事件（用于推进对话）
		canvas.addEventListener('click', () => {
			if (this.state === 'dialogue' && this.dialogueSystem.isActive) {
				this.dialogueSystem.advance();
			}
		});

		// 键盘事件（ESC 暂停，Space 推进对话/开始游戏）
		window.addEventListener('keydown', (e) => {
			const key = e.key.toLowerCase();

			// ESC 暂停/继续
			if (key === 'escape') {
				if (this.state === 'playing') {
					this.setState('pause');
				} else if (this.state === 'pause') {
					this.setState('playing');
				}
			}

			// Space 推进对话
			if (key === ' ' || key === 'enter') {
				if (this.state === 'dialogue' && this.dialogueSystem.isActive) {
					e.preventDefault();
					this.dialogueSystem.advance();
				} else if (this.state === 'menu') {
					e.preventDefault();
					this.startGame();
				}
			}
		});

		// 窗口大小变化
		window.addEventListener('resize', () => {
			this.renderer.updateScale();
		});
	}

	/**
	 * 初始化游戏
	 */
	init(): void {
		console.log('游戏初始化...');

		// 音频系统会在首次用户交互时自动初始化

		// 启动游戏循环
		this.running = true;
		this.lastTime = performance.now();
		this.loop(this.lastTime);
	}

	/**
	 * 开始游戏
	 */
	private startGame(): void {
		this.levelIdx = 0;
		this.loadLevel(0);
	}

	/**
	 * 加载关卡
	 */
	loadLevel(levelIdx: number): void {
		console.log(`加载关卡 ${levelIdx + 1}...`);

		// 检查关卡索引
		if (levelIdx < 0 || levelIdx >= LEVELS.length) {
			console.error(`无效的关卡索引: ${levelIdx}`);
			return;
		}

		this.levelIdx = levelIdx;
		const level = LEVELS[levelIdx];

		// 重置剧情标志
		this.storyFlags = {
			openingDone: false,
			bossIntroDone: false,
			bossDefeatedDone: false,
		};

		// 清空实体
		this.enemies = [];
		this.boss = null;
		this.bullets = [];
		this.laserBeams = [];
		this.powerUpSystem.powerUps = [];
		this.powerUpSystem.activeEffects = [];

		// 创建地图
		this.map = new GameMap(level.map);

		// 获取地图尺寸（通过访问器）
		const mapWidth = this.map.getWidth() * 48;
		const mapHeight = this.map.getHeight() * 48;
		this.player = new Player(mapWidth / 2, mapHeight / 2);

		// 创建敌人
		let enemyId = 0;
		for (const enemyConfig of level.enemies) {
			for (let i = 0; i < enemyConfig.count; i++) {
				const x = Math.random() * mapWidth;
				const y = Math.random() * mapHeight;
				const enemy = new Enemy(x, y, enemyConfig.type, `enemy_${enemyId++}`);
				this.enemies.push(enemy);
			}
		}

		// 创建 Boss
		const bossX = mapWidth / 2 + 300;
		const bossY = mapHeight / 2;
		this.boss = new Boss(bossX, bossY, level.boss, 'boss');

		// 切换到游戏状态
		this.setState('playing');

		// 延迟触发开场对话
		setTimeout(() => {
			if (!this.storyFlags.openingDone) {
				this.triggerDialogue(STORY_DATA[this.levelIdx].opening, () => {
					this.storyFlags.openingDone = true;
					this.setState('playing');
				});
			}
		}, 100);
	}

	/**
	 * 触发剧情对话
	 */
	private triggerDialogue(lines: DialogueLine[], onComplete: () => void): void {
		this.setState('dialogue');
		this.dialogueSystem.start(lines, onComplete);
	}

	/**
	 * 游戏主循环
	 */
	private loop(currentTime: number): void {
		if (!this.running) return;

		const deltaTime = (currentTime - this.lastTime) / 1000;
		this.lastTime = currentTime;
		this.accumulator += deltaTime;

		// 固定时间步长更新
		while (this.accumulator >= FIXED_TIMESTEP) {
			this.update(FIXED_TIMESTEP);
			this.accumulator -= FIXED_TIMESTEP;
		}

		this.draw();

		requestAnimationFrame((time) => this.loop(time));
	}

	/**
	 * 更新游戏逻辑
	 */
	private update(dt: number): void {
		// 更新输入（清理瞬时状态）
		this.input.update();

		// 根据状态更新游戏逻辑
		switch (this.state) {
			case 'menu':
				this.updateMenu(dt);
				break;
			case 'playing':
				this.updatePlaying(dt);
				break;
			case 'dialogue':
				this.updateDialogue(dt);
				break;
			case 'levelComplete':
				this.updateLevelComplete(dt);
				break;
			case 'gameOver':
				this.updateGameOver(dt);
				break;
			case 'pause':
				this.updatePause(dt);
				break;
		}
	}

	/**
	 * 更新菜单状态
	 */
	private updateMenu(_dt: number): void {
		// Space 键在事件监听器中处理
	}

	/**
	 * 更新游戏进行状态
	 */
	private updatePlaying(dt: number): void {
		if (!this.map || !this.player) return;

		// 清空四叉树
		this.quadtree.clear();

		// 更新玩家
		this.player.updateWithInput(
			dt,
			this.map,
			this.input,
			this.mouseWorldX,
			this.mouseWorldY,
			this.bullets
		);
		this.player.update(dt, this.map);

		// 更新敌人
		for (const enemy of this.enemies) {
			if (enemy.alive) {
				enemy.updateAI(dt, this.map, this.player.getPosition());
				enemy.update(dt, this.map);
				enemy.fire(this.bullets);
			}
		}

		// 更新 Boss
		if (this.boss && this.boss.alive) {
			this.boss.updateAI(dt, this.map, this.player.getPosition());
			this.boss.update(dt, this.map);
			this.boss.fire(this.bullets);

			// 触发 Boss 登场对话
			if (!this.storyFlags.bossIntroDone) {
				const dist = Math.hypot(
					this.player.x - this.boss.x,
					this.player.y - this.boss.y
				);
				if (dist < 500) {
					this.storyFlags.bossIntroDone = true;
					this.triggerDialogue(STORY_DATA[this.levelIdx].bossIntro, () => {
						this.setState('playing');
					});
					audioSystem.bossRoar();
				}
			}

			// 触发 Boss 战败对话
			if (!this.boss.alive && !this.storyFlags.bossDefeatedDone) {
				this.storyFlags.bossDefeatedDone = true;
				this.triggerDialogue(STORY_DATA[this.levelIdx].bossDefeated, () => {
					this.setState('levelComplete');
				});
				audioSystem.victory();
			}
		}

		// 更新子弹
		for (let i = this.bullets.length - 1; i >= 0; i--) {
			const bullet = this.bullets[i];
			bullet.update(dt);

			if (!bullet.active) {
				this.bullets.splice(i, 1);
			}
		}

		// 更新激光束
		for (let i = this.laserBeams.length - 1; i >= 0; i--) {
			const laser = this.laserBeams[i];
			laser.update(dt);

			if (!laser.active) {
				this.laserBeams.splice(i, 1);
			}
		}

		// 更新道具
		this.powerUpSystem.update(dt, this.player);

		// 更新粒子
		this.particleSystem.update(dt);

		// 碰撞检测
		this.checkCollisions();

		// 更新相机跟随玩家
		this.camera.follow(this.player.getPosition(), dt);

		// 检查关卡完成条件
		if (this.boss && !this.boss.alive && this.storyFlags.bossDefeatedDone) {
			// 对话结束后会切换到 levelComplete 状态
		}

		// 检查玩家死亡
		if (!this.player.alive) {
			this.setState('gameOver');
		}
	}

	/**
	 * 碰撞检测
	 */
	private checkCollisions(): void {
		if (!this.player) return;

		// 子弹 vs 玩家
		for (const bullet of this.bullets) {
			if (!bullet.active || bullet.ownerId === 'player') continue;

			if (this.checkBulletEntityCollision(bullet, this.player.x, this.player.y, 24)) {
				this.player.takeDamage(bullet.damage);
				bullet.active = false;
				audioSystem.hitMetal();
			}
		}

		// 子弹 vs 敌人
		for (const enemy of this.enemies) {
			if (!enemy.alive) continue;

			for (const bullet of this.bullets) {
				if (!bullet.active || bullet.ownerId !== 'player') continue;

				if (this.checkBulletEntityCollision(bullet, enemy.x, enemy.y, 24)) {
					enemy.takeDamage(bullet.damage);
					bullet.active = false;
					audioSystem.hitMetal();

					if (!enemy.alive) {
						this.player.score += enemy.scoreValue;
						this.spawnPowerUp(enemy.x, enemy.y);
						audioSystem.tankDeath();
					}
				}
			}
		}

		// 子弹 vs Boss
		if (this.boss && this.boss.alive) {
			for (const bullet of this.bullets) {
				if (!bullet.active || bullet.ownerId !== 'player') continue;

				if (this.checkBulletEntityCollision(bullet, this.boss.x, this.boss.y, 24)) {
					this.boss.takeDamage(bullet.damage);
					bullet.active = false;
					audioSystem.hitMetal();

					if (!this.boss.alive) {
						this.player.score += this.boss.scoreValue;
						audioSystem.tankDeath();
					}
				}
			}
		}

		// 玩家收集道具
		for (let i = this.powerUpSystem.powerUps.length - 1; i >= 0; i--) {
			const powerUp = this.powerUpSystem.powerUps[i];
			if (!powerUp.alive) continue;

			const dist = Math.hypot(this.player.x - powerUp.x, this.player.y - powerUp.y);
			if (dist < 30) {
				// 应用道具效果
				powerUp.alive = false;
				this.powerUpSystem.powerUps.splice(i, 1);

				// 根据道具类型应用效果
				if (powerUp.type === 'health') {
					this.player.health = Math.min(
						this.player.health + (powerUp.value || 20),
						this.player.maxHealth
					);
				} else if (powerUp.type === 'weapon') {
					// 武器升级逻辑
					const weapons: Array<'pistol' | 'shotgun' | 'machinegun' | 'cannon' | 'laser' | 'minigun'> = [
						'pistol',
						'shotgun',
						'machinegun',
						'cannon',
						'laser',
						'minigun',
					];
					const currentIndex = weapons.indexOf(this.player.weaponType);
					if (currentIndex < weapons.length - 1) {
						this.player.weaponType = weapons[currentIndex + 1];
					}
				}

				audioSystem.pickup();
			}
		}
	}

	/**
	 * 检查子弹与实体的碰撞
	 */
	private checkBulletEntityCollision(
		bullet: Bullet,
		entityX: number,
		entityY: number,
		entityRadius: number
	): boolean {
		const dx = bullet.x - entityX;
		const dy = bullet.y - entityY;
		const dist = Math.sqrt(dx * dx + dy * dy);
		return dist < 5 + entityRadius; // 子弹半径约为 5
	}

	/**
	 * 生成道具
	 */
	private spawnPowerUp(x: number, y: number): void {
		// 30% 概率生成道具
		if (Math.random() < 0.3) {
			this.powerUpSystem.spawnRandom(x, y);
		}
	}

	/**
	 * 更新对话状态
	 */
	private updateDialogue(dt: number): void {
		this.dialogueSystem.update(dt);

		// 对话结束后的回调会自动切换状态
	}

	/**
	 * 更新关卡完成状态
	 */
	private updateLevelComplete(_dt: number): void {
		// Space 键继续下一关
		if (this.input.isKeyPressed(' ')) {
			const nextLevel = this.levelIdx + 1;
			if (nextLevel < LEVELS.length) {
				this.loadLevel(nextLevel);
			} else {
				// 游戏通关
				this.setState('menu');
			}
		}
	}

	/**
	 * 更新游戏结束状态
	 */
	private updateGameOver(_dt: number): void {
		// Space 键返回菜单
		if (this.input.isKeyPressed(' ')) {
			this.setState('menu');
		}
	}

	/**
	 * 更新暂停状态
	 */
	private updatePause(_dt: number): void {
		// ESC 键在事件监听器中处理
	}

	/**
	 * 绘制游戏画面
	 */
	private draw(): void {
		this.renderer.clear();

		// 根据状态绘制
		switch (this.state) {
			case 'menu':
				this.drawMenu();
				break;
			case 'playing':
				this.drawPlaying();
				break;
			case 'dialogue':
				this.drawDialogue();
				break;
			case 'levelComplete':
				this.drawLevelComplete();
				break;
			case 'gameOver':
				this.drawGameOver();
				break;
			case 'pause':
				this.drawPause();
				break;
		}
	}

	/**
	 * 绘制菜单
	 */
	private drawMenu(): void {
		this.menu.renderMainMenu({
			onStart: () => this.startGame(),
		});
	}

	/**
	 * 绘制游戏进行画面
	 */
	private drawPlaying(): void {
		if (!this.map || !this.player) return;

		// 绘制地图
		this.map.draw(this.renderer);

		// 绘制道具
		for (const powerUp of this.powerUpSystem.powerUps) {
			if (powerUp.alive) {
				this.drawPowerUp(powerUp);
			}
		}

		// 绘制敌人
		for (const enemy of this.enemies) {
			if (enemy.alive) {
				enemy.draw(this.renderer);
			}
		}

		// 绘制 Boss
		if (this.boss && this.boss.alive) {
			this.boss.draw(this.renderer);
		}

		// 绘制玩家
		this.player.draw(this.renderer);

		// 绘制子弹
		for (const bullet of this.bullets) {
			if (bullet.active) {
				this.drawBullet(bullet);
			}
		}

		// 绘制激光束
		for (const laser of this.laserBeams) {
			if (laser.active) {
				laser.draw(this.renderer);
			}
		}

		// 绘制粒子
		this.particleSystem.draw(this.renderer);

		// 绘制 HUD
		const enemiesLeft = this.enemies.filter((e) => e.alive).length;
		this.hud.render({
			health: this.player.health,
			maxHealth: this.player.maxHealth,
			weapon: this.player.weaponType,
			score: this.player.score,
			level: this.levelIdx + 1,
			levelName: LEVELS[this.levelIdx].name,
			enemiesLeft,
			bossHealth: this.boss?.health,
			bossMaxHealth: this.boss?.maxHealth,
			bossName: this.boss ? LEVELS[this.levelIdx].bossName : undefined,
		});
	}

	/**
	 * 绘制子弹（简单圆形）
	 */
	private drawBullet(bullet: Bullet): void {
		const ctx = this.renderer.ctx;
		ctx.save();
		ctx.translate(bullet.x - this.camera.x + CANVAS_WIDTH / 2, bullet.y - this.camera.y + CANVAS_HEIGHT / 2);
		ctx.fillStyle = '#ffff00';
		ctx.beginPath();
		ctx.arc(0, 0, 5, 0, Math.PI * 2);
		ctx.fill();
		ctx.restore();
	}

	/**
	 * 绘制道具（简单方形）
	 */
	private drawPowerUp(powerUp: { x: number; y: number; type: string }): void {
		const ctx = this.renderer.ctx;
		ctx.save();
		ctx.translate(powerUp.x - this.camera.x + CANVAS_WIDTH / 2, powerUp.y - this.camera.y + CANVAS_HEIGHT / 2);
		ctx.fillStyle = powerUp.type === 'health' ? '#00ff00' : '#ff00ff';
		ctx.fillRect(-10, -10, 20, 20);
		ctx.restore();
	}

	/**
	 * 绘制对话画面
	 */
	private drawDialogue(): void {
		// 先绘制游戏画面
		this.drawPlaying();

		// 绘制对话框
		this.dialogueSystem.draw(this.renderer.ctx, CANVAS_WIDTH);
	}

	/**
	 * 绘制关卡完成画面
	 */
	private drawLevelComplete(): void {
		// 先绘制游戏画面
		this.drawPlaying();

		// 绘制半透明遮罩
		this.renderer.fillRectUI(
			{ x: 0, y: 0, width: CANVAS_WIDTH, height: CANVAS_HEIGHT },
			'rgba(0, 0, 0, 0.5)'
		);

		// 绘制完成文本
		this.renderer.ctx.textAlign = 'center';
		this.renderer.ctx.textBaseline = 'middle';
		this.renderer.fillTextUI(
			'关卡完成！',
			{ x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 - 50 },
			'48px Arial',
			'#00ff00'
		);

		const nextLevel = this.levelIdx + 1;
		const text = nextLevel < LEVELS.length ? '按 SPACE 继续' : '按 SPACE 返回菜单';
		this.renderer.fillTextUI(
			text,
			{ x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 + 50 },
			'24px Arial',
			'#aaaaaa'
		);
	}

	/**
	 * 绘制游戏结束画面
	 */
	private drawGameOver(): void {
		this.renderer.ctx.textAlign = 'center';
		this.renderer.ctx.textBaseline = 'middle';
		this.renderer.fillTextUI(
			'游戏结束',
			{ x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 - 50 },
			'48px Arial',
			'#ff0000'
		);
		this.renderer.fillTextUI(
			'按 SPACE 返回菜单',
			{ x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 + 50 },
			'24px Arial',
			'#aaaaaa'
		);
	}

	/**
	 * 绘制暂停画面
	 */
	private drawPause(): void {
		// 先绘制游戏画面
		this.drawPlaying();

		// 绘制半透明遮罩
		this.renderer.fillRectUI(
			{ x: 0, y: 0, width: CANVAS_WIDTH, height: CANVAS_HEIGHT },
			'rgba(0, 0, 0, 0.5)'
		);

		// 绘制暂停文本
		this.renderer.ctx.textAlign = 'center';
		this.renderer.ctx.textBaseline = 'middle';
		this.renderer.fillTextUI(
			'暂停',
			{ x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 - 50 },
			'48px Arial',
			'#ffffff'
		);
		this.renderer.fillTextUI(
			'按 ESC 继续',
			{ x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 + 50 },
			'24px Arial',
			'#aaaaaa'
		);
	}

	/**
	 * 切换游戏状态
	 */
	setState(newState: GameState): void {
		console.log(`状态切换: ${this.state} -> ${newState}`);
		this.state = newState;
	}

	/**
	 * 销毁游戏实例
	 */
	destroy(): void {
		this.running = false;
		this.input.destroy();
		this.voiceSystem.stop();
		audioSystem.stopTrack();
	}

	/**
	 * 获取输入管理器（供外部访问）
	 */
	getInput(): InputManager {
		return this.input;
	}

	/**
	 * 获取相机（供外部访问）
	 */
	getCamera(): Camera {
		return this.camera;
	}

	/**
	 * 获取渲染器（供外部访问）
	 */
	getRenderer(): Renderer {
		return this.renderer;
	}

	/**
	 * 获取四叉树（供外部访问）
	 */
	getQuadtree(): Quadtree {
		return this.quadtree;
	}
}

