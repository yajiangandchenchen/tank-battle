// ═══════════════════════════════════════════════════════════════════════════
// 道具系统
// ═══════════════════════════════════════════════════════════════════════════

import { PowerUp } from '@/entities/PowerUp';
import { POWERUP_DURATION } from '@/constants';
import type { PowerUpType, Vector2 } from '@/types';
import type { Player } from '@/entities/Player';

/**
 * 激活的道具效果
 */
interface ActiveEffect {
	type: PowerUpType;
	duration: number; // 剩余持续时间（秒）
	startTime: number; // 开始时间（用于计算进度）
}

/**
 * 道具系统
 * 管理道具生成、收集、效果应用和持续时间
 */
export class PowerUpSystem {
	powerUps: PowerUp[]; // 地图上的道具
	activeEffects: ActiveEffect[]; // 玩家身上的激活效果

	constructor() {
		this.powerUps = [];
		this.activeEffects = [];
	}

	/**
	 * 生成道具
	 */
	spawn(x: number, y: number, type: PowerUpType, value?: number): void {
		const duration = this.getDuration(type);
		const powerUp = new PowerUp(x, y, type, value, duration);
		this.powerUps.push(powerUp);
	}

	/**
	 * 随机生成道具
	 */
	spawnRandom(x: number, y: number): void {
		const type = this.getRandomType();
		const value = this.getRandomValue(type);
		this.spawn(x, y, type, value);
	}

	/**
	 * 更新系统
	 */
	update(dt: number, player: Player): void {
		// 更新道具动画
		for (const powerUp of this.powerUps) {
			powerUp.update(dt);
		}

		// 检测收集
		this.checkCollection(player);

		// 更新激活效果
		this.updateEffects(dt, player);

		// 移除死亡道具
		this.powerUps = this.powerUps.filter((p) => p.alive);
	}

	/**
	 * 检测道具收集
	 */
	private checkCollection(player: Player): void {
		for (const powerUp of this.powerUps) {
			if (!powerUp.alive) continue;

			const playerPos: Vector2 = { x: player.x, y: player.y };
			if (powerUp.collidesWith(playerPos)) {
				this.collect(powerUp, player);
			}
		}
	}

	/**
	 * 收集道具
	 */
	private collect(powerUp: PowerUp, player: Player): void {
		powerUp.collect();

		// 应用道具效果
		this.applyEffect(powerUp.type, player, powerUp.value, powerUp.duration);

		// TODO: 播放收集音效
		console.log(`收集道具: ${powerUp.type}`);
	}

	/**
	 * 应用道具效果
	 */
	private applyEffect(
		type: PowerUpType,
		player: Player,
		value?: number,
		duration?: number
	): void {
		switch (type) {
			case 'health':
				// 恢复生命值
				player.health = Math.min(player.health + (value || 25), player.maxHealth);
				break;

			case 'weapon':
				// 武器升级
				player.collectPowerUp('weapon', value);
				break;

			case 'repairKit':
				// 完全修复
				player.health = player.maxHealth;
				break;

			case 'dash':
				// 瞬发冲刺（立即执行）
				this.executeDash(player);
				break;

			case 'emp':
				// 瞬发电磁脉冲（立即执行）
				this.executeEMP(player);
				break;

			default:
				// 持续时间效果
				if (duration !== undefined && duration > 0) {
					this.addEffect(type, duration);
				}
				break;
		}
	}

	/**
	 * 添加持续效果
	 */
	private addEffect(type: PowerUpType, duration: number): void {
		// 检查是否已存在相同效果
		const existing = this.activeEffects.find((e) => e.type === type);
		if (existing) {
			// 刷新持续时间
			existing.duration = duration;
			existing.startTime = duration;
		} else {
			// 添加新效果
			this.activeEffects.push({
				type,
				duration,
				startTime: duration,
			});
		}
	}

	/**
	 * 更新激活效果
	 */
	private updateEffects(dt: number, player: Player): void {
		for (let i = this.activeEffects.length - 1; i >= 0; i--) {
			const effect = this.activeEffects[i];
			effect.duration -= dt;

			// 应用持续效果
			this.applyActiveEffect(effect, player, dt);

			// 移除过期效果
			if (effect.duration <= 0) {
				this.removeEffect(effect, player);
				this.activeEffects.splice(i, 1);
			}
		}
	}

