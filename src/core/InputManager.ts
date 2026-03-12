/**
 * 输入管理系统
 * 管理键盘输入状态，支持按键按下、按下瞬间、释放瞬间的检测
 */
export class InputManager {
	private keys: Map<string, boolean>; // 当前按键状态
	private keysPressed: Map<string, boolean>; // 本帧按下的按键
	private keysReleased: Map<string, boolean>; // 本帧释放的按键
	private handleKeyDown: (e: KeyboardEvent) => void;
	private handleKeyUp: (e: KeyboardEvent) => void;

	constructor() {
		this.keys = new Map();
		this.keysPressed = new Map();
		this.keysReleased = new Map();

		// 绑定事件处理器，保持 this 上下文
		this.handleKeyDown = this.onKeyDown.bind(this);
		this.handleKeyUp = this.onKeyUp.bind(this);

		// 注册全局键盘事件监听器
		window.addEventListener('keydown', this.handleKeyDown);
		window.addEventListener('keyup', this.handleKeyUp);
	}

	/**
	 * 键盘按下事件处理
	 */
	private onKeyDown(e: KeyboardEvent): void {
		const key = e.key.toLowerCase();

		// 如果之前没有按下，则标记为本帧按下
		if (!this.keys.get(key)) {
			this.keysPressed.set(key, true);
		}

		this.keys.set(key, true);
	}

	/**
	 * 键盘释放事件处理
	 */
	private onKeyUp(e: KeyboardEvent): void {
		const key = e.key.toLowerCase();

		this.keys.set(key, false);
		this.keysReleased.set(key, true);
	}

	/**
	 * 检查按键是否持续按下
	 * @param key 按键名称（小写）
	 * @returns 按键是否按下
	 */
	isKeyDown(key: string): boolean {
		return this.keys.get(key.toLowerCase()) || false;
	}

	/**
	 * 检查按键是否在本帧刚按下
	 * @param key 按键名称（小写）
	 * @returns 按键是否在本帧按下
	 */
	isKeyPressed(key: string): boolean {
		return this.keysPressed.get(key.toLowerCase()) || false;
	}

	/**
	 * 检查按键是否在本帧刚释放
	 * @param key 按键名称（小写）
	 * @returns 按键是否在本帧释放
	 */
	isKeyReleased(key: string): boolean {
		return this.keysReleased.get(key.toLowerCase()) || false;
	}

	/**
	 * 每帧更新，清理瞬时状态
	 * 必须在每帧结束时调用
	 */
	update(): void {
		// 清空本帧的按下和释放状态
		this.keysPressed.clear();
		this.keysReleased.clear();
	}

	/**
	 * 销毁输入管理器，移除事件监听器
	 */
	destroy(): void {
		window.removeEventListener('keydown', this.handleKeyDown);
		window.removeEventListener('keyup', this.handleKeyUp);
		this.keys.clear();
		this.keysPressed.clear();
		this.keysReleased.clear();
	}
}
