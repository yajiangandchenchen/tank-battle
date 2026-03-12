// ═══════════════════════════════════════════════════════════════════════════
// 子弹类
// ═══════════════════════════════════════════════════════════════════════════

import type { WeaponType } from '@/types';
import { BULLET_RADIUS, BULLET_LIFETIME } from '@/constants';
import { Renderer } from '@/core/Renderer';

/**
 * 子弹类 - 处理子弹的移动、碰撞和渲染
 */
export class Bullet {
	active: boolean;
	x: number;
	y: number;
	vx: number;
	vy: number;
	damage: number;
	weaponType: WeaponType;
	explosive: boolean;
	explosionRadius: number;
	lifetime: number;
	ownerId: string; // 'player' 或敌人 ID

	constructor() {
		this.active = false;
		this.x = 0;
		this.y = 0;
		this.vx = 0;
		this.vy = 0;
		this.damage = 0;
		this.weaponType = 'pistol';
		this.explosive = false;
		this.explosionRadius = 0;
		this.lifetime = BULLET_LIFETIME;
		this.ownerId = '';
	}

	/**
	 * 初始化子弹
	 */
	init(
		x: number,
		y: number,
		angle: number,
		speed: number,
		damage: number,
		weaponType: WeaponType,
		explosive: boolean,
		explosionRadius: number,
		ownerId: string
	): void {
		this.active = true;
		this.x = x;
		this.y = y;
		this.vx = Math.cos(angle) * speed;
		this.vy = Math.sin(angle) * speed;
		this.damage = damage;
		this.weaponType = weaponType;
		this.explosive = explosive;
		this.explosionRadius = explosionRadius;
		this.lifetime = BULLET_LIFETIME;
		this.ownerId = ownerId;
	}

	/**
	 * 更新子弹位置和生命周期
	 */
	update(dt: number): void {
		if (!this.active) return;

		this.x += this.vx * dt;
		this.y += this.vy * dt;
		this.lifetime -= dt;

		// 生命周期结束
		if (this.lifetime <= 0) {
			this.active = false;
		}
	}

	/**
	 * 渲染子弹
	 */
	draw(renderer: Renderer): void {
		if (!this.active) return;

		let color = '#ffff00';
		switch (this.weaponType) {
			case 'pistol':
				color = '#ffff00';
				break;
			case 'shotgun':
				color = '#ff8800';
				break;
			case 'machinegun':
				color = '#ff0000';
				break;
			case 'cannon':
				color = '#ff00ff';
				break;
			case 'minigun':
				color = '#00ffff';
				break;
		}

		renderer.fillCircle({ x: this.x, y: this.y }, BULLET_RADIUS, color);
	}

	/**
	 * 销毁子弹
	 */
	die(): void {
		this.active = false;
	}

	/**
	 * 获取子弹边界框
	 */
	getBounds() {
		return {
			x: this.x - BULLET_RADIUS,
			y: this.y - BULLET_RADIUS,
			width: BULLET_RADIUS * 2,
			height: BULLET_RADIUS * 2,
		};
	}
}
