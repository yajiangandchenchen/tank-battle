// ═══════════════════════════════════════════════════════════════════════════
// 游戏主循环
// ═══════════════════════════════════════════════════════════════════════════

import type { GameState } from '@/types';
import { FIXED_TIMESTEP, CANVAS_WIDTH, CANVAS_HEIGHT } from '@/constants';
import { InputManager } from './InputManager';
import { Camera } from './Camera';
import { Renderer } from './Renderer';
import { Quadtree } from './Physics';

/**
 * 游戏主类 - 管理游戏循环和状态机
 */
export class Game {
	state: GameState;
	private input: InputManager;
	private camera: Camera;
	private renderer: Renderer;
	private quadtree: Quadtree;
	private lastTime: number;
	private accumulator: number;
	private running: boolean;

	constructor(canvas: HTMLCanvasElement) {
		this.state = 'menu';
		this.input = new InputManager();
		this.camera = new Camera();
		this.renderer = new Renderer(canvas, this.camera);
		this.quadtree = new Quadtree({
			x: 0,
			y: 0,
			width: CANVAS_WIDTH * 2,
			height: CANVAS_HEIGHT * 2,
		});
		this.lastTime = 0;
		this.accumulator = 0;
		this.running = false;
	}

	/**
	 * 初始化游戏
	 */
	init(): void {
		console.log('游戏初始化...');
		this.running = true;
		this.lastTime = performance.now();
		this.loop(this.lastTime);

		// 监听窗口大小变化
		window.addEventListener('resize', () => {
			this.renderer.updateScale();
		});
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
			case 'levelComplete':
				this.updateLevelComplete(dt);
				break;
			case 'gameOver':
				this.updateGameOver(dt);
				break;
			case 'pause':
				this.updatePause(dt);
				break;
			case 'dialogue':
				this.updateDialogue(dt);
				break;
		}
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
			case 'levelComplete':
				this.drawLevelComplete();
				break;
			case 'gameOver':
				this.drawGameOver();
				break;
			case 'pause':
				this.drawPause();
				break;
			case 'dialogue':
				this.drawDialogue();
				break;
		}
	}

	/**
	 * 更新菜单状态
	 */
	private updateMenu(_dt: number): void {
		// 按空格键开始游戏
		if (this.input.isKeyPressed(' ')) {
			this.setState('playing');
		}
	}

	/**
	 * 绘制菜单
	 */
	private drawMenu(): void {
		// 绘制标题
		this.renderer.ctx.textAlign = 'center';
		this.renderer.ctx.textBaseline = 'middle';
		this.renderer.fillTextUI(
			'Tank Battle',
			{ x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 - 50 },
			'48px Arial',
			'#ffffff'
		);

		// 绘制提示
		this.renderer.fillTextUI(
			'按 SPACE 开始',
			{ x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 + 50 },
			'24px Arial',
			'#aaaaaa'
		);
	}

	/**
	 * 更新游戏进行状态
	 */
	private updatePlaying(dt: number): void {
		// 清空四叉树
		this.quadtree.clear();

		// 按 ESC 暂停游戏
		if (this.input.isKeyPressed('escape')) {
			this.setState('pause');
		}

		// TODO: 更新游戏实体
		// - 更新玩家
		// - 更新敌人
		// - 更新子弹
		// - 更新粒子
		// - 碰撞检测

		// 更新相机跟随（暂时跟随屏幕中心）
		this.camera.follow({ x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 }, dt);
	}

	/**
	 * 绘制游戏进行画面
	 */
	private drawPlaying(): void {
		// TODO: 绘制游戏世界
		// - 绘制地图
		// - 绘制实体
		// - 绘制粒子
		// - 绘制 HUD

		// 临时显示
		this.renderer.ctx.textAlign = 'center';
		this.renderer.ctx.textBaseline = 'top';
		this.renderer.fillTextUI(
			'游戏进行中... (按 ESC 暂停)',
			{ x: CANVAS_WIDTH / 2, y: 20 },
			'20px Arial',
			'#ffffff'
		);
	}

	/**
	 * 更新关卡完成状态
	 */
	private updateLevelComplete(_dt: number): void {
		// 按空格键继续下一关
		if (this.input.isKeyPressed(' ')) {
			this.setState('playing');
		}
	}

	/**
	 * 绘制关卡完成画面
	 */
	private drawLevelComplete(): void {
		this.renderer.ctx.textAlign = 'center';
		this.renderer.ctx.textBaseline = 'middle';
		this.renderer.fillTextUI(
			'关卡完成！',
			{ x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 - 50 },
			'48px Arial',
			'#00ff00'
		);
		this.renderer.fillTextUI(
			'按 SPACE 继续',
			{ x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 + 50 },
			'24px Arial',
			'#aaaaaa'
		);
	}

	/**
	 * 更新游戏结束状态
	 */
	private updateGameOver(_dt: number): void {
		// 按空格键返回菜单
		if (this.input.isKeyPressed(' ')) {
			this.setState('menu');
		}
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
	 * 更新暂停状态
	 */
	private updatePause(_dt: number): void {
		// 按 ESC 继续游戏
		if (this.input.isKeyPressed('escape')) {
			this.setState('playing');
		}
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
	 * 更新对话状态
	 */
	private updateDialogue(_dt: number): void {
		// TODO: 更新对话系统
		// 按空格键推进对话
		if (this.input.isKeyPressed(' ')) {
			// 对话结束后返回游戏
			this.setState('playing');
		}
	}

	/**
	 * 绘制对话画面
	 */
	private drawDialogue(): void {
		// 先绘制游戏画面
		this.drawPlaying();

		// TODO: 绘制对话框
		// 临时显示
		this.renderer.fillRectUI(
			{ x: 50, y: CANVAS_HEIGHT - 200, width: CANVAS_WIDTH - 100, height: 150 },
			'rgba(0, 0, 0, 0.8)'
		);
		this.renderer.ctx.textAlign = 'left';
		this.renderer.ctx.textBaseline = 'top';
		this.renderer.fillTextUI(
			'对话内容...',
			{ x: 70, y: CANVAS_HEIGHT - 180 },
			'20px Arial',
			'#ffffff'
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
