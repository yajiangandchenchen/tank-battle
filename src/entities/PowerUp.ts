// ═══════════════════════════════════════════════════════════════════════════
// 道具实体类
// ═══════════════════════════════════════════════════════════════════════════

import type { PowerUpType, Vector2 } from '@/types';

/**
 * 道具实体
 * 表示地图上可收集的道具
 */
export class PowerUp {
	x: number;
	y: number;
	type: PowerUpType;
	value?: number; // 数值（如生命值恢复量、武器索引）
	duration?: number; // 持续时间（秒），undefined 表示永久或瞬发
	alive: boolean;
	radius: number; // 碰撞半径
	rotation: number; // 旋转角度（用于动画）
	bobOffset: number; // 上下浮动偏移
	bobPhase: number; // 浮动相位

	constructor(x: number, y: number, type: PowerUpType, value?: number, duration?: number) {
		this.x = x;
		this.y = y;
		this.type = type;
		this.value = value;
		this.duration = duration;
		this.alive = true;
		this.radius = 16; // 道具碰撞半径
		this.rotation = 0;
		this.bobOffset = 0;
		this.bobPhase = Math.random() * Math.PI * 2; // 随机初始相位
	}

	/**
	 * 更新道具动画
	 */
	update(dt: number): void {
		if (!this.alive) return;

		// 旋转动画
		this.rotation += dt * 2;
		if (this.rotation > Math.PI * 2) {
			this.rotation -= Math.PI * 2;
		}

		// 上下浮动动画
		this.bobPhase += dt * 3;
		this.bobOffset = Math.sin(this.bobPhase) * 4;
	}

	/**
	 * 检测与点的碰撞
	 */
	collidesWith(point: Vector2): boolean {
		if (!this.alive) return false;
		const dx = point.x - this.x;
		const dy = point.y - this.y;
		const distSq = dx * dx + dy * dy;
		return distSq < this.radius * this.radius;
	}

	/**
	 * 收集道具
	 */
	collect(): void {
		this.alive = false;
	}

	/**
	 * 渲染道具
	 */
	draw(ctx: CanvasRenderingContext2D, camX: number, camY: number): void {
		if (!this.alive) return;

		const screenX = this.x - camX;
		const screenY = this.y - camY + this.bobOffset;

		ctx.save();
		ctx.translate(screenX, screenY);
		ctx.rotate(this.rotation);

		// 根据道具类型绘制不同的图标
		this.drawIcon(ctx);

		ctx.restore();

		// 绘制光晕效果
		this.drawGlow(ctx, screenX, screenY);
	}

