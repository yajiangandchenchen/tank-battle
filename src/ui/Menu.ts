// ═══════════════════════════════════════════════════════════════════════════
// 菜单系统
// ═══════════════════════════════════════════════════════════════════════════

import { CANVAS_WIDTH, CANVAS_HEIGHT } from '@/constants';

/**
 * 菜单按钮
 */
interface MenuButton {
	text: string;
	x: number;
	y: number;
	width: number;
	height: number;
	action: () => void;
	hovered?: boolean;
}

/**
 * 菜单渲染器
 * 处理主菜单、暂停菜单、关卡完成、游戏结束等界面
 */
export class Menu {
	private ctx: CanvasRenderingContext2D;
	private buttons: MenuButton[] = [];

	constructor(ctx: CanvasRenderingContext2D) {
		this.ctx = ctx;
	}

	/**
	 * 添加按钮
	 */
	private addButton(button: MenuButton): void {
		this.buttons.push(button);
	}

	/**
	 * 渲染所有按钮
	 */
	private renderButtons(): void {
		const ctx = this.ctx;

		for (const button of this.buttons) {
			// 按钮背景
			ctx.fillStyle = button.hovered ? '#3b82f6' : '#1e40af';
			ctx.fillRect(button.x, button.y, button.width, button.height);

			// 按钮边框
			ctx.strokeStyle = button.hovered ? '#60a5fa' : '#3b82f6';
			ctx.lineWidth = 2;
			ctx.strokeRect(button.x, button.y, button.width, button.height);

			// 按钮文字
			ctx.fillStyle = '#ffffff';
			ctx.font = 'bold 24px Arial';
			ctx.textAlign = 'center';
			ctx.textBaseline = 'middle';
			ctx.fillText(
				button.text,
				button.x + button.width / 2,
				button.y + button.height / 2
			);
		}
	}

	/**
	 * 处理鼠标移动（用于按钮悬停效果）
	 */
	handleMouseMove(x: number, y: number): void {
		for (const button of this.buttons) {
			const isHovered =
				x >= button.x &&
				x <= button.x + button.width &&
				y >= button.y &&
				y <= button.y + button.height;

			button.hovered = isHovered;
		}
	}

	/**
	 * 处理鼠标点击
	 */
	handleClick(x: number, y: number): void {
		for (const button of this.buttons) {
			if (
				x >= button.x &&
				x <= button.x + button.width &&
				y >= button.y &&
				y <= button.y + button.height
			) {
				button.action();
				break;
			}
		}
	}

	/**
	 * 渲染主菜单
	 */
	renderMainMenu(callbacks: {
		onStart: () => void;
		onHelp?: () => void;
	}): void {
		const ctx = this.ctx;

		// 半透明背景
		ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
		ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

		// 游戏标题
		ctx.fillStyle = '#fbbf24';
		ctx.font = 'bold 72px Arial';
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillText('坦克大战', CANVAS_WIDTH / 2, 150);

		// 副标题
		ctx.fillStyle = '#94a3b8';
		ctx.font = '24px Arial';
		ctx.fillText('Tank Battle', CANVAS_WIDTH / 2, 220);

		// 创建按钮
		this.buttons = [];

		// 开始游戏按钮
		this.addButton({
			text: '开始游戏',
			x: CANVAS_WIDTH / 2 - 120,
			y: 320,
			width: 240,
			height: 60,
			action: callbacks.onStart,
		});

		// 帮助按钮（可选）
		if (callbacks.onHelp) {
			this.addButton({
				text: '游戏帮助',
				x: CANVAS_WIDTH / 2 - 120,
				y: 400,
				width: 240,
				height: 60,
				action: callbacks.onHelp,
			});
		}

		// 渲染所有按钮
		this.renderButtons();

		// 操作提示
		ctx.fillStyle = '#64748b';
		ctx.font = '16px Arial';
		ctx.textAlign = 'center';
		ctx.fillText('WASD 移动 | 鼠标瞄准 | 左键射击', CANVAS_WIDTH / 2, 550);
		ctx.fillText('空格键 推进对话 | ESC 暂停', CANVAS_WIDTH / 2, 580);
	}

	/**
	 * 渲染暂停菜单
	 */
	renderPauseMenu(callbacks: {
		onResume: () => void;
		onRestart: () => void;
		onMainMenu: () => void;
	}): void {
		const ctx = this.ctx;

		// 半透明背景
		ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
		ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

		// 暂停标题
		ctx.fillStyle = '#60a5fa';
		ctx.font = 'bold 56px Arial';
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillText('游戏暂停', CANVAS_WIDTH / 2, 180);

		// 创建按钮
		this.buttons = [];

		// 继续游戏按钮
		this.addButton({
			text: '继续游戏',
			x: CANVAS_WIDTH / 2 - 120,
			y: 280,
			width: 240,
			height: 60,
			action: callbacks.onResume,
		});

		// 重新开始按钮
		this.addButton({
			text: '重新开始',
			x: CANVAS_WIDTH / 2 - 120,
			y: 360,
			width: 240,
			height: 60,
			action: callbacks.onRestart,
		});

		// 返回主菜单按钮
		this.addButton({
			text: '返回主菜单',
			x: CANVAS_WIDTH / 2 - 120,
			y: 440,
			width: 240,
			height: 60,
			action: callbacks.onMainMenu,
		});

		// 渲染所有按钮
		this.renderButtons();
	}

