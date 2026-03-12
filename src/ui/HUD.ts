// ═══════════════════════════════════════════════════════════════════════════
// HUD（抬头显示）系统
// ═══════════════════════════════════════════════════════════════════════════

import { CANVAS_WIDTH } from '@/constants';
import type { WeaponType } from '@/types';

/**
 * HUD 渲染器
 * 显示玩家生命值、武器、分数、关卡信息等
 */
export class HUD {
	private ctx: CanvasRenderingContext2D;

	constructor(ctx: CanvasRenderingContext2D) {
		this.ctx = ctx;
	}

	/**
	 * 渲染完整的 HUD
	 */
	render(data: {
		health: number;
		maxHealth: number;
		weapon: WeaponType;
		score: number;
		level: number;
		levelName: string;
		enemiesLeft: number;
		bossHealth?: number;
		bossMaxHealth?: number;
		bossName?: string;
	}): void {
		// 渲染生命值条
		this.renderHealthBar(data.health, data.maxHealth);

		// 渲染武器信息
		this.renderWeaponInfo(data.weapon);

		// 渲染分数
		this.renderScore(data.score);

		// 渲染关卡信息
		this.renderLevelInfo(data.level, data.levelName, data.enemiesLeft);

		// 渲染 Boss 血条（如果存在）
		if (data.bossHealth !== undefined && data.bossMaxHealth !== undefined) {
			this.renderBossHealthBar(
				data.bossHealth,
				data.bossMaxHealth,
				data.bossName || 'Boss'
			);
		}
	}

	/**
	 * 渲染生命值条
	 */
	private renderHealthBar(health: number, maxHealth: number): void {
		const ctx = this.ctx;
		const x = 20;
		const y = 20;
		const width = 200;
		const height = 24;

		// 计算生命值百分比
		const healthPercent = Math.max(0, Math.min(1, health / maxHealth));

		// 背景
		ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
		ctx.fillRect(x - 2, y - 2, width + 4, height + 4);

		// 生命值条背景
		ctx.fillStyle = '#2a2a2a';
		ctx.fillRect(x, y, width, height);

		// 生命值条（根据百分比改变颜色）
		if (healthPercent > 0.6) {
			ctx.fillStyle = '#4ade80'; // 绿色
		} else if (healthPercent > 0.3) {
			ctx.fillStyle = '#fbbf24'; // 黄色
		} else {
			ctx.fillStyle = '#ef4444'; // 红色
		}
		ctx.fillRect(x, y, width * healthPercent, height);

		// 边框
		ctx.strokeStyle = '#ffffff';
		ctx.lineWidth = 2;
		ctx.strokeRect(x, y, width, height);

		// 文字
		ctx.fillStyle = '#ffffff';
		ctx.font = 'bold 14px Arial';
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillText(
			`生命值: ${Math.ceil(health)}/${maxHealth}`,
			x + width / 2,
			y + height / 2
		);
	}

	/**
	 * 渲染武器信息
	 */
	private renderWeaponInfo(weapon: WeaponType): void {
		const ctx = this.ctx;
		const x = 20;
		const y = 60;
		const width = 200;
		const height = 40;

		// 武器名称映射
		const weaponNames: Record<WeaponType, string> = {
			pistol: '手枪',
			shotgun: '霰弹枪',
			machinegun: '机枪',
			cannon: '火炮',
			laser: '激光',
			minigun: '加特林',
		};

		// 背景
		ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
		ctx.fillRect(x - 2, y - 2, width + 4, height + 4);

		// 武器图标背景
		ctx.fillStyle = '#1e293b';
		ctx.fillRect(x, y, height, height);

		// 武器图标（简单的图形表示）
		ctx.fillStyle = '#60a5fa';
		this.drawWeaponIcon(ctx, x + height / 2, y + height / 2, weapon);

		// 武器名称
		ctx.fillStyle = '#ffffff';
		ctx.font = 'bold 16px Arial';
		ctx.textAlign = 'left';
		ctx.textBaseline = 'middle';
		ctx.fillText(weaponNames[weapon], x + height + 10, y + height / 2);

		// 边框
		ctx.strokeStyle = '#ffffff';
		ctx.lineWidth = 2;
		ctx.strokeRect(x, y, width, height);
	}

