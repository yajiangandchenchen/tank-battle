/**
 * 音频系统 - 使用 Web Audio API 合成所有音效
 */

type WeaponType = 'pistol' | 'shotgun' | 'machinegun' | 'cannon' | 'laser' | 'minigun';

class AudioSystem {
	private _ac: AudioContext | null = null; // 音频上下文
	private _mg: GainNode | null = null; // 主增益节点
	private _tn: AudioBufferSourceNode | null = null; // 履带音轨节点
	private _tg: GainNode | null = null; // 履带增益节点

	/**
	 * 延迟初始化音频上下文（首次用户手势时调用）
	 */
	private _boot(): void {
		if (this._ac) return;
		try {
			this._ac = new (window.AudioContext || (window as any).webkitAudioContext)();
			this._mg = this._ac.createGain();
			this._mg.gain.value = 0.68;
			this._mg.connect(this._ac.destination);
		} catch (e) {
			console.warn('[AudioSystem] 无法初始化音频上下文', e);
		}
	}

	/**
	 * 创建增益节点
	 */
	private _g(v: number = 0): GainNode {
		const n = this._ac!.createGain();
		n.gain.value = v;
		n.connect(this._mg!);
		return n;
	}

	/**
	 * 设置音量包络（ADSR）
	 */
	private _env(n: GainNode, v: number, t: number, d: number): void {
		n.gain.setValueAtTime(v, t);
		n.gain.exponentialRampToValueAtTime(0.0001, t + d);
	}

	/**
	 * 创建振荡器（支持频率滑动）
	 */
	private _osc(tp: OscillatorType, fr: number, n: GainNode, t: number, d: number, f2?: number): void {
		const o = this._ac!.createOscillator();
		o.type = tp;
		o.frequency.setValueAtTime(fr, t);
		if (f2 !== undefined) {
			o.frequency.exponentialRampToValueAtTime(Math.max(0.01, f2), t + d);
		}
		o.connect(n);
		o.start(t);
		o.stop(t + d + 0.01);
	}

	/**
	 * 创建噪声
	 */
	private _nz(vol: number, dur: number, lp: number, t: number): void {
		const ns = Math.ceil(this._ac!.sampleRate * dur);
		const buf = this._ac!.createBuffer(1, ns, this._ac!.sampleRate);
		const dta = buf.getChannelData(0);
		for (let i = 0; i < ns; i++) dta[i] = Math.random() * 2 - 1;
		const src = this._ac!.createBufferSource();
		src.buffer = buf;
		const flt = this._ac!.createBiquadFilter();
		flt.type = 'lowpass';
		flt.frequency.value = lp;
		const gn = this._g(0);
		src.connect(flt);
		flt.connect(gn);
		this._env(gn, vol, t, dur);
		src.start(t);
		src.stop(t + dur + 0.01);
	}

	/**
	 * 播放音效的通用包装器
	 */
	private _p(fn: (t: number) => void): void {
		this._boot();
		if (!this._ac) return;
		if (this._ac.state === 'suspended') this._ac.resume();
		fn(this._ac.currentTime);
	}

	/**
	 * 播放武器音效
	 */
	forWeapon(weaponType: WeaponType): void {
		const weaponSounds: Record<WeaponType, () => void> = {
			pistol: () => this.shootPistol(),
			shotgun: () => this.shootShotgun(),
			machinegun: () => this.shootMachinegun(),
			cannon: () => this.shootCannon(),
			laser: () => this.shootLaser(),
			minigun: () => this.shootMinigun()
		};
		(weaponSounds[weaponType] || (() => this.shootPistol()))();
	}

	// ══════════════════════════════════════════════════════════
	// 武器音效
	// ══════════════════════════════════════════════════════════

	/**
	 * 手枪音效
	 */
	shootPistol(): void {
		this._p((t) => {
			const g = this._g(0);
			this._env(g, 0.42, t, 0.14);
			this._osc('square', 190, g, t, 0.14, 44);
			this._nz(0.2, 0.09, 5500, t);
		});
	}

	/**
	 * 霰弹枪音效
	 */
	shootShotgun(): void {
		this._p((t) => {
			for (let i = 0; i < 5; i++) {
				const d = i * 0.016;
				const g = this._g(0);
				this._env(g, 0.17, t + d, 0.22);
				this._osc('sawtooth', 132 + Math.random() * 46, g, t + d, 0.22, 22);
			}
			const g2 = this._g(0);
			this._env(g2, 0.62, t, 0.4);
			this._osc('sine', 86, g2, t, 0.4, 10);
			this._nz(0.42, 0.32, 780, t);
		});
	}

	/**
	 * 机枪音效
	 */
	shootMachinegun(): void {
		this._p((t) => {
			const g = this._g(0);
			this._env(g, 0.22, t, 0.09);
			this._osc('square', 228, g, t, 0.09, 76);
			this._nz(0.14, 0.06, 3600, t);
		});
	}

	/**
	 * 火炮音效
	 */
	shootCannon(): void {
		this._p((t) => {
			const g = this._g(0);
			this._env(g, 0.76, t, 0.72);
			this._osc('sine', 52, g, t, 0.72, 7);
			this._nz(0.55, 0.52, 660, t);
			const g2 = this._g(0);
			this._env(g2, 0.38, t + 0.02, 0.36);
			this._osc('sawtooth', 112, g2, t + 0.02, 0.36, 28);
		});
	}