	/**
	 * 渲染关卡完成界面
	 */
	renderLevelComplete(
		level: number,
		score: number,
		callbacks: {
			onNextLevel: () => void;
			onMainMenu: () => void;
		}
	): void {
		const ctx = this.ctx;

		// 半透明背景
		ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
		ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

		// 完成标题
		ctx.fillStyle = '#4ade80';
		ctx.font = 'bold 64px Arial';
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillText('关卡完成！', CANVAS_WIDTH / 2, 150);

		// 关卡信息
		ctx.fillStyle = '#ffffff';
		ctx.font = '28px Arial';
		ctx.fillText(`第 ${level + 1} 关`, CANVAS_WIDTH / 2, 220);

		// 分数
		ctx.fillStyle = '#fbbf24';
		ctx.font = 'bold 32px Arial';
		ctx.fillText(`分数: ${score}`, CANVAS_WIDTH / 2, 280);

		// 创建按钮
		this.buttons = [];

		// 下一关按钮
		this.addButton({
			text: '下一关',
			x: CANVAS_WIDTH / 2 - 120,
			y: 360,
			width: 240,
			height: 60,
			action: callbacks.onNextLevel,
		});

		// 返回主菜单按钮
		this.addButton({
			text: '返回主菜单',
			x: CANVAS_WIDTH / 2 - 120,
			y: 440,
			width: 240,
			height: 60,
			action: callbacks.onMainMenu,
		});

		// 渲染所有按钮
		this.renderButtons();
	}

	/**
	 * 渲染游戏结束界面
	 */
	renderGameOver(
		score: number,
		callbacks: {
			onRestart: () => void;
			onMainMenu: () => void;
		}
	): void {
		const ctx = this.ctx;

		// 半透明背景
		ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
		ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

		// 游戏结束标题
		ctx.fillStyle = '#ef4444';
		ctx.font = 'bold 64px Arial';
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillText('游戏结束', CANVAS_WIDTH / 2, 150);

		// 分数
		ctx.fillStyle = '#fbbf24';
		ctx.font = 'bold 32px Arial';
		ctx.fillText(`最终分数: ${score}`, CANVAS_WIDTH / 2, 240);

		// 创建按钮
		this.buttons = [];

		// 重新开始按钮
		this.addButton({
			text: '重新开始',
			x: CANVAS_WIDTH / 2 - 120,
			y: 340,
			width: 240,
			height: 60,
			action: callbacks.onRestart,
		});

		// 返回主菜单按钮
		this.addButton({
			text: '返回主菜单',
			x: CANVAS_WIDTH / 2 - 120,
			y: 420,
			width: 240,
			height: 60,
			action: callbacks.onMainMenu,
		});

		// 渲染所有按钮
		this.renderButtons();
	}

	/**
	 * 渲染游戏胜利界面
	 */
	renderVictory(
		score: number,
		callbacks: {
			onRestart: () => void;
			onMainMenu: () => void;
		}
	): void {
		const ctx = this.ctx;

		// 半透明背景
		ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
		ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

		// 胜利标题
		ctx.fillStyle = '#fbbf24';
		ctx.font = 'bold 72px Arial';
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillText('胜利！', CANVAS_WIDTH / 2, 120);

		// 副标题
		ctx.fillStyle = '#4ade80';
		ctx.font = '32px Arial';
		ctx.fillText('你拯救了公主！', CANVAS_WIDTH / 2, 190);

		// 分数
		ctx.fillStyle = '#ffffff';
		ctx.font = 'bold 36px Arial';
		ctx.fillText(`最终分数: ${score}`, CANVAS_WIDTH / 2, 270);

		// 创建按钮
		this.buttons = [];

		// 重新开始按钮
		this.addButton({
			text: '再玩一次',
			x: CANVAS_WIDTH / 2 - 120,
			y: 360,
			width: 240,
			height: 60,
			action: callbacks.onRestart,
		});

		// 返回主菜单按钮
		this.addButton({
			text: '返回主菜单',
			x: CANVAS_WIDTH / 2 - 120,
			y: 440,
			width: 240,
			height: 60,
			action: callbacks.onMainMenu,
		});

		// 渲染所有按钮
		this.renderButtons();
	}

}
