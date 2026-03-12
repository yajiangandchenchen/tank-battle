// ═══════════════════════════════════════════════════════════════════════════
// 武器配置数据
// ═══════════════════════════════════════════════════════════════════════════

import type { WeaponType, WeaponConfig } from '@/types';

/**
 * 武器配置表
 * 包含 6 种武器的完整配置
 */
export const WEAPONS: Record<WeaponType, WeaponConfig> = {
	// 手枪 - 基础武器，平衡的伤害和射速
	pistol: {
		damage: 10,
		fireRate: 2, // 每秒 2 发
		bulletSpeed: 400,
		lifetime: 10,
	},

	// 霰弹枪 - 近距离高伤害，一次发射多颗子弹
	shotgun: {
		damage: 8,
		fireRate: 1, // 每秒 1 发
		bulletSpeed: 350,
		bulletCount: 5, // 一次发射 5 颗子弹
		spread: 0.3, // 散布角度（弧度）
		lifetime: 10,
	},

	// 机枪 - 高射速，中等伤害
	machinegun: {
		damage: 6,
		fireRate: 8, // 每秒 8 发
		bulletSpeed: 450,
		lifetime: 10,
	},

	// 火炮 - 高伤害，低射速，爆炸效果
	cannon: {
		damage: 40,
		fireRate: 0.5, // 每秒 0.5 发（2 秒一发）
		bulletSpeed: 300,
		explosive: true,
		explosionRadius: 80,
		lifetime: 10,
	},

	// 激光 - 持续伤害，极高射速，超快弹速
	laser: {
		damage: 15,
		fireRate: 20, // 每秒 20 发
		bulletSpeed: 800,
		// 激光不设置 lifetime，表示不消失
	},

	// 加特林 - 极高射速，低伤害
	minigun: {
		damage: 4,
		fireRate: 15, // 每秒 15 发
		bulletSpeed: 500,
		lifetime: 10,
	},
};
