// ═══════════════════════════════════════════════════════════════════════════
// 粒子系统
// ═══════════════════════════════════════════════════════════════════════════

import type { ParticleType } from '@/types';
import { MAX_PARTICLES } from '@/constants';
import { Renderer } from '@/core/Renderer';

/**
 * 粒子类
 */
class Particle {
	active: boolean;
	x: number;
	y: number;
	vx: number;
	vy: number;
	life: number;
	maxLife: number;
	color: string;
	size: number;
	type: ParticleType;

	constructor() {
		this.active = false;
		this.x = 0;
		this.y = 0;
		this.vx = 0;
		this.vy = 0;
		this.life = 0;
		this.maxLife = 0;
		this.color = '#ffffff';
		this.size = 2;
		this.type = 'explosion';
	}

	/**
	 * 初始化粒子
	 */
	init(
		x: number,
		y: number,
		vx: number,
		vy: number,
		life: number,
		color: string,
		size: number,
		type: ParticleType
	): void {
		this.active = true;
		this.x = x;
		this.y = y;
		this.vx = vx;
		this.vy = vy;
		this.life = life;
		this.maxLife = life;
		this.color = color;
		this.size = size;
		this.type = type;
	}

	/**
	 * 更新粒子状态
	 */
	update(dt: number): void {
		if (!this.active) return;

		// 更新位置
		this.x += this.vx * dt;
		this.y += this.vy * dt;

		// 减少生命值
		this.life -= dt;

		// 根据粒子类型应用不同的物理效果
		if (this.type === 'debris') {
			// 碎片受重力影响
			this.vy += 300 * dt;
		} else if (this.type === 'smoke') {
			// 烟雾向上飘
			this.vy -= 50 * dt;
		}

		// 应用摩擦力
		this.vx *= 0.98;
		this.vy *= 0.98;

		// 生命值耗尽则失活
		if (this.life <= 0) {
			this.active = false;
		}
	}

	/**
	 * 渲染粒子
	 */
	draw(renderer: Renderer): void {
		if (!this.active) return;

		// 根据剩余生命值计算透明度
		const alpha = this.life / this.maxLife;
		const alphaHex = Math.floor(alpha * 255)
			.toString(16)
			.padStart(2, '0');
		const color = this.color + alphaHex;

		// 根据粒子类型调整渲染
		if (this.type === 'smoke') {
			// 烟雾随时间变大
			const sizeMultiplier = 1 + (1 - alpha) * 0.5;
			renderer.fillCircle({ x: this.x, y: this.y }, this.size * sizeMultiplier, color);
		} else {
			renderer.fillCircle({ x: this.x, y: this.y }, this.size, color);
		}
	}
}

/**
 * 粒子系统类 - 管理所有粒子的生命周期
 */
export class ParticleSystem {
	private particles: Particle[];

	constructor() {
		// 初始化对象池
		this.particles = [];
		for (let i = 0; i < MAX_PARTICLES; i++) {
			this.particles.push(new Particle());
		}
	}

	/**
	 * 发射粒子
	 */
	emit(
		x: number,
		y: number,
		count: number,
		type: ParticleType,
		color: string = '#ffaa00'
	): void {
		for (let i = 0; i < count; i++) {
			const particle = this.getInactiveParticle();
			if (!particle) break; // 对象池已满

			// 随机方向和速度
			const angle = Math.random() * Math.PI * 2;
			const speed = 100 + Math.random() * 200;
			const vx = Math.cos(angle) * speed;
			const vy = Math.sin(angle) * speed;

			// 随机生命周期和大小
			const life = 0.5 + Math.random() * 0.5;
			const size = 2 + Math.random() * 3;

			particle.init(x, y, vx, vy, life, color, size, type);
		}
	}

	/**
	 * 爆炸效果 - 组合多种粒子类型
	 */
	explosion(x: number, y: number, radius: number): void {
		const count = Math.floor(radius / 4);

		// 火焰粒子
		this.emit(x, y, count, 'explosion', '#ff6600');

		// 烟雾粒子
		this.emit(x, y, Math.floor(count / 2), 'smoke', '#666666');

		// 火花粒子
		this.emit(x, y, Math.floor(count / 3), 'spark', '#ffff00');
	}

	/**
	 * 火花效果 - 用于子弹击中等
	 */
	spark(x: number, y: number, direction: number): void {
		const count = 5 + Math.floor(Math.random() * 5);

		for (let i = 0; i < count; i++) {
			const particle = this.getInactiveParticle();
			if (!particle) break;

			// 在击中方向的扇形范围内发射
			const spread = Math.PI / 3; // 60度扇形
			const angle = direction + (Math.random() - 0.5) * spread;
			const speed = 150 + Math.random() * 150;
			const vx = Math.cos(angle) * speed;
			const vy = Math.sin(angle) * speed;

			const life = 0.2 + Math.random() * 0.3;
			const size = 1 + Math.random() * 2;
			const color = Math.random() > 0.5 ? '#ffff00' : '#ff8800';

			particle.init(x, y, vx, vy, life, color, size, 'spark');
		}
	}

	/**
	 * 碎片效果 - 用于坦克爆炸等
	 */
	debris(x: number, y: number, count: number, color: string = '#888888'): void {
		for (let i = 0; i < count; i++) {
			const particle = this.getInactiveParticle();
			if (!particle) break;

			const angle = Math.random() * Math.PI * 2;
			const speed = 100 + Math.random() * 250;
			const vx = Math.cos(angle) * speed;
			const vy = Math.sin(angle) * speed - 100; // 向上抛射

			const life = 0.8 + Math.random() * 0.7;
			const size = 3 + Math.random() * 4;

			particle.init(x, y, vx, vy, life, color, size, 'debris');
		}
	}

	/**
	 * 烟雾效果 - 持续性烟雾
	 */
	smoke(x: number, y: number, count: number = 3): void {
		for (let i = 0; i < count; i++) {
			const particle = this.getInactiveParticle();
			if (!particle) break;

			const angle = Math.random() * Math.PI * 2;
			const speed = 20 + Math.random() * 30;
			const vx = Math.cos(angle) * speed;
			const vy = Math.sin(angle) * speed - 50; // 向上飘

			const life = 1.0 + Math.random() * 0.5;
			const size = 4 + Math.random() * 6;
			const gray = 50 + Math.floor(Math.random() * 100);
			const color = `#${gray.toString(16).padStart(2, '0')}${gray.toString(16).padStart(2, '0')}${gray.toString(16).padStart(2, '0')}`;

			particle.init(x, y, vx, vy, life, color, size, 'smoke');
		}
	}

	/**
	 * 从对象池获取未激活的粒子
	 */
	private getInactiveParticle(): Particle | null {
		for (const particle of this.particles) {
			if (!particle.active) {
				return particle;
			}
		}
		return null;
	}

	/**
	 * 更新所有激活的粒子
	 */
	update(dt: number): void {
		for (const particle of this.particles) {
			if (particle.active) {
				particle.update(dt);
			}
		}
	}

	/**
	 * 渲染所有激活的粒子
	 */
	draw(renderer: Renderer): void {
		for (const particle of this.particles) {
			if (particle.active) {
				particle.draw(renderer);
			}
		}
	}

	/**
	 * 清空所有粒子
	 */
	clear(): void {
		for (const particle of this.particles) {
			particle.active = false;
		}
	}

	/**
	 * 获取当前激活的粒子数量（用于调试）
	 */
	getActiveCount(): number {
		let count = 0;
		for (const particle of this.particles) {
			if (particle.active) {
				count++;
			}
		}
		return count;
	}
}