	/**
	 * 绘制道具图标
	 */
	private drawIcon(ctx: CanvasRenderingContext2D): void {
		const size = 24;

		switch (this.type) {
			case 'health':
				// 红十字
				ctx.fillStyle = '#ff3333';
				ctx.fillRect(-size / 6, -size / 2, size / 3, size);
				ctx.fillRect(-size / 2, -size / 6, size, size / 3);
				break;

			case 'weapon':
				// 武器箱
				ctx.fillStyle = '#ffaa00';
				ctx.fillRect(-size / 2, -size / 2, size, size);
				ctx.strokeStyle = '#000';
				ctx.lineWidth = 2;
				ctx.strokeRect(-size / 2, -size / 2, size, size);
				break;

			case 'reflectShield':
				// 反射盾牌
				ctx.strokeStyle = '#00ffff';
				ctx.lineWidth = 3;
				ctx.beginPath();
				ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
				ctx.stroke();
				ctx.beginPath();
				ctx.moveTo(-size / 4, 0);
				ctx.lineTo(size / 4, 0);
				ctx.moveTo(0, -size / 4);
				ctx.lineTo(0, size / 4);
				ctx.stroke();
				break;

			case 'timeWarp':
				// 时间扭曲（时钟）
				ctx.strokeStyle = '#ff00ff';
				ctx.lineWidth = 2;
				ctx.beginPath();
				ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
				ctx.stroke();
				ctx.beginPath();
				ctx.moveTo(0, 0);
				ctx.lineTo(0, -size / 3);
				ctx.moveTo(0, 0);
				ctx.lineTo(size / 4, 0);
				ctx.stroke();
				break;

			case 'emp':
				// 电磁脉冲（闪电）
				ctx.strokeStyle = '#ffff00';
				ctx.lineWidth = 3;
				ctx.beginPath();
				ctx.moveTo(-size / 4, -size / 2);
				ctx.lineTo(0, 0);
				ctx.lineTo(-size / 6, 0);
				ctx.lineTo(size / 4, size / 2);
				ctx.stroke();
				break;

			case 'homingMissile':
				// 追踪导弹
				ctx.fillStyle = '#ff6600';
				ctx.beginPath();
				ctx.moveTo(size / 2, 0);
				ctx.lineTo(-size / 2, -size / 4);
				ctx.lineTo(-size / 2, size / 4);
				ctx.closePath();
				ctx.fill();
				break;

			case 'piercingRounds':
				// 穿透弹
				ctx.strokeStyle = '#00ff00';
				ctx.lineWidth = 3;
				ctx.beginPath();
				ctx.moveTo(-size / 2, 0);
				ctx.lineTo(size / 2, 0);
				ctx.moveTo(size / 4, -size / 4);
				ctx.lineTo(size / 2, 0);
				ctx.lineTo(size / 4, size / 4);
				ctx.stroke();
				break;

			case 'splitShot':
				// 分裂弹
				ctx.fillStyle = '#ff9900';
				for (let i = 0; i < 3; i++) {
					const angle = (i * Math.PI * 2) / 3;
					const x = Math.cos(angle) * size / 3;
					const y = Math.sin(angle) * size / 3;
					ctx.beginPath();
					ctx.arc(x, y, size / 6, 0, Math.PI * 2);
					ctx.fill();
				}
				break;

			case 'toxicCloud':
				// 毒云
				ctx.fillStyle = '#00ff00';
				ctx.globalAlpha = 0.6;
				for (let i = 0; i < 4; i++) {
					const angle = (i * Math.PI * 2) / 4 + this.rotation;
					const x = Math.cos(angle) * size / 4;
					const y = Math.sin(angle) * size / 4;
					ctx.beginPath();
					ctx.arc(x, y, size / 4, 0, Math.PI * 2);
					ctx.fill();
				}
				ctx.globalAlpha = 1;
				break;

			case 'wallBounce':
				// 墙壁反弹
				ctx.strokeStyle = '#00ccff';
				ctx.lineWidth = 2;
				ctx.beginPath();
				ctx.moveTo(-size / 2, -size / 2);
				ctx.lineTo(size / 2, -size / 2);
				ctx.lineTo(size / 2, size / 2);
				ctx.moveTo(0, -size / 4);
				ctx.lineTo(size / 4, 0);
				ctx.lineTo(0, size / 4);
				ctx.stroke();
				break;

			case 'gravityWell':
				// 重力井
				ctx.strokeStyle = '#9900ff';
				ctx.lineWidth = 2;
				for (let i = 1; i <= 3; i++) {
					ctx.beginPath();
					ctx.arc(0, 0, (size / 2) * (i / 3), 0, Math.PI * 2);
					ctx.stroke();
				}
				break;

			case 'portal':
				// 传送门
				ctx.strokeStyle = '#0099ff';
				ctx.lineWidth = 3;
				ctx.beginPath();
				ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
				ctx.stroke();
				ctx.fillStyle = '#0099ff';
				ctx.globalAlpha = 0.3;
				ctx.beginPath();
				ctx.arc(0, 0, size / 3, 0, Math.PI * 2);
				ctx.fill();
				ctx.globalAlpha = 1;
				break;

			case 'iceFloor':
				// 冰冻地板
				ctx.strokeStyle = '#aaffff';
				ctx.lineWidth = 2;
				ctx.beginPath();
				ctx.moveTo(-size / 2, -size / 4);
				ctx.lineTo(size / 2, -size / 4);
				ctx.moveTo(-size / 2, size / 4);
				ctx.lineTo(size / 2, size / 4);
				ctx.moveTo(-size / 4, -size / 2);
				ctx.lineTo(-size / 4, size / 2);
				ctx.moveTo(size / 4, -size / 2);
				ctx.lineTo(size / 4, size / 2);
				ctx.stroke();
				break;

			case 'phantomWall':
				// 幻影墙
				ctx.strokeStyle = '#cc99ff';
				ctx.lineWidth = 2;
				ctx.globalAlpha = 0.5;
				ctx.strokeRect(-size / 2, -size / 2, size, size);
				ctx.beginPath();
				ctx.moveTo(-size / 2, -size / 2);
				ctx.lineTo(size / 2, size / 2);
				ctx.moveTo(size / 2, -size / 2);
				ctx.lineTo(-size / 2, size / 2);
				ctx.stroke();
				ctx.globalAlpha = 1;
				break;

			case 'stealth':
				// 隐身
				ctx.strokeStyle = '#666666';
				ctx.lineWidth = 2;
				ctx.globalAlpha = 0.4;
				ctx.beginPath();
				ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
				ctx.stroke();
				ctx.globalAlpha = 1;
				break;

			case 'shield':
				// 护盾
				ctx.strokeStyle = '#00aaff';
				ctx.lineWidth = 3;
				ctx.beginPath();
				ctx.moveTo(0, -size / 2);
				ctx.lineTo(-size / 2, size / 4);
				ctx.lineTo(0, size / 2);
				ctx.lineTo(size / 2, size / 4);
				ctx.closePath();
				ctx.stroke();
				break;

			case 'dash':
				// 冲刺
				ctx.strokeStyle = '#ffcc00';
				ctx.lineWidth = 3;
				ctx.beginPath();
				ctx.moveTo(-size / 2, -size / 4);
				ctx.lineTo(size / 2, 0);
				ctx.lineTo(-size / 2, size / 4);
				ctx.stroke();
				break;

			case 'repairKit':
				// 修理包
				ctx.fillStyle = '#00ff00';
				ctx.fillRect(-size / 2, -size / 2, size, size);
				ctx.fillStyle = '#fff';
				ctx.font = 'bold 16px Arial';
				ctx.textAlign = 'center';
				ctx.textBaseline = 'middle';
				ctx.fillText('R', 0, 0);
				break;

			case 'invincibility':
				// 无敌
				ctx.strokeStyle = '#ffff00';
				ctx.lineWidth = 3;
				ctx.beginPath();
				for (let i = 0; i < 5; i++) {
					const angle = (i * Math.PI * 2) / 5 - Math.PI / 2;
					const x = Math.cos(angle) * size / 2;
					const y = Math.sin(angle) * size / 2;
					if (i === 0) {
						ctx.moveTo(x, y);
					} else {
						ctx.lineTo(x, y);
					}
				}
				ctx.closePath();
				ctx.stroke();
				break;
		}
	}

