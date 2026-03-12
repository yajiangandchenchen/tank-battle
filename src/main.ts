// ═══════════════════════════════════════════════════════════════════════════
// 游戏入口
// ═══════════════════════════════════════════════════════════════════════════

import { CANVAS_WIDTH, CANVAS_HEIGHT } from '@/constants';
import { Game } from '@/core/Game';

console.log('Tank Battle - 游戏初始化中...');
console.log(`Canvas 尺寸: ${CANVAS_WIDTH}x${CANVAS_HEIGHT}`);

const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
if (canvas) {
	// 设置 canvas 尺寸
	canvas.width = CANVAS_WIDTH;
	canvas.height = CANVAS_HEIGHT;

	// 创建并初始化游戏
	const game = new Game(canvas);
	game.init();

	// 将游戏实例挂载到 window 对象，方便调试
	(window as any).game = game;
	console.log('游戏实例已挂载到 window.game');
} else {
	console.error('无法找到 canvas 元素');
}


