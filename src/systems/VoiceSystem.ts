// ═══════════════════════════════════════════════════════════════════════════
// 语音系统 - 使用 Web Speech API 实现角色配音
// ═══════════════════════════════════════════════════════════════════════════

import type { DialogueLine } from '@/types';

/**
 * 角色语音配置
 */
interface VoiceProfile {
	pitch: number; // 音调 (0.0 - 2.0)
	rate: number; // 语速 (0.1 - 10.0)
	volume: number; // 音量 (0.0 - 1.0)
}

/**
 * 角色类型
 */
type VoiceRole = 'narrator' | 'hero' | 'princess' | 'villain' | 'boss' | 'ally';

/**
 * 语音系统类 - 管理角色配音和 TTS
 */
export class VoiceSystem {
	private synth: SpeechSynthesis;
	private utterance: SpeechSynthesisUtterance | null;
	private voices: SpeechSynthesisVoice[];
	private femaleVoice: SpeechSynthesisVoice | null;

	// 角色语音配置
	private profiles: Record<VoiceRole, VoiceProfile> = {
		narrator: { pitch: 0.92, rate: 0.78, volume: 0.9 },
		hero: { pitch: 1.14, rate: 1.04, volume: 1.0 },
		princess: { pitch: 1.72, rate: 1.06, volume: 0.95 },
		villain: { pitch: 0.36, rate: 0.68, volume: 0.85 },
		boss: { pitch: 0.40, rate: 0.82, volume: 0.9 },
		ally: { pitch: 1.0, rate: 1.0, volume: 0.9 }
	};

	// 公开的状态标志
	public speaking: boolean;

	constructor() {
		this.synth = window.speechSynthesis;
		this.utterance = null;
		this.voices = [];
		this.femaleVoice = null;
		this.speaking = false;

		// 加载可用语音
		this.loadVoices();

		// 监听语音列表变化（某些浏览器异步加载）
		if (speechSynthesis.onvoiceschanged !== undefined) {
			speechSynthesis.onvoiceschanged = () => {
				this.loadVoices();
			};
		}
	}

	/**
	 * 加载可用语音并选择女性声音
	 */
	private loadVoices(): void {
		this.voices = this.synth.getVoices();

		// 为公主角色选择女性声音
		// 优先通过名称关键词匹配
		const femaleKeywords = [
			'zira', 'samantha', 'hazel', 'victoria', 'karen',
			'alice', 'aria', 'jenny', 'female', 'woman',
			'fiona', 'kate', 'susan', 'linda', 'mary'
		];

		// 首先尝试通过名称匹配
		for (const voice of this.voices) {
			const nameLower = voice.name.toLowerCase();
			if (femaleKeywords.some(keyword => nameLower.includes(keyword))) {
				this.femaleVoice = voice;
				break;
			}
		}

		// 如果没找到，使用反向启发式：排除明显的男性声音
		if (!this.femaleVoice && this.voices.length > 0) {
			const maleKeywords = ['david', 'mark', 'george', 'male', 'man'];
			for (const voice of this.voices) {
				const nameLower = voice.name.toLowerCase();
				if (!maleKeywords.some(keyword => nameLower.includes(keyword))) {
					this.femaleVoice = voice;
					break;
				}
			}
		}

		// 最后的后备方案：使用第一个可用语音
		if (!this.femaleVoice && this.voices.length > 0) {
			this.femaleVoice = this.voices[0];
		}
	}

	/**
	 * 播放角色语音
	 * @param text 要朗读的文本
	 * @param role 角色类型
	 */
	speak(text: string, role: VoiceRole = 'narrator'): void {
		// 停止当前播放
		this.stop();

		// 创建新的语音实例
		this.utterance = new SpeechSynthesisUtterance(text);

		// 应用角色配置
		const profile = this.profiles[role];
		this.utterance.pitch = profile.pitch;
		this.utterance.rate = profile.rate;
		this.utterance.volume = profile.volume;

		// 公主角色使用女性声音
		if (role === 'princess' && this.femaleVoice) {
			this.utterance.voice = this.femaleVoice;
		}

		// 设置事件监听器
		this.utterance.onstart = () => {
			this.speaking = true;
		};

		this.utterance.onend = () => {
			this.speaking = false;
		};

		this.utterance.onerror = (event) => {
			console.error('语音合成错误:', event);
			this.speaking = false;
		};

		// 开始播放
		this.synth.speak(this.utterance);
	}

	/**
	 * 停止当前语音播放
	 */
	stop(): void {
		if (this.synth.speaking) {
			this.synth.cancel();
		}
		this.speaking = false;
		this.utterance = null;
	}

	/**
	 * 暂停语音播放
	 */
	pause(): void {
		if (this.synth.speaking && !this.synth.paused) {
			this.synth.pause();
		}
	}

	/**
	 * 恢复语音播放
	 */
	resume(): void {
		if (this.synth.paused) {
			this.synth.resume();
		}
	}

	/**
	 * 检查是否正在播放
	 */
	isSpeaking(): boolean {
		return this.speaking;
	}

	/**
	 * 获取可用语音列表（用于调试）
	 */
	getAvailableVoices(): SpeechSynthesisVoice[] {
		return this.voices;
	}

	/**
	 * 获取当前选择的女性声音（用于调试）
	 */
	getFemaleVoice(): SpeechSynthesisVoice | null {
		return this.femaleVoice;
	}

	/**
	 * 播放对话行
	 * @param line 对话行数据
	 */
	speakDialogueLine(line: DialogueLine): void {
		this.speak(line.text, line.role);
	}

	/**
	 * 设置角色语音配置（用于运行时调整）
	 * @param role 角色类型
	 * @param profile 语音配置
	 */
	setProfile(role: VoiceRole, profile: Partial<VoiceProfile>): void {
		this.profiles[role] = {
			...this.profiles[role],
			...profile
		};
	}

	/**
	 * 获取角色语音配置
	 * @param role 角色类型
	 */
	getProfile(role: VoiceRole): VoiceProfile {
		return { ...this.profiles[role] };
	}
}
