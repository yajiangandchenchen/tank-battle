// ═══════════════════════════════════════════════════════════════════════════
// 游戏入口
// ═══════════════════════════════════════════════════════════════════════════

import { CANVAS_WIDTH, CANVAS_HEIGHT } from '@/constants';
import type { GameState } from '@/types';

console.log('Tank Battle - 游戏初始化中...');
console.log(`Canvas 尺寸: ${CANVAS_WIDTH}x${CANVAS_HEIGHT}`);

// 临时测试代码
const testState: GameState = 'menu';
console.log(`当前状态: ${testState}`);

const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
if (canvas) {
	const ctx = canvas.getContext('2d');
	if (ctx) {
		canvas.width = CANVAS_WIDTH;
		canvas.height = CANVAS_HEIGHT;

		// 绘制测试文本
		ctx.fillStyle = '#00ff00';
		ctx.font = '32px Arial';
		ctx.textAlign = 'center';
		ctx.fillText('Tank Battle - 项目初始化成功', canvas.width / 2, canvas.height / 2);
	}
}

