// ═══════════════════════════════════════════════════════════════════════════
// 对话系统 - 用户控制的剧情对话
// ═══════════════════════════════════════════════════════════════════════════

import {
	CANVAS_HEIGHT,
	DIALOGUE_BOX_HEIGHT,
	DIALOGUE_BOX_PADDING,
	DIALOGUE_TEXT_SIZE,
} from '@/constants';
import type { DialogueLine } from '@/types';
import { VoiceSystem } from './VoiceSystem';

/**
 * 对话系统 - 用户控制，不自动推进
 */
export class DialogueSystem {
	private voiceSystem: VoiceSystem;
	private lines: DialogueLine[];
	private currentIndex: number;
	private active: boolean;
	private onComplete: (() => void) | null;

	// 音频波形条动画
	private waveBarCount: number = 22;
	private waveBarHeights: number[];
	private waveBarTargets: number[];
	private waveBarSpeeds: number[];

	constructor(voiceSystem: VoiceSystem) {
		this.voiceSystem = voiceSystem;
		this.lines = [];
		this.currentIndex = 0;
		this.active = false;
		this.onComplete = null;

		// 初始化波形条
		this.waveBarHeights = new Array(this.waveBarCount).fill(0);
		this.waveBarTargets = new Array(this.waveBarCount).fill(0);
		this.waveBarSpeeds = new Array(this.waveBarCount)
			.fill(0)
			.map(() => 0.1 + Math.random() * 0.15);
	}

	/**
	 * 开始对话
	 */
	start(lines: DialogueLine[], onComplete?: () => void): void {
		this.lines = lines;
		this.currentIndex = 0;
		this.active = true;
		this.onComplete = onComplete || null;

		// 播放第一行
		if (this.lines.length > 0) {
			this.playCurrentLine();
		}
	}

	/**
	 * 播放当前行
	 */
	private playCurrentLine(): void {
		const line = this.lines[this.currentIndex];
		if (line) {
			this.voiceSystem.speak(line.text, line.role);
		}
	}

	/**
	 * 推进到下一行（Space/Click 触发）
	 */
	advance(): void {
		if (!this.active) return;

		// 如果正在播放语音，跳过语音
		if (this.voiceSystem.speaking) {
			this.voiceSystem.stop();
			return;
		}

		// 推进到下一行
		this.currentIndex++;

		if (this.currentIndex >= this.lines.length) {
			// 对话结束
			this.stop();
		} else {
			// 播放下一行
			this.playCurrentLine();
		}
	}

	/**
	 * 停止对话
	 */
	stop(): void {
		this.voiceSystem.stop();
		this.active = false;

		// 调用完成回调
		if (this.onComplete) {
			this.onComplete();
			this.onComplete = null;
		}
	}

	/**
	 * 更新（空操作，用户控制）
	 */
	update(_dt: number): void {
		// 更新音频波形条动画
		if (this.voiceSystem.speaking) {
			// 语音播放时，波形条随机跳动
			for (let i = 0; i < this.waveBarCount; i++) {
				// 随机更新目标高度
				if (Math.random() < 0.1) {
					this.waveBarTargets[i] = Math.random();
				}

				// 平滑插值到目标高度
				const diff = this.waveBarTargets[i] - this.waveBarHeights[i];
				this.waveBarHeights[i] += diff * this.waveBarSpeeds[i];
			}
		} else {
			// 语音停止时，波形条归零
			for (let i = 0; i < this.waveBarCount; i++) {
				this.waveBarHeights[i] *= 0.9;
				this.waveBarTargets[i] = 0;
			}
		}
	}