	/**
	 * 绘制武器图标
	 */
	private drawWeaponIcon(
		ctx: CanvasRenderingContext2D,
		x: number,
		y: number,
		weapon: WeaponType
	): void {
		ctx.save();
		ctx.translate(x, y);

		switch (weapon) {
			case 'pistol':
				// 手枪：简单矩形
				ctx.fillRect(-8, -3, 16, 6);
				break;
			case 'shotgun':
				// 霰弹枪：粗短矩形
				ctx.fillRect(-10, -4, 20, 8);
				break;
			case 'machinegun':
				// 机枪：细长矩形
				ctx.fillRect(-12, -2, 24, 4);
				break;
			case 'cannon':
				// 火炮：粗长矩形
				ctx.fillRect(-14, -5, 28, 10);
				break;
			case 'laser':
				// 激光：发光线条
				ctx.strokeStyle = '#60a5fa';
				ctx.lineWidth = 3;
				ctx.beginPath();
				ctx.moveTo(-12, 0);
				ctx.lineTo(12, 0);
				ctx.stroke();
				break;
			case 'minigun':
				// 加特林：多管
				ctx.fillRect(-10, -4, 20, 2);
				ctx.fillRect(-10, 0, 20, 2);
				ctx.fillRect(-10, 4, 20, 2);
				break;
		}

		ctx.restore();
	}

	/**
	 * 渲染分数
	 */
	private renderScore(score: number): void {
		const ctx = this.ctx;
		const x = CANVAS_WIDTH - 220;
		const y = 20;
		const width = 200;
		const height = 40;

		// 背景
		ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
		ctx.fillRect(x - 2, y - 2, width + 4, height + 4);

		// 内容背景
		ctx.fillStyle = '#1e293b';
		ctx.fillRect(x, y, width, height);

		// 分数文字
		ctx.fillStyle = '#fbbf24';
		ctx.font = 'bold 20px Arial';
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillText(`分数: ${score}`, x + width / 2, y + height / 2);

		// 边框
		ctx.strokeStyle = '#ffffff';
		ctx.lineWidth = 2;
		ctx.strokeRect(x, y, width, height);
	}

	/**
	 * 渲染关卡信息
	 */
	private renderLevelInfo(
		level: number,
		levelName: string,
		enemiesLeft: number
	): void {
		const ctx = this.ctx;
		const x = CANVAS_WIDTH - 220;
		const y = 70;
		const width = 200;
		const height = 60;

		// 背景
		ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
		ctx.fillRect(x - 2, y - 2, width + 4, height + 4);

		// 内容背景
		ctx.fillStyle = '#1e293b';
		ctx.fillRect(x, y, width, height);

		// 关卡标题
		ctx.fillStyle = '#60a5fa';
		ctx.font = 'bold 16px Arial';
		ctx.textAlign = 'center';
		ctx.textBaseline = 'top';
		ctx.fillText(`第 ${level + 1} 关: ${levelName}`, x + width / 2, y + 8);

		// 敌人数量
		ctx.fillStyle = '#ffffff';
		ctx.font = '14px Arial';
		ctx.textBaseline = 'bottom';
		ctx.fillText(`剩余敌人: ${enemiesLeft}`, x + width / 2, y + height - 8);

		// 边框
		ctx.strokeStyle = '#ffffff';
		ctx.lineWidth = 2;
		ctx.strokeRect(x, y, width, height);
	}

	/**
	 * 渲染 Boss 血条
	 */
	private renderBossHealthBar(
		health: number,
		maxHealth: number,
		bossName: string
	): void {
		const ctx = this.ctx;
		const x = CANVAS_WIDTH / 2 - 200;
		const y = 20;
		const width = 400;
		const height = 40;

		// 计算生命值百分比
		const healthPercent = Math.max(0, Math.min(1, health / maxHealth));

		// 背景
		ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
		ctx.fillRect(x - 4, y - 4, width + 8, height + 8);

		// Boss 名称背景
		ctx.fillStyle = '#7c2d12';
		ctx.fillRect(x, y, width, 20);

		// Boss 名称
		ctx.fillStyle = '#fbbf24';
		ctx.font = 'bold 14px Arial';
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillText(bossName, x + width / 2, y + 10);

		// 生命值条背景
		ctx.fillStyle = '#2a2a2a';
		ctx.fillRect(x, y + 20, width, 20);

		// 生命值条
		ctx.fillStyle = '#dc2626';
		ctx.fillRect(x, y + 20, width * healthPercent, 20);

		// 生命值文字
		ctx.fillStyle = '#ffffff';
		ctx.font = 'bold 12px Arial';
		ctx.fillText(
			`${Math.ceil(health)} / ${maxHealth}`,
			x + width / 2,
			y + 30
		);

		// 边框
		ctx.strokeStyle = '#fbbf24';
		ctx.lineWidth = 3;
		ctx.strokeRect(x, y, width, height);
	}
}

