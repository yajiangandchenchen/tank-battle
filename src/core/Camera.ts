// ═══════════════════════════════════════════════════════════════════════════
// 相机系统
// ═══════════════════════════════════════════════════════════════════════════

import type { Vector2 } from '@/types';
import { CAMERA_LERP, CANVAS_WIDTH, CANVAS_HEIGHT } from '@/constants';

/**
 * 相机类 - 管理视口跟随和坐标转换
 */
export class Camera {
	x: number;
	y: number;
	private targetX: number;
	private targetY: number;

	constructor() {
		this.x = 0;
		this.y = 0;
		this.targetX = 0;
		this.targetY = 0;
	}

	/**
	 * 平滑跟随目标
	 * @param target 目标位置（世界坐标）
	 * @param dt 时间增量（秒）
	 */
	follow(target: Vector2, dt: number): void {
		// 设置目标位置为目标中心减去半屏偏移
		this.targetX = target.x - CANVAS_WIDTH / 2;
		this.targetY = target.y - CANVAS_HEIGHT / 2;

		// 使用线性插值实现平滑跟随
		const lerpFactor = 1 - Math.pow(1 - CAMERA_LERP, dt * 60);
		this.x += (this.targetX - this.x) * lerpFactor;
		this.y += (this.targetY - this.y) * lerpFactor;
	}

	/**
	 * 世界坐标转屏幕坐标
	 * @param worldPos 世界坐标
	 * @returns 屏幕坐标
	 */
	worldToScreen(worldPos: Vector2): Vector2 {
		return {
			x: worldPos.x - this.x,
			y: worldPos.y - this.y,
		};
	}

	/**
	 * 屏幕坐标转世界坐标
	 * @param screenPos 屏幕坐标
	 * @returns 世界坐标
	 */
	screenToWorld(screenPos: Vector2): Vector2 {
		return {
			x: screenPos.x + this.x,
			y: screenPos.y + this.y,
		};
	}

	/**
	 * 重置相机位置
	 */
	reset(): void {
		this.x = 0;
		this.y = 0;
		this.targetX = 0;
		this.targetY = 0;
	}
}
