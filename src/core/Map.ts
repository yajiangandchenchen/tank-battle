// ═══════════════════════════════════════════════════════════════════════════
// 地图系统
// ═══════════════════════════════════════════════════════════════════════════

import type { Vector2, TileType } from '@/types';
import { TILE_SIZE } from '@/constants';
import { Renderer } from './Renderer';

/**
 * 地图图块
 */
interface Tile {
	type: TileType;
	x: number;
	y: number;
}

/**
 * 地图类
 */
export class GameMap {
	private tiles: Tile[][];
	private width: number;
	private height: number;

	constructor(mapString: string) {
		this.tiles = [];
		this.parseMap(mapString);
		this.width = this.tiles[0]?.length || 0;
		this.height = this.tiles.length;
	}

	/**
	 * 解析地图字符串
	 */
	private parseMap(mapString: string): void {
		const lines = mapString.trim().split('\n');
		for (let y = 0; y < lines.length; y++) {
			const row: Tile[] = [];
			for (let x = 0; x < lines[y].length; x++) {
				const char = lines[y][x];
				let type: TileType = 'empty';

				switch (char) {
					case '#':
						type = 'wall';
						break;
					case '~':
						type = 'water';
						break;
					case 'T':
						type = 'tree';
						break;
					case 'R':
						type = 'rock';
						break;
					default:
						type = 'empty';
				}

				row.push({ type, x, y });
			}
			this.tiles.push(row);
		}
	}

	/**
	 * 检查位置是否可通行
	 */
	isWalkable(worldX: number, worldY: number): boolean {
		const tileX = Math.floor(worldX / TILE_SIZE);
		const tileY = Math.floor(worldY / TILE_SIZE);

		if (tileY < 0 || tileY >= this.height || tileX < 0 || tileX >= this.width) {
			return false;
		}

		const tile = this.tiles[tileY][tileX];
		return tile.type === 'empty';
	}

	/**
	 * 检查矩形区域是否与墙壁碰撞
	 */
	checkCollision(x: number, y: number, width: number, height: number): boolean {
		// 检查四个角
		const corners = [
			{ x, y },
			{ x: x + width, y },
			{ x, y: y + height },
			{ x: x + width, y: y + height },
		];

		for (const corner of corners) {
			if (!this.isWalkable(corner.x, corner.y)) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Flood Fill 连通性验证
	 */
	validateConnectivity(): boolean {
		// 找到第一个空地作为起点
		let startX = -1;
		let startY = -1;

		for (let y = 0; y < this.height; y++) {
			for (let x = 0; x < this.width; x++) {
				if (this.tiles[y][x].type === 'empty') {
					startX = x;
					startY = y;
					break;
				}
			}
			if (startX !== -1) break;
		}

		if (startX === -1) return false;

		// Flood Fill
		const visited = new Set<string>();
		const queue: Vector2[] = [{ x: startX, y: startY }];
		let emptyCount = 0;

		// 统计总空地数量
		for (let y = 0; y < this.height; y++) {
			for (let x = 0; x < this.width; x++) {
				if (this.tiles[y][x].type === 'empty') {
					emptyCount++;
				}
			}
		}

		let visitedCount = 0;

		while (queue.length > 0) {
			const pos = queue.shift()!;
			const key = `${pos.x},${pos.y}`;

			if (visited.has(key)) continue;
			visited.add(key);
			visitedCount++;

			// 检查四个方向
			const directions = [
				{ x: pos.x + 1, y: pos.y },
				{ x: pos.x - 1, y: pos.y },
				{ x: pos.x, y: pos.y + 1 },
				{ x: pos.x, y: pos.y - 1 },
			];

			for (const dir of directions) {
				if (
					dir.x >= 0 &&
					dir.x < this.width &&
					dir.y >= 0 &&
					dir.y < this.height &&
					this.tiles[dir.y][dir.x].type === 'empty' &&
					!visited.has(`${dir.x},${dir.y}`)
				) {
					queue.push(dir);
				}
			}
		}

		return visitedCount === emptyCount;
	}

	/**
	 * 渲染地图
	 */
	draw(renderer: Renderer): void {
		for (let y = 0; y < this.height; y++) {
			for (let x = 0; x < this.width; x++) {
				const tile = this.tiles[y][x];
				const worldX = x * TILE_SIZE;
				const worldY = y * TILE_SIZE;

				let color = '#000000';
				switch (tile.type) {
					case 'wall':
						color = '#666666';
						break;
					case 'water':
						color = '#4444ff';
						break;
					case 'tree':
						color = '#228822';
						break;
					case 'rock':
						color = '#888888';
						break;
					case 'empty':
						color = '#222222';
						break;
				}

				renderer.fillRect(
					{ x: worldX, y: worldY, width: TILE_SIZE, height: TILE_SIZE },
					color
				);
			}
		}
	}

	getWidth(): number {
		return this.width * TILE_SIZE;
	}

	getHeight(): number {
		return this.height * TILE_SIZE;
	}
}