	/**
	 * 应用持续效果（每帧调用）
	 */
	private applyActiveEffect(effect: ActiveEffect, _player: Player, _dt: number): void {
		switch (effect.type) {
			case 'timeWarp':
				// 时间扭曲：减缓敌人速度（在 Game 中处理）
				break;

			case 'reflectShield':
				// 反射护盾：反弹子弹（在碰撞检测中处理）
				break;

			case 'homingMissile':
				// 追踪导弹：子弹自动追踪（在 Bullet 中处理）
				break;

			case 'piercingRounds':
				// 穿透弹：子弹穿透敌人（在 Bullet 中处理）
				break;

			case 'splitShot':
				// 分裂弹：子弹分裂（在 Bullet 中处理）
				break;

			case 'toxicCloud':
				// 毒云：持续伤害区域（在 Game 中处理）
				break;

			case 'wallBounce':
				// 墙壁反弹：子弹反弹（在 Bullet 中处理）
				break;

			case 'gravityWell':
				// 重力井：吸引敌人（在 Game 中处理）
				break;

			case 'portal':
				// 传送门：瞬移（在 Player 中处理）
				break;

			case 'iceFloor':
				// 冰冻地板：减少摩擦力（在 Physics 中处理）
				break;

			case 'phantomWall':
				// 幻影墙：穿墙（在碰撞检测中处理）
				break;

			case 'stealth':
				// 隐身：敌人无法检测（在 Enemy AI 中处理）
				break;

			case 'shield':
				// 护盾：吸收伤害（在 TankEntity.takeDmg 中处理）
				break;

			case 'invincibility':
				// 无敌：免疫所有伤害（在 TankEntity.takeDmg 中处理）
				break;
		}
	}

	/**
	 * 移除效果（效果结束时调用）
	 */
	private removeEffect(effect: ActiveEffect, _player: Player): void {
		console.log(`效果结束: ${effect.type}`);
		// TODO: 清理效果相关状态
	}

	/**
	 * 执行冲刺
	 */
	private executeDash(player: Player): void {
		// 向玩家面向方向快速移动
		const dashDistance = 150;
		const dx = Math.cos(player.turretAngle) * dashDistance;
		const dy = Math.sin(player.turretAngle) * dashDistance;
		player.x += dx;
		player.y += dy;
		console.log('执行冲刺');
	}

	/**
	 * 执行电磁脉冲
	 */
	private executeEMP(_player: Player): void {
		// 在 Game 中处理：麻痹范围内所有敌人
		console.log('执行电磁脉冲');
	}

	/**
	 * 检查是否有激活效果
	 */
	hasEffect(type: PowerUpType): boolean {
		return this.activeEffects.some((e) => e.type === type);
	}

	/**
	 * 获取效果剩余时间
	 */
	getEffectDuration(type: PowerUpType): number {
		const effect = this.activeEffects.find((e) => e.type === type);
		return effect ? effect.duration : 0;
	}

	/**
	 * 获取效果进度（0-1）
	 */
	getEffectProgress(type: PowerUpType): number {
		const effect = this.activeEffects.find((e) => e.type === type);
		if (!effect) return 0;
		return effect.duration / effect.startTime;
	}

	/**
	 * 渲染道具
	 */
	draw(ctx: CanvasRenderingContext2D, camX: number, camY: number): void {
		for (const powerUp of this.powerUps) {
			powerUp.draw(ctx, camX, camY);
		}
	}

