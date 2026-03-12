// ═══════════════════════════════════════════════════════════════════════════
// 玩家坦克类
// ═══════════════════════════════════════════════════════════════════════════

import { TankEntity } from './TankEntity';
import { InputManager } from '@/core/InputManager';
import { TANK_COLORS } from '@/data/colors';
import type { WeaponType } from '@/types';
import type { GameMap } from '@/core/Map';
import type { Bullet } from './Bullet';

/**
 * 玩家坦克
 * 处理键盘输入、鼠标瞄准、道具收集等玩家特有功能
 */
export class Player extends TankEntity {
	score: number;

	constructor(x: number, y: number) {
		super(x, y, 100, 200, 'pistol', 'player');

		// 设置玩家颜色
		this.bodyColor = TANK_COLORS.player.body;
		this.turretColor = TANK_COLORS.player.turret;
		this.outlineColor = TANK_COLORS.player.outline;

		this.score = 0;
	}

	/**
	 * 更新（处理输入）
	 */
	updateWithInput(
		dt: number,
		map: GameMap,
		input: InputManager,
		mouseX: number,
		mouseY: number,
		bullets: Bullet[]
	): void {
		if (!this.alive) return;

		// 移动输入
		let dx = 0;
		let dy = 0;

		if (input.isKeyDown('w') || input.isKeyDown('arrowup')) {
			dy -= 1;
		}
		if (input.isKeyDown('s') || input.isKeyDown('arrowdown')) {
			dy += 1;
		}
		if (input.isKeyDown('a') || input.isKeyDown('arrowleft')) {
			dx -= 1;
		}
		if (input.isKeyDown('d') || input.isKeyDown('arrowright')) {
			dx += 1;
		}

		// 归一化移动向量
		if (dx !== 0 || dy !== 0) {
			const length = Math.sqrt(dx * dx + dy * dy);
			dx /= length;
			dy /= length;
			this.move(dx, dy);
		}

		// 鼠标瞄准
		this.aimAt(mouseX, mouseY);

		// 射击输入
		if (input.isKeyDown(' ')) {
			this.fire(bullets);
		}

		// 武器切换
		if (input.isKeyPressed('1')) this.weaponType = 'pistol';
		if (input.isKeyPressed('2')) this.weaponType = 'shotgun';
		if (input.isKeyPressed('3')) this.weaponType = 'machinegun';
		if (input.isKeyPressed('4')) this.weaponType = 'cannon';
		if (input.isKeyPressed('5')) this.weaponType = 'laser';
		if (input.isKeyPressed('6')) this.weaponType = 'minigun';

		// 调用基类更新
		this.update(dt, map);
	}

	/**
	 * 收集道具
	 */
	collectPowerUp(type: string, value?: number): void {
		switch (type) {
			case 'health':
				// 恢复生命值
				this.health = Math.min(this.health + (value || 25), this.maxHealth);
				break;
			case 'weapon':
				// 武器升级逻辑（根据 value 切换武器）
				if (value !== undefined) {
					const weapons: WeaponType[] = [
						'pistol',
						'shotgun',
						'machinegun',
						'cannon',
						'laser',
						'minigun',
					];
					if (value >= 0 && value < weapons.length) {
						this.weaponType = weapons[value];
					}
				}
				break;
			// TODO: 其他道具效果
		}
	}

	/**
	 * 增加分数
	 */
	addScore(points: number): void {
		this.score += points;
	}

	/**
	 * 死亡回调
	 */
	protected onDeath(): void {
		console.log('玩家死亡！');
		// TODO: 触发游戏结束
	}
}
