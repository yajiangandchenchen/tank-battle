// ═══════════════════════════════════════════════════════════════════════════
// 物理系统
// ═══════════════════════════════════════════════════════════════════════════

import type { Vector2, Rect } from '@/types';
import { QUADTREE_MAX_OBJECTS, QUADTREE_MAX_LEVELS } from '@/constants';

/**
 * AABB 碰撞检测
 */
export function rectIntersects(a: Rect, b: Rect): boolean {
	return (
		a.x < b.x + b.width &&
		a.x + a.width > b.x &&
		a.y < b.y + b.height &&
		a.y + a.height > b.y
	);
}

/**
 * 圆形碰撞检测
 */
export function circleIntersects(
	a: Vector2,
	radiusA: number,
	b: Vector2,
	radiusB: number
): boolean {
	const dx = a.x - b.x;
	const dy = a.y - b.y;
	const distance = Math.sqrt(dx * dx + dy * dy);
	return distance < radiusA + radiusB;
}

/**
 * 点到点距离
 */
export function distance(a: Vector2, b: Vector2): number {
	const dx = a.x - b.x;
	const dy = a.y - b.y;
	return Math.sqrt(dx * dx + dy * dy);
}

/**
 * 计算两点间角度
 */
export function angleBetween(from: Vector2, to: Vector2): number {
	return Math.atan2(to.y - from.y, to.x - from.x);
}

/**
 * Quadtree 节点
 */
class QuadtreeNode {
	private bounds: Rect;
	private objects: any[];
	private nodes: QuadtreeNode[];
	private level: number;

	constructor(bounds: Rect, level: number) {
		this.bounds = bounds;
		this.level = level;
		this.objects = [];
		this.nodes = [];
	}

	clear(): void {
		this.objects = [];
		for (const node of this.nodes) {
			node.clear();
		}
		this.nodes = [];
	}

	private split(): void {
		// 分割成 4 个子节点
		const subWidth = this.bounds.width / 2;
		const subHeight = this.bounds.height / 2;
		const x = this.bounds.x;
		const y = this.bounds.y;

		this.nodes[0] = new QuadtreeNode(
			{ x: x + subWidth, y, width: subWidth, height: subHeight },
			this.level + 1
		);
		this.nodes[1] = new QuadtreeNode(
			{ x, y, width: subWidth, height: subHeight },
			this.level + 1
		);
		this.nodes[2] = new QuadtreeNode(
			{ x, y: y + subHeight, width: subWidth, height: subHeight },
			this.level + 1
		);
		this.nodes[3] = new QuadtreeNode(
			{ x: x + subWidth, y: y + subHeight, width: subWidth, height: subHeight },
			this.level + 1
		);
	}

	private getIndex(rect: Rect): number {
		// 确定对象属于哪个子节点（-1 表示不完全属于任何子节点）
		let index = -1;
		const verticalMidpoint = this.bounds.x + this.bounds.width / 2;
		const horizontalMidpoint = this.bounds.y + this.bounds.height / 2;

		const topQuadrant = rect.y < horizontalMidpoint && rect.y + rect.height < horizontalMidpoint;
		const bottomQuadrant = rect.y > horizontalMidpoint;

		if (rect.x < verticalMidpoint && rect.x + rect.width < verticalMidpoint) {
			if (topQuadrant) {
				index = 1;
			} else if (bottomQuadrant) {
				index = 2;
			}
		} else if (rect.x > verticalMidpoint) {
			if (topQuadrant) {
				index = 0;
			} else if (bottomQuadrant) {
				index = 3;
			}
		}

		return index;
	}

	insert(obj: any, rect: Rect): void {
		if (this.nodes.length > 0) {
			const index = this.getIndex(rect);
			if (index !== -1) {
				this.nodes[index].insert(obj, rect);
				return;
			}
		}

		this.objects.push({ obj, rect });

		if (this.objects.length > QUADTREE_MAX_OBJECTS && this.level < QUADTREE_MAX_LEVELS) {
			if (this.nodes.length === 0) {
				this.split();
			}

			let i = 0;
			while (i < this.objects.length) {
				const index = this.getIndex(this.objects[i].rect);
				if (index !== -1) {
					const item = this.objects.splice(i, 1)[0];
					this.nodes[index].insert(item.obj, item.rect);
				} else {
					i++;
				}
			}
		}
	}

	retrieve(rect: Rect, returnObjects: any[] = []): any[] {
		const index = this.getIndex(rect);
		if (index !== -1 && this.nodes.length > 0) {
			this.nodes[index].retrieve(rect, returnObjects);
		}

		for (const item of this.objects) {
			returnObjects.push(item.obj);
		}

		return returnObjects;
	}
}

/**
 * Quadtree 空间分区
 */
export class Quadtree {
	private root: QuadtreeNode;

	constructor(bounds: Rect) {
		this.root = new QuadtreeNode(bounds, 0);
	}

	clear(): void {
		this.root.clear();
	}

	insert(obj: any, rect: Rect): void {
		this.root.insert(obj, rect);
	}

	retrieve(rect: Rect): any[] {
		return this.root.retrieve(rect);
	}
}