	/**
	 * 渲染对话框
	 */
	draw(ctx: CanvasRenderingContext2D, canvasWidth: number): void {
		if (!this.active || this.lines.length === 0) return;

		const line = this.lines[this.currentIndex];
		if (!line) return;

		const boxY = CANVAS_HEIGHT - DIALOGUE_BOX_HEIGHT - 8;
		const boxHeight = DIALOGUE_BOX_HEIGHT;

		// 绘制对话框背景
		ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
		ctx.fillRect(0, boxY, canvasWidth, boxHeight);

		// 绘制边框
		ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
		ctx.lineWidth = 2;
		ctx.strokeRect(0, boxY, canvasWidth, boxHeight);

		// 绘制说话者名称
		const speakerY = boxY + DIALOGUE_BOX_PADDING + 20;
		const speakerName = this.voiceSystem.speaking
			? `${line.speaker} ♪`
			: line.speaker;

		ctx.font = `bold ${DIALOGUE_TEXT_SIZE + 2}px "Courier New", monospace`;
		ctx.fillStyle = this.getRoleColor(line.role);
		ctx.fillText(speakerName, DIALOGUE_BOX_PADDING, speakerY);

		// 绘制对话文本（自动换行）
		const textY = speakerY + 30;
		const maxWidth = canvasWidth - DIALOGUE_BOX_PADDING * 2;
		const lineHeight = DIALOGUE_TEXT_SIZE + 6;

		ctx.font = `${DIALOGUE_TEXT_SIZE}px "Courier New", monospace`;
		ctx.fillStyle = '#ffffff';

		const words = line.text.split(' ');
		let currentLine = '';
		let y = textY;

		for (const word of words) {
			const testLine = currentLine + (currentLine ? ' ' : '') + word;
			const metrics = ctx.measureText(testLine);

			if (metrics.width > maxWidth && currentLine) {
				ctx.fillText(currentLine, DIALOGUE_BOX_PADDING, y);
				currentLine = word;
				y += lineHeight;
			} else {
				currentLine = testLine;
			}
		}

		if (currentLine) {
			ctx.fillText(currentLine, DIALOGUE_BOX_PADDING, y);
		}

		// 绘制音频波形条
		this.drawWaveform(ctx, canvasWidth, boxY);

		// 绘制继续提示
		this.drawContinuePrompt(ctx, canvasWidth, boxY, boxHeight);
	}

	/**
	 * 绘制音频波形条
	 */
	private drawWaveform(
		ctx: CanvasRenderingContext2D,
		_canvasWidth: number,
		boxY: number
	): void {
		const barWidth = 4;
		const barGap = 6;
		const maxBarHeight = 30;
		const waveformY = boxY + DIALOGUE_BOX_HEIGHT - 50;

		for (let i = 0; i < this.waveBarCount; i++) {
			const x = DIALOGUE_BOX_PADDING + i * (barWidth + barGap);
			const height = this.waveBarHeights[i] * maxBarHeight;

			ctx.fillStyle = this.voiceSystem.speaking
				? 'rgba(100, 200, 255, 0.8)'
				: 'rgba(100, 100, 100, 0.5)';

			ctx.fillRect(x, waveformY - height / 2, barWidth, height || 2);
		}
	}

	/**
	 * 绘制继续提示
	 */
	private drawContinuePrompt(
		ctx: CanvasRenderingContext2D,
		canvasWidth: number,
		boxY: number,
		boxHeight: number
	): void {
		const promptY = boxY + boxHeight - 20;
		const promptText = this.voiceSystem.speaking
			? 'SPACE / Click ✕ skip voice'
			: '▶ continue';

		ctx.font = `${DIALOGUE_TEXT_SIZE - 3}px "Courier New", monospace`;
		ctx.fillStyle = this.voiceSystem.speaking
			? 'rgba(255, 200, 100, 0.9)'
			: 'rgba(100, 255, 100, 0.9)';

		const textWidth = ctx.measureText(promptText).width;
		ctx.fillText(promptText, canvasWidth - textWidth - DIALOGUE_BOX_PADDING, promptY);
	}

	/**
	 * 获取角色颜色
	 */
	private getRoleColor(role: DialogueLine['role']): string {
		const colors: Record<DialogueLine['role'], string> = {
			narrator: '#aaaaaa',
			hero: '#4488ff',
			princess: '#ff88cc',
			villain: '#ff4444',
			boss: '#ff8800',
			ally: '#44ff88',
		};

		return colors[role] || '#ffffff';
	}

	/**
	 * 是否正在播放对话
	 */
	get isActive(): boolean {
		return this.active;
	}

	/**
	 * 当前对话行
	 */
	get currentLine(): DialogueLine | null {
		return this.lines[this.currentIndex] || null;
	}
}
