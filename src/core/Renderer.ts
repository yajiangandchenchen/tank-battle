// ═══════════════════════════════════════════════════════════════════════════
// 渲染器
// ═══════════════════════════════════════════════════════════════════════════

import type { Vector2, Rect } from '@/types';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '@/constants';
import { Camera } from './Camera';

/**
 * 渲染器类 - 封装 Canvas 2D 渲染上下文
 */
export class Renderer {
	ctx: CanvasRenderingContext2D;
	private canvas: HTMLCanvasElement;
	private camera: Camera;
	uiScale: number;

	constructor(canvas: HTMLCanvasElement, camera: Camera) {
		const ctx = canvas.getContext('2d');
		if (!ctx) {
			throw new Error('无法获取 Canvas 2D 上下文');
		}
		this.ctx = ctx;
		this.canvas = canvas;
		this.camera = camera;
		this.uiScale = 1;

		// 初始化缩放
		this.updateScale();
	}

	/**
	 * 清空画布
	 */
	clear(): void {
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
	}

	/**
	 * 填充矩形（世界坐标）
	 */
	fillRect(rect: Rect, color: string): void {
		const screenPos = this.camera.worldToScreen({ x: rect.x, y: rect.y });
		this.ctx.fillStyle = color;
		this.ctx.fillRect(screenPos.x, screenPos.y, rect.width, rect.height);
	}

	/**
	 * 描边矩形（世界坐标）
	 */
	strokeRect(rect: Rect, color: string, lineWidth: number = 1): void {
		const screenPos = this.camera.worldToScreen({ x: rect.x, y: rect.y });
		this.ctx.strokeStyle = color;
		this.ctx.lineWidth = lineWidth;
		this.ctx.strokeRect(screenPos.x, screenPos.y, rect.width, rect.height);
	}

	/**
	 * 填充圆形（世界坐标）
	 */
	fillCircle(pos: Vector2, radius: number, color: string): void {
		const screenPos = this.camera.worldToScreen(pos);
		this.ctx.fillStyle = color;
		this.ctx.beginPath();
		this.ctx.arc(screenPos.x, screenPos.y, radius, 0, Math.PI * 2);
		this.ctx.fill();
	}

	/**
	 * 绘制线条（世界坐标）
	 */
	drawLine(from: Vector2, to: Vector2, color: string, lineWidth: number = 1): void {
		const screenFrom = this.camera.worldToScreen(from);
		const screenTo = this.camera.worldToScreen(to);
		this.ctx.strokeStyle = color;
		this.ctx.lineWidth = lineWidth;
		this.ctx.beginPath();
		this.ctx.moveTo(screenFrom.x, screenFrom.y);
		this.ctx.lineTo(screenTo.x, screenTo.y);
		this.ctx.stroke();
	}

	/**
	 * 填充矩形（屏幕坐标，UI 用）
	 */
	fillRectUI(rect: Rect, color: string): void {
		this.ctx.fillStyle = color;
		this.ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
	}

	/**
	 * 绘制文本（屏幕坐标，UI 用）
	 */
	fillTextUI(text: string, pos: Vector2, font: string, color: string): void {
		this.ctx.fillStyle = color;
		this.ctx.font = font;
		this.ctx.fillText(text, pos.x, pos.y);
	}

	/**
	 * 绘制图片（世界坐标）
	 */
	drawImage(img: HTMLImageElement, pos: Vector2, width: number, height: number): void {
		const screenPos = this.camera.worldToScreen(pos);
		this.ctx.drawImage(img, screenPos.x, screenPos.y, width, height);
	}

	/**
	 * 更新响应式缩放
	 */
	updateScale(): void {
		const scaleX = window.innerWidth / CANVAS_WIDTH;
		const scaleY = window.innerHeight / CANVAS_HEIGHT;
		this.uiScale = Math.min(scaleX, scaleY);

		// 应用缩放到 canvas
		this.canvas.style.width = `${CANVAS_WIDTH * this.uiScale}px`;
		this.canvas.style.height = `${CANVAS_HEIGHT * this.uiScale}px`;
	}
}
