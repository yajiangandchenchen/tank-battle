// ═══════════════════════════════════════════════════════════════════════════
// 颜色配置数据
// ═══════════════════════════════════════════════════════════════════════════

/**
 * 坦克颜色配置
 */
export const TANK_COLORS = {
	// 玩家坦克 - 蓝色系
	player: {
		body: '#4a9eff',
		turret: '#2e7dd8',
		outline: '#1a5aa8',
	},

	// 普通敌人 - 红色系
	enemy: {
		body: '#ff4a4a',
		turret: '#d82e2e',
		outline: '#a81a1a',
	},

	// Boss - 橙色系
	boss: {
		body: '#ff8c00',
		turret: '#d87000',
		outline: '#a85500',
	},
};

/**
 * 地图元素颜色配置
 */
export const MAP_COLORS = {
	wall: '#666666', // 墙壁 - 灰色
	floor: '#222222', // 地板 - 深灰色
	water: '#4444ff', // 水域 - 蓝色
	tree: '#228822', // 树木 - 绿色
	rock: '#888888', // 岩石 - 浅灰色
};

/**
 * UI 颜色配置
 */
export const UI_COLORS = {
	// 生命值条
	healthBar: {
		background: '#333333',
		fill: '#00ff00',
		border: '#ffffff',
	},

	// 对话框
	dialogue: {
		background: 'rgba(0, 0, 0, 0.8)',
		text: '#ffffff',
		speaker: '#ffff00',
		border: '#666666',
	},

	// 按钮
	button: {
		background: '#4a9eff',
		hover: '#2e7dd8',
		text: '#ffffff',
	},
};