	/**
	 * 绘制光晕效果
	 */
	private drawGlow(ctx: CanvasRenderingContext2D, x: number, y: number): void {
		const gradient = ctx.createRadialGradient(x, y, 0, x, y, 30);
		gradient.addColorStop(0, this.getGlowColor());
		gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

		ctx.fillStyle = gradient;
		ctx.globalAlpha = 0.3;
		ctx.beginPath();
		ctx.arc(x, y, 30, 0, Math.PI * 2);
		ctx.fill();
		ctx.globalAlpha = 1;
	}

	/**
	 * 获取光晕颜色
	 */
	private getGlowColor(): string {
		switch (this.type) {
			case 'health':
			case 'repairKit':
				return 'rgba(255, 51, 51, 0.5)';
			case 'weapon':
				return 'rgba(255, 170, 0, 0.5)';
			case 'reflectShield':
			case 'shield':
				return 'rgba(0, 255, 255, 0.5)';
			case 'timeWarp':
				return 'rgba(255, 0, 255, 0.5)';
			case 'emp':
			case 'invincibility':
				return 'rgba(255, 255, 0, 0.5)';
			case 'homingMissile':
				return 'rgba(255, 102, 0, 0.5)';
			case 'piercingRounds':
			case 'toxicCloud':
				return 'rgba(0, 255, 0, 0.5)';
			case 'splitShot':
				return 'rgba(255, 153, 0, 0.5)';
			case 'wallBounce':
			case 'portal':
				return 'rgba(0, 153, 255, 0.5)';
			case 'gravityWell':
			case 'phantomWall':
				return 'rgba(153, 0, 255, 0.5)';
			case 'iceFloor':
				return 'rgba(170, 255, 255, 0.5)';
			case 'stealth':
				return 'rgba(102, 102, 102, 0.5)';
			case 'dash':
				return 'rgba(255, 204, 0, 0.5)';
			default:
				return 'rgba(255, 255, 255, 0.5)';
		}
	}
}
