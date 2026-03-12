// ═══════════════════════════════════════════════════════════════════════════
// 敌人坦克类
// ═══════════════════════════════════════════════════════════════════════════

import { TankEntity } from './TankEntity';
import { TANK_COLORS } from '@/data/colors';
import type { EnemyType, Vector2 } from '@/types';
import type { GameMap } from '@/core/Map';
import { distance } from '@/core/Physics';

/**
 * 敌人配置
 */
const ENEMY_CONFIGS = {
	basic: { health: 30, speed: 100, damage: 10, weapon: 'pistol' as const, score: 100 },
	fast: { health: 20, speed: 250, damage: 8, weapon: 'machinegun' as const, score: 150 },
	heavy: { health: 80, speed: 80, damage: 15, weapon: 'cannon' as const, score: 200 },
	elite: { health: 50, speed: 150, damage: 12, weapon: 'shotgun' as const, score: 250 },
};

/**
 * 敌人坦克
 */
export class Enemy extends TankEntity {
	type: EnemyType;
	scoreValue: number;
	private aiTimer: number;
	private aiState: 'idle' | 'chase' | 'attack';
	private wanderAngle: number;

	constructor(x: number, y: number, type: EnemyType, id: string) {
		const config = ENEMY_CONFIGS[type];
		super(x, y, config.health, config.speed, config.weapon, id);

		this.type = type;
		this.scoreValue = config.score;
		this.aiTimer = 0;
		this.aiState = 'idle';
		this.wanderAngle = Math.random() * Math.PI * 2;

		// 设置敌人颜色
		this.bodyColor = TANK_COLORS.enemy.body;
		this.turretColor = TANK_COLORS.enemy.turret;
		this.outlineColor = TANK_COLORS.enemy.outline;
	}

	/**
	 * AI 更新
	 */
	updateAI(dt: number, map: GameMap, playerPos: Vector2): void {
		if (!this.alive) return;

		this.aiTimer += dt;

		const dist = distance(this.getPosition(), playerPos);

		// 状态机：根据距离切换状态
		if (dist < 300) {
			this.aiState = 'attack';
		} else if (dist < 600) {
			this.aiState = 'chase';
		} else {
			this.aiState = 'idle';
		}

		// 根据状态执行行为
		switch (this.aiState) {
			case 'chase':
			case 'attack':
				this.chasePlayer(playerPos);
				break;
			case 'idle':
				// 随机游荡
				if (this.aiTimer > 2) {
					this.aiTimer = 0;
					this.wanderAngle = Math.random() * Math.PI * 2;
				}
				this.move(Math.cos(this.wanderAngle), Math.sin(this.wanderAngle));
				break;
		}

		// 瞄准玩家
		this.aimAt(playerPos.x, playerPos.y);

		// 调用基类更新
		this.update(dt, map);
	}

	/**
	 * 追踪玩家
	 */
	private chasePlayer(playerPos: Vector2): void {
		const dx = playerPos.x - this.x;
		const dy = playerPos.y - this.y;
		const dist = Math.sqrt(dx * dx + dy * dy);

		if (dist > 0) {
			this.move(dx / dist, dy / dist);
		}
	}

	/**
	 * 检查是否应该射击
	 */
	shouldFire(): boolean {
		return this.aiState === 'attack' && this.aiTimer > 0.5;
	}

	/**
	 * 重置 AI 计时器（射击后调用）
	 */
	resetAITimer(): void {
		this.aiTimer = 0;
	}

	/**
	 * 死亡回调
	 */
	protected onDeath(): void {
		console.log(`敌人 ${this.type} 死亡！`);
		// TODO: 掉落道具、粒子效果
	}
}
