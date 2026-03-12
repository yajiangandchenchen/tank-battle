// ═══════════════════════════════════════════════════════════════════════════
// 坦克实体基类
// ═══════════════════════════════════════════════════════════════════════════

import type { Vector2, WeaponType, WeaponConfig } from '@/types';
import { TANK_WIDTH, TANK_HEIGHT, FRICTION, MAX_VELOCITY } from '@/constants';
import { WEAPONS } from '@/data/weapons';
import { Renderer } from '@/core/Renderer';
import { GameMap } from '@/core/Map';
import { Bullet } from './Bullet';

/**
 * 坦克实体基类
 * 提供移动、射击、受伤、死亡等基础功能
 */
export abstract class TankEntity {
	x: number;
	y: number;
	vx: number;
	vy: number;
	angle: number; // 车身角度
	turretAngle: number; // 炮塔角度
	health: number;
	maxHealth: number;
	speed: number;
	weaponType: WeaponType;
	fireTimer: number;
	alive: boolean;
	id: string;

	// 颜色配置
	protected bodyColor: string;
	protected turretColor: string;
	protected outlineColor: string;

	constructor(
		x: number,
		y: number,
		health: number,
		speed: number,
		weaponType: WeaponType,
		id: string
	) {
		this.x = x;
		this.y = y;
		this.vx = 0;
		this.vy = 0;
		this.angle = 0;
		this.turretAngle = 0;
		this.health = health;
		this.maxHealth = health;
		this.speed = speed;
		this.weaponType = weaponType;
		this.fireTimer = 0;
		this.alive = true;
		this.id = id;

		// 默认颜色
		this.bodyColor = '#888888';
		this.turretColor = '#666666';
		this.outlineColor = '#444444';
	}

	/**
	 * 更新
	 */
	update(dt: number, map: GameMap): void {
		if (!this.alive) return;

		// 更新射击冷却
		if (this.fireTimer > 0) {
			this.fireTimer -= dt;
		}

		// 应用摩擦力
		this.vx *= FRICTION;
		this.vy *= FRICTION;

		// 限制最大速度
		const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
		if (speed > MAX_VELOCITY) {
			this.vx = (this.vx / speed) * MAX_VELOCITY;
			this.vy = (this.vy / speed) * MAX_VELOCITY;
		}

		// 保存旧位置
		const oldX = this.x;
		const oldY = this.y;

		// 更新位置
		this.x += this.vx * dt;
		this.y += this.vy * dt;

		// 检查地图碰撞
		if (map.checkCollision(this.x - TANK_WIDTH / 2, this.y - TANK_HEIGHT / 2, TANK_WIDTH, TANK_HEIGHT)) {
			// 恢复旧位置
			this.x = oldX;
			this.y = oldY;
			this.vx = 0;
			this.vy = 0;
		}
	}

	/**
	 * 移动
	 */
	move(dx: number, dy: number): void {
		if (!this.alive) return;

		this.vx += dx * this.speed;
		this.vy += dy * this.speed;

		// 更新车身角度
		if (dx !== 0 || dy !== 0) {
			this.angle = Math.atan2(dy, dx);
		}
	}

	/**
	 * 瞄准
	 */
	aimAt(targetX: number, targetY: number): void {
		this.turretAngle = Math.atan2(targetY - this.y, targetX - this.x);
	}

	/**
	 * 检查是否可以射击
	 */
	canFire(): boolean {
		if (!this.alive) return false;
		return this.fireTimer <= 0;
	}

