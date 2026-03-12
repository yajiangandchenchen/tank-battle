// ═══════════════════════════════════════════════════════════════════════════
// 游戏常量
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Canvas 尺寸
 */
export const CANVAS_WIDTH = 1200;
export const CANVAS_HEIGHT = 720;

/**
 * 地图图块大小
 */
export const TILE_SIZE = 48;

/**
 * 数学常量
 */
export const PI2 = Math.PI * 2;

/**
 * 游戏帧率
 */
export const TARGET_FPS = 60;
export const FIXED_TIMESTEP = 1 / TARGET_FPS;

/**
 * 物理常量
 */
export const FRICTION = 0.85;
export const MAX_VELOCITY = 300;

/**
 * 坦克尺寸
 */
export const TANK_WIDTH = 32;
export const TANK_HEIGHT = 32;

/**
 * 子弹尺寸
 */
export const BULLET_RADIUS = 4;

/**
 * 激光束配置
 */
export const LASER_WIDTH = 6;
export const LASER_MAX_LENGTH = 800;

/**
 * 相机配置
 */
export const CAMERA_LERP = 0.1;

/**
 * 粒子系统配置
 */
export const MAX_PARTICLES = 500;
export const PARTICLE_LIFETIME = 1.0; // 秒

/**
 * 对象池配置
 */
export const BULLET_POOL_SIZE = 100;
export const PARTICLE_POOL_SIZE = 200;

/**
 * 碰撞检测配置
 */
export const QUADTREE_MAX_OBJECTS = 10;
export const QUADTREE_MAX_LEVELS = 5;

/**
 * 音频配置
 */
export const AUDIO_MASTER_VOLUME = 0.5;
export const AUDIO_SFX_VOLUME = 0.7;
export const AUDIO_MUSIC_VOLUME = 0.3;

/**
 * 语音配置
 */
export const VOICE_RATE = 1.0;
export const VOICE_PITCH = 1.0;
export const VOICE_VOLUME = 1.0;

/**
 * 对话系统配置
 */
export const DIALOGUE_BOX_HEIGHT = 148;
export const DIALOGUE_BOX_PADDING = 20;
export const DIALOGUE_TEXT_SIZE = 17;
export const DIALOGUE_ADVANCE_DELAY = 6.2; // 秒

/**
 * 道具持续时间（秒）
 */
export const POWERUP_DURATION = {
	reflectShield: 8,
	timeWarp: 6,
	emp: 0, // 瞬发
	homingMissile: 10,
	piercingRounds: 12,
	splitShot: 10,
	toxicCloud: 8,
	wallBounce: 15,
	gravityWell: 10,
	portal: 20,
	iceFloor: 12,
	phantomWall: 10,
	stealth: 8,
	shield: 10,
	dash: 0, // 瞬发
	repairKit: 0, // 瞬发
	invincibility: 5,
} as const;

/**
 * 子弹生命周期（秒）
 */
export const BULLET_LIFETIME = 10;

