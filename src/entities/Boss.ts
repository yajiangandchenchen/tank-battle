// ═══════════════════════════════════════════════════════════════════════════
// Boss 坦克类
// ═══════════════════════════════════════════════════════════════════════════

import { TankEntity } from './TankEntity';
import { TANK_COLORS } from '@/data/colors';
import type { BossType, Vector2, WeaponType } from '@/types';
import { distance } from '@/core/Physics';
import type { GameMap } from '@/core/Map';

/**
 * Boss 配置
 */
const BOSS_CONFIGS: Record<
	BossType,
	{
		health: number;
		speed: number;
		weapon: WeaponType;
		score: number;
	}
> = {
	boss1: { health: 200, speed: 120, weapon: 'cannon', score: 1000 },
	boss2: { health: 250, speed: 180, weapon: 'shotgun', score: 1500 },
	boss3: { health: 300, speed: 100, weapon: 'machinegun', score: 2000 },
	boss4: { health: 350, speed: 150, weapon: 'minigun', score: 2500 },
	boss5: { health: 500, speed: 140, weapon: 'laser', score: 5000 },
};

/**
 * Boss 坦克
 * 每个 Boss 有独特的 AI 行为模式
 */
export class Boss extends TankEntity {
	type: BossType;
	scoreValue: number;
	private aiTimer: number;
	private phaseTimer: number;

	constructor(x: number, y: number, type: BossType, id: string) {
		const config = BOSS_CONFIGS[type];
		super(x, y, config.health, config.speed, config.weapon, id);

		this.type = type;
		this.scoreValue = config.score;
		this.aiTimer = 0;
		this.phaseTimer = 0;

		// 设置 Boss 颜色
		this.bodyColor = TANK_COLORS.boss.body;
		this.turretColor = TANK_COLORS.boss.turret;
		this.outlineColor = TANK_COLORS.boss.outline;
	}

	/**
	 * AI 更新
	 */
	updateAI(dt: number, map: GameMap, playerPos: Vector2): void {
		if (!this.alive) return;

		this.aiTimer += dt;
		this.phaseTimer += dt;

		// 根据 Boss 类型执行不同的 AI
		switch (this.type) {
			case 'boss1':
				this.boss1AI(playerPos);
				break;
			case 'boss2':
				this.boss2AI(playerPos);
				break;
			case 'boss3':
				this.boss3AI(playerPos);
				break;
			case 'boss4':
				this.boss4AI(playerPos);
				break;
			case 'boss5':
				this.boss5AI(playerPos);
				break;
		}

		// 瞄准玩家
		this.aimAt(playerPos.x, playerPos.y);

		// 调用基类更新
		this.update(dt, map);
	}

	/**
	 * Boss1 AI - 基础追击
	 * Steel Sergeant：稳定的追击战术
	 */
	private boss1AI(playerPos: Vector2): void {
		const dist = distance(this.getPosition(), playerPos);

		if (dist > 200) {
			// 追击玩家
			const dx = playerPos.x - this.x;
			const dy = playerPos.y - this.y;
			const len = Math.sqrt(dx * dx + dy * dy);
			this.move(dx / len, dy / len);
		} else {
			// 保持距离，环绕射击
			const angle = Math.atan2(playerPos.y - this.y, playerPos.x - this.x);
			const perpAngle = angle + Math.PI / 2;
			this.move(Math.cos(perpAngle), Math.sin(perpAngle));
		}
	}

	/**
	 * Boss2 AI - 快速机动
	 * Desert Viper：快速冲刺和后退战术
	 */
	private boss2AI(playerPos: Vector2): void {
		// 快速冲刺 + 后退循环
		if (this.phaseTimer < 2) {
			// 冲刺阶段
			const dx = playerPos.x - this.x;
			const dy = playerPos.y - this.y;
			const len = Math.sqrt(dx * dx + dy * dy);
			this.move(dx / len, dy / len);
		} else if (this.phaseTimer < 4) {
			// 后退阶段
			const dx = playerPos.x - this.x;
			const dy = playerPos.y - this.y;
			const len = Math.sqrt(dx * dx + dy * dy);
			this.move(-dx / len, -dy / len);
		} else {
			this.phaseTimer = 0;
		}
	}

	/**
	 * Boss3 AI - 重型坦克
	 * Frost Commander：缓慢但持续的压制
	 */
	private boss3AI(playerPos: Vector2): void {
		// 缓慢前进，持续射击
		const dx = playerPos.x - this.x;
		const dy = playerPos.y - this.y;
		const len = Math.sqrt(dx * dx + dy * dy);
		this.move((dx / len) * 0.5, (dy / len) * 0.5);
	}

	/**
	 * Boss4 AI - 复杂战术
	 * Urban Tyrant：根据距离切换战术
	 */
	private boss4AI(playerPos: Vector2): void {
		const dist = distance(this.getPosition(), playerPos);

		// 根据距离切换战术
		if (dist < 150) {
			// 近距离：后退保持距离
			const dx = playerPos.x - this.x;
			const dy = playerPos.y - this.y;
			const len = Math.sqrt(dx * dx + dy * dy);
			this.move(-dx / len, -dy / len);
		} else if (dist > 400) {
			// 远距离：追击接近
			const dx = playerPos.x - this.x;
			const dy = playerPos.y - this.y;
			const len = Math.sqrt(dx * dx + dy * dy);
			this.move(dx / len, dy / len);
		} else {
			// 中距离：环绕移动
			const angle = Math.atan2(playerPos.y - this.y, playerPos.x - this.x);
			const perpAngle = angle + (Math.PI / 2) * (this.phaseTimer % 4 < 2 ? 1 : -1);
			this.move(Math.cos(perpAngle), Math.sin(perpAngle));
		}
	}

	/**
	 * Boss5 AI - 最终 Boss
	 * General Vex：根据生命值切换战术阶段
	 */
	private boss5AI(playerPos: Vector2): void {
		// 根据生命值百分比切换战术
		const healthPercent = this.health / this.maxHealth;

		if (healthPercent > 0.66) {
			// 第一阶段：环绕射击
			this.boss1AI(playerPos);
		} else if (healthPercent > 0.33) {
			// 第二阶段：快速机动
			this.boss2AI(playerPos);
		} else {
			// 第三阶段：狂暴模式（复杂战术）
			this.boss4AI(playerPos);
		}
	}

	/**
	 * 死亡回调
	 */
	protected onDeath(): void {
		console.log(`Boss ${this.type} 被击败！获得 ${this.scoreValue} 分`);
		// TODO: 触发关卡完成、掉落奖励、粒子效果
	}
}
