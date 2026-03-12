// ═══════════════════════════════════════════════════════════════════════════
// 核心类型定义
// ═══════════════════════════════════════════════════════════════════════════

/**
 * 二维向量
 */
export interface Vector2 {
	x: number;
	y: number;
}

/**
 * 矩形区域
 */
export interface Rect {
	x: number;
	y: number;
	width: number;
	height: number;
}

/**
 * 游戏状态枚举
 */
export type GameState =
	| 'menu'
	| 'playing'
	| 'levelComplete'
	| 'gameOver'
	| 'pause'
	| 'dialogue';

/**
 * 武器类型
 */
export type WeaponType =
	| 'pistol'
	| 'shotgun'
	| 'machinegun'
	| 'cannon'
	| 'laser'
	| 'minigun';

/**
 * 敌人类型
 */
export type EnemyType = 'basic' | 'fast' | 'heavy' | 'elite';

/**
 * Boss 类型
 */
export type BossType = 'boss1' | 'boss2' | 'boss3' | 'boss4' | 'boss5';

/**
 * 道具类型
 */
export type PowerUpType =
	| 'weapon'
	| 'health'
	| 'reflectShield'
	| 'timeWarp'
	| 'emp'
	| 'homingMissile'
	| 'piercingRounds'
	| 'splitShot'
	| 'toxicCloud'
	| 'wallBounce'
	| 'gravityWell'
	| 'portal'
	| 'iceFloor'
	| 'phantomWall'
	| 'stealth'
	| 'shield'
	| 'dash'
	| 'repairKit'
	| 'invincibility';

/**
 * 地图图块类型
 */
export type TileType = 'empty' | 'wall' | 'water' | 'tree' | 'rock';

/**
 * 粒子类型
 */
export type ParticleType = 'explosion' | 'smoke' | 'spark' | 'debris';

/**
 * 武器配置
 */
export interface WeaponConfig {
	damage: number;
	fireRate: number; // 每秒发射次数
	bulletSpeed: number;
	bulletCount?: number; // 散弹数量
	spread?: number; // 散布角度
	explosive?: boolean; // 是否爆炸
	explosionRadius?: number;
	lifetime?: number; // 子弹生命周期（秒）
}

/**
 * 道具配置
 */
export interface PowerUpConfig {
	type: PowerUpType;
	duration?: number; // 持续时间（秒），undefined 表示永久
	value?: number; // 数值（如生命值恢复量）
}

/**
 * 敌人配置
 */
export interface EnemyConfig {
	type: EnemyType | BossType;
	health: number;
	speed: number;
	damage: number;
	weapon: WeaponType;
	score: number;
}

/**
 * 关卡配置
 */
export interface LevelConfig {
	id: number;
	name: string;
	theme: string;
	background: string;
	map: string; // 地图字符串
	enemies: Array<{
		type: EnemyType;
		count: number;
	}>;
	boss: BossType;
	bossName: string;
}

/**
 * 剧情对话行
 */
export interface DialogueLine {
	speaker: string;
	role: 'narrator' | 'hero' | 'princess' | 'villain' | 'boss' | 'ally';
	text: string;
}

/**
 * 关卡剧情
 */
export interface LevelStory {
	opening: DialogueLine[];
	bossIntro: DialogueLine[];
	bossDefeated: DialogueLine[];
}