	/**
	 * 渲染激活效果 UI
	 */
	drawEffects(ctx: CanvasRenderingContext2D): void {
		const startX = 10;
		const startY = 100;
		const iconSize = 32;
		const spacing = 40;

		ctx.save();

		for (let i = 0; i < this.activeEffects.length; i++) {
			const effect = this.activeEffects[i];
			const x = startX;
			const y = startY + i * spacing;

			// 绘制背景
			ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
			ctx.fillRect(x, y, iconSize + 60, iconSize);

			// 绘制图标（简化版）
			ctx.fillStyle = this.getEffectColor(effect.type);
			ctx.fillRect(x + 2, y + 2, iconSize - 4, iconSize - 4);

			// 绘制进度条
			const progress = this.getEffectProgress(effect.type);
			const barWidth = 50;
			const barHeight = 6;
			const barX = x + iconSize + 5;
			const barY = y + iconSize / 2 - barHeight / 2;

			ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
			ctx.fillRect(barX, barY, barWidth, barHeight);

			ctx.fillStyle = this.getEffectColor(effect.type);
			ctx.fillRect(barX, barY, barWidth * progress, barHeight);

			// 绘制剩余时间
			ctx.fillStyle = '#fff';
			ctx.font = '10px Arial';
			ctx.textAlign = 'center';
			ctx.fillText(
				Math.ceil(effect.duration).toString(),
				barX + barWidth / 2,
				barY + barHeight + 10
			);
		}

		ctx.restore();
	}

	/**
	 * 获取效果颜色
	 */
	private getEffectColor(type: PowerUpType): string {
		switch (type) {
			case 'reflectShield':
			case 'shield':
				return '#00ffff';
			case 'timeWarp':
				return '#ff00ff';
			case 'homingMissile':
				return '#ff6600';
			case 'piercingRounds':
				return '#00ff00';
			case 'splitShot':
				return '#ff9900';
			case 'toxicCloud':
				return '#00ff00';
			case 'wallBounce':
				return '#00ccff';
			case 'gravityWell':
				return '#9900ff';
			case 'portal':
				return '#0099ff';
			case 'iceFloor':
				return '#aaffff';
			case 'phantomWall':
				return '#cc99ff';
			case 'stealth':
				return '#666666';
			case 'invincibility':
				return '#ffff00';
			default:
				return '#ffffff';
		}
	}

	/**
	 * 获取道具持续时间
	 */
	private getDuration(type: PowerUpType): number | undefined {
		if (type === 'health' || type === 'weapon') {
			return undefined; // 永久效果
		}
		return POWERUP_DURATION[type as keyof typeof POWERUP_DURATION];
	}

	/**
	 * 获取随机道具类型
	 */
	private getRandomType(): PowerUpType {
		const types: PowerUpType[] = [
			'health',
			'weapon',
			'reflectShield',
			'timeWarp',
			'emp',
			'homingMissile',
			'piercingRounds',
			'splitShot',
			'toxicCloud',
			'wallBounce',
			'gravityWell',
			'portal',
			'iceFloor',
			'phantomWall',
			'stealth',
			'shield',
			'dash',
			'repairKit',
			'invincibility',
		];

		// 权重系统：常见道具权重更高
		const weights: Record<PowerUpType, number> = {
			health: 20,
			weapon: 15,
			reflectShield: 5,
			timeWarp: 5,
			emp: 3,
			homingMissile: 8,
			piercingRounds: 8,
			splitShot: 8,
			toxicCloud: 5,
			wallBounce: 6,
			gravityWell: 4,
			portal: 3,
			iceFloor: 5,
			phantomWall: 4,
			stealth: 6,
			shield: 10,
			dash: 7,
			repairKit: 10,
			invincibility: 2,
		};

		const totalWeight = Object.values(weights).reduce((sum, w) => sum + w, 0);
		let random = Math.random() * totalWeight;

		for (const type of types) {
			random -= weights[type];
			if (random <= 0) {
				return type;
			}
		}

		return 'health'; // 默认返回生命值
	}

	/**
	 * 获取随机道具数值
	 */
	private getRandomValue(type: PowerUpType): number | undefined {
		switch (type) {
			case 'health':
				return 25 + Math.floor(Math.random() * 26); // 25-50
			case 'weapon':
				return Math.floor(Math.random() * 6); // 0-5（武器索引）
			default:
				return undefined;
		}
	}

	/**
	 * 清空所有道具
	 */
	clear(): void {
		this.powerUps = [];
		this.activeEffects = [];
	}
}
