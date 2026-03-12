// 游戏主入口
console.log('Tank Battle - Vite + TypeScript 项目初始化成功！');

const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
if (canvas) {
	const ctx = canvas.getContext('2d');
	if (ctx) {
		canvas.width = 1200;
		canvas.height = 720;

		// 绘制测试文本
		ctx.fillStyle = '#00ff00';
		ctx.font = '32px Arial';
		ctx.textAlign = 'center';
		ctx.fillText('Tank Battle - 项目初始化成功', canvas.width / 2, canvas.height / 2);
	}
}
