// ═══════════════════════════════════════════════════════════════════════════
// 激光束类
// ═══════════════════════════════════════════════════════════════════════════

import type { Vector2 } from '@/types';
import { LASER_WIDTH, LASER_MAX_LENGTH } from '@/constants';
import { Renderer } from '@/core/Renderer';

/**
 * 激光束类 - 处理激光束的渲染和碰撞检测
 */
export class LaserBeam {
	active: boolean;
	x: number;
	y: number;
	angle: number;
	length: number;
	damage: number;
	ownerId: string;

	constructor() {
		this.active = false;
		this.x = 0;
		this.y = 0;
		this.angle = 0;
		this.length = 0;
		this.damage = 0;
		this.ownerId = '';
	}

	/**
	 * 初始化激光束
	 */
	init(x: number, y: number, angle: number, damage: number, ownerId: string): void {
		this.active = true;
		this.x = x;
		this.y = y;
		this.angle = angle;
		this.length = LASER_MAX_LENGTH;
		this.damage = damage;
		this.ownerId = ownerId;
	}

	/**
	 * 更新激光束（激光束不需要更新位置，由发射者控制）
	 */
	update(_dt: number): void {
		// 激光束不需要更新位置，由发射者控制
	}

	/**
	 * 渲染激光束
	 */
	draw(renderer: Renderer): void {
		if (!this.active) return;

		const endX = this.x + Math.cos(this.angle) * this.length;
		const endY = this.y + Math.sin(this.angle) * this.length;

		// 绘制激光束
		renderer.drawLine({ x: this.x, y: this.y }, { x: endX, y: endY }, '#00ff00', LASER_WIDTH);

		// 绘制光晕效果
		renderer.drawLine(
			{ x: this.x, y: this.y },
			{ x: endX, y: endY },
			'#00ff0044',
			LASER_WIDTH * 2
		);
	}

	/**
	 * 销毁激光束
	 */
	die(): void {
		this.active = false;
	}

	/**
	 * 获取激光束终点坐标
	 */
	getEndPoint(): Vector2 {
		return {
			x: this.x + Math.cos(this.angle) * this.length,
			y: this.y + Math.sin(this.angle) * this.length,
		};
	}
}