	/**
	 * 激光音效
	 */
	shootLaser(): void {
		this._p((t) => {
			const o = this._ac!.createOscillator();
			o.type = 'sawtooth';
			o.frequency.setValueAtTime(960, t);
			o.frequency.linearRampToValueAtTime(320, t + 0.22);
			const flt = this._ac!.createBiquadFilter();
			flt.type = 'bandpass';
			flt.frequency.value = 660;
			flt.Q.value = 7;
			const g = this._g(0);
			this._env(g, 0.28, t, 0.22);
			o.connect(flt);
			flt.connect(g);
			o.start(t);
			o.stop(t + 0.23);
		});
	}

	/**
	 * 速射机枪音效
	 */
	shootMinigun(): void {
		this._p((t) => {
			const g = this._g(0);
			this._env(g, 0.18, t, 0.065);
			this._osc('square', 312, g, t, 0.065, 108);
		});
	}

	// ══════════════════════════════════════════════════════════
	// 事件音效
	// ══════════════════════════════════════════════════════════

	/**
	 * 金属撞击音效
	 */
	hitMetal(): void {
		this._p((t) => {
			const g = this._g(0);
			this._env(g, 0.25, t, 0.13);
			this._osc('triangle', 520, g, t, 0.13, 160);
			this._nz(0.13, 0.08, 2200, t);
		});
	}

	/**
	 * 爆炸音效
	 */
	hitExplosion(): void {
		this._p((t) => {
			const g = this._g(0);
			this._env(g, 0.86, t, 0.92);
			this._osc('sine', 36, g, t, 0.92, 4);
			this._nz(0.66, 0.76, 1500, t);
			const g2 = this._g(0);
			this._env(g2, 0.46, t + 0.05, 0.62);
			this._osc('sine', 68, g2, t + 0.05, 0.62, 9);
		});
	}

	/**
	 * 拾取道具音效
	 */
	pickup(): void {
		this._p((t) => {
			[523, 659, 784, 1047].forEach((f, i) => {
				const d = i * 0.09;
				const g = this._g(0);
				this._env(g, 0.22, t + d, 0.2);
				this._osc('sine', f, g, t + d, 0.2);
			});
		});
	}

	/**
	 * 坦克死亡音效
	 */
	tankDeath(): void {
		this._p((t) => {
			for (let i = 0; i < 3; i++) {
				const d = i * 0.15;
				const g = this._g(0);
				this._env(g, 0.7 - i * 0.12, t + d, 0.82);
				this._osc('sine', 46 + Math.random() * 20, g, t + d, 0.82, 5);
				this._nz(0.5, 0.62, 1200, t + d);
			}
		});
	}

	/**
	 * Boss 咆哮音效
	 */
	bossRoar(): void {
		this._p((t) => {
			[110, 82.4, 73.4, 55].forEach((f, i) => {
				const d = i * 0.25;
				const g = this._g(0);
				this._env(g, 0.4, t + d, 0.32);
				this._osc('sawtooth', f, g, t + d, 0.32);
			});
			this._nz(0.28, 1.0, 400, t);
		});
	}

	/**
	 * 胜利音效
	 */
	victory(): void {
		this._p((t) => {
			[523, 659, 784, 659, 784, 1047].forEach((f, i) => {
				const d = i * 0.15;
				const g = this._g(0);
				this._env(g, 0.24, t + d, 0.22);
				this._osc('triangle', f, g, t + d, 0.22);
			});
		});
	}

	// ══════════════════════════════════════════════════════════
	// 背景音轨（履带隆隆声）
	// ══════════════════════════════════════════════════════════

	/**
	 * 启动循环履带音轨
	 */
	startTrack(): void {
		this._boot();
		if (!this._ac || this._tn) return;
		if (this._ac.state === 'suspended') this._ac.resume();
		const sr = this._ac.sampleRate;
		const n = Math.ceil(sr * 0.6);
		const buf = this._ac.createBuffer(1, n, sr);
		const dta = buf.getChannelData(0);
		const ci = Math.floor(sr * 0.15);
		for (let i = 0; i < n; i++) {
			const p = i % ci;
			dta[i] = (Math.random() * 2 - 1) * 0.18 + (p < 4 ? 0.45 : 0) + Math.sin(i * 0.07) * 0.09;
		}
		this._tn = this._ac.createBufferSource();
		this._tn.buffer = buf;
		this._tn.loop = true;
		const flt = this._ac.createBiquadFilter();
		flt.type = 'lowpass';
		flt.frequency.value = 185;
		this._tg = this._ac.createGain();
		this._tg.gain.value = 0;
		this._tn.connect(flt);
		flt.connect(this._tg);
		this._tg.connect(this._mg!);
		this._tn.start();
	}

	/**
	 * 设置履带音量
	 */
	setTrack(v: number): void {
		if (this._tg) this._tg.gain.value = v * 0.17;
	}

	/**
	 * 停止履带音轨
	 */
	stopTrack(): void {
		if (this._tn) {
			try {
				this._tn.stop();
			} catch (e) {
				console.warn('[AudioSystem] 停止履带音轨失败', e);
			}
			this._tn = null;
			this._tg = null;
		}
	}
}

// 导出单例
export const audioSystem = new AudioSystem();
export type { WeaponType };