	/**
	 * 射击
	 */
	fire(bullets: Bullet[]): void {
		if (!this.canFire()) return;

		const weapon = WEAPONS[this.weaponType];
		this.fireTimer = 1 / weapon.fireRate;

		// 计算炮口位置
		const barrelLength = TANK_WIDTH / 2 + 10;
		const muzzleX = this.x + Math.cos(this.turretAngle) * barrelLength;
		const muzzleY = this.y + Math.sin(this.turretAngle) * barrelLength;

		if (weapon.bulletCount && weapon.bulletCount > 1) {
			// 散弹
			const spread = weapon.spread || 0;
			for (let i = 0; i < weapon.bulletCount; i++) {
				const angle = this.turretAngle + (Math.random() - 0.5) * spread;
				this.createBullet(bullets, muzzleX, muzzleY, angle, weapon);
			}
		} else {
			// 单发
			this.createBullet(bullets, muzzleX, muzzleY, this.turretAngle, weapon);
		}
	}

	/**
	 * 创建子弹
	 */
	private createBullet(
		bullets: Bullet[],
		x: number,
		y: number,
		angle: number,
		weapon: WeaponConfig
	): void {
		// 找到未激活的子弹
		const bullet = bullets.find((b) => !b.active);
		if (bullet) {
			bullet.init(
				x,
				y,
				angle,
				weapon.bulletSpeed,
				weapon.damage,
				this.weaponType,
				weapon.explosive || false,
				weapon.explosionRadius || 0,
				this.id
			);
		}
	}

	/**
	 * 受伤
	 */
	takeDamage(damage: number): void {
		if (!this.alive) return;

		this.health -= damage;
		if (this.health <= 0) {
			this.health = 0;
			this.die();
		}
	}

	/**
	 * 死亡
	 */
	protected die(): void {
		this.alive = false;
		this.onDeath();
	}

	/**
	 * 死亡回调（子类重写）
	 */
	protected abstract onDeath(): void;

	/**
	 * 绘制
	 */
	draw(renderer: Renderer): void {
		if (!this.alive) return;

		// 绘制车身
		renderer.fillCircle({ x: this.x, y: this.y }, TANK_WIDTH / 2, this.bodyColor);
		renderer.strokeCircle({ x: this.x, y: this.y }, TANK_WIDTH / 2, this.outlineColor, 2);

		// 绘制炮塔
		const turretX = this.x + Math.cos(this.turretAngle) * 8;
		const turretY = this.y + Math.sin(this.turretAngle) * 8;
		renderer.fillCircle({ x: turretX, y: turretY }, 12, this.turretColor);

		// 绘制炮管
		const barrelLength = TANK_WIDTH / 2 + 10;
		const barrelEndX = this.x + Math.cos(this.turretAngle) * barrelLength;
		const barrelEndY = this.y + Math.sin(this.turretAngle) * barrelLength;
		renderer.drawLine({ x: turretX, y: turretY }, { x: barrelEndX, y: barrelEndY }, this.turretColor, 4);

		// 绘制生命值条
		this.drawHealthBar(renderer);
	}

	/**
	 * 绘制生命值条
	 */
	private drawHealthBar(renderer: Renderer): void {
		const barWidth = TANK_WIDTH;
		const barHeight = 4;
		const barY = this.y - TANK_HEIGHT / 2 - 10;

		// 背景
		renderer.fillRect(
			{ x: this.x - barWidth / 2, y: barY, width: barWidth, height: barHeight },
			'#333333'
		);

		// 生命值
		const healthPercent = this.health / this.maxHealth;
		const healthColor = healthPercent > 0.5 ? '#00ff00' : healthPercent > 0.25 ? '#ffff00' : '#ff0000';
		renderer.fillRect(
			{ x: this.x - barWidth / 2, y: barY, width: barWidth * healthPercent, height: barHeight },
			healthColor
		);
	}

	/**
	 * 获取边界框
	 */
	getBounds() {
		return {
			x: this.x - TANK_WIDTH / 2,
			y: this.y - TANK_HEIGHT / 2,
			width: TANK_WIDTH,
			height: TANK_HEIGHT,
		};
	}

	/**
	 * 获取位置
	 */
	getPosition(): Vector2 {
		return { x: this.x, y: this.y };
	}
}
