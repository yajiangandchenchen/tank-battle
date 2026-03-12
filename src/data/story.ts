// ═══════════════════════════════════════════════════════════════════════════
// 剧情数据
// ═══════════════════════════════════════════════════════════════════════════

import type { LevelStory } from '@/types';

/**
 * 完整剧情线：
 * Prince Roland 从 General Vex 的 10 个 Boss 手中营救 Princess Elara
 *
 * 角色设定：
 * - narrator: 旁白，讲述故事背景
 * - hero: Prince Roland，勇敢的王子
 * - princess: Princess Elara，被囚禁的公主
 * - villain: General Vex，幕后黑手
 * - boss: 各关卡的 Boss
 * - ally: 盟友，提供支援和情报
 */
export const STORY_DATA: LevelStory[] = [
	// ═══════════════════════════════════════════════════════════════════════════
	// 第 1 关：森林前哨 - Steel Sergeant
	// ═══════════════════════════════════════════════════════════════════════════
	{
		opening: [
			{
				speaker: 'Narrator',
				role: 'narrator',
				text: '在遥远的王国，邪恶的 General Vex 绑架了美丽的 Princess Elara。',
			},
			{
				speaker: 'Narrator',
				role: 'narrator',
				text: '勇敢的 Prince Roland 驾驶着他的战车，踏上了营救公主的征程。',
			},
			{
				speaker: 'Prince Roland',
				role: 'hero',
				text: 'Elara，等着我！我一定会救你出来的！',
			},
			{
				speaker: 'Ally',
				role: 'ally',
				text: '王子殿下，前方是敌军的森林前哨，由 Steel Sergeant 把守。小心他的重装甲！',
			},
		],
		bossIntro: [
			{
				speaker: 'Steel Sergeant',
				role: 'boss',
				text: '哼，又一个送死的小子。你以为能突破我的防线？',
			},
			{
				speaker: 'Prince Roland',
				role: 'hero',
				text: '我不会让任何人阻挡我救出 Elara！',
			},
		],
		bossDefeated: [
			{
				speaker: 'Steel Sergeant',
				role: 'boss',
				text: '不可能...我的钢铁之躯...竟然被击败了...',
			},
			{
				speaker: 'Prince Roland',
				role: 'hero',
				text: '第一道防线已经突破。Elara，我来了！',
			},
		],
	},

	// ═══════════════════════════════════════════════════════════════════════════
	// 第 2 关：沙漠要塞 - Desert Viper
	// ═══════════════════════════════════════════════════════════════════════════
	{
		opening: [
			{
				speaker: 'Narrator',
				role: 'narrator',
				text: 'Roland 穿越森林，来到了炙热的沙漠。',
			},
			{
				speaker: 'Ally',
				role: 'ally',
				text: '王子，沙漠要塞由 Desert Viper 镇守。他的速度极快，千万小心！',
			},
			{
				speaker: 'Prince Roland',
				role: 'hero',
				text: '无论多快，我都会追上他！',
			},
		],
		bossIntro: [
			{
				speaker: 'Desert Viper',
				role: 'boss',
				text: '嘶嘶...欢迎来到我的沙漠。你将永远留在这里！',
			},
			{
				speaker: 'Prince Roland',
				role: 'hero',
				text: '我不会停下脚步的！',
			},
		],
		bossDefeated: [
			{
				speaker: 'Desert Viper',
				role: 'boss',
				text: '怎么可能...我的速度...竟然跟不上你...',
			},
			{
				speaker: 'Prince Roland',
				role: 'hero',
				text: '又一个障碍被清除了。Elara，再等等我！',
			},
		],
	},

	// ═══════════════════════════════════════════════════════════════════════════
	// 第 3 关：雪地堡垒 - Frost Commander
	// ═══════════════════════════════════════════════════════════════════════════
	{
		opening: [
			{
				speaker: 'Narrator',
				role: 'narrator',
				text: 'Roland 离开沙漠，进入了冰雪覆盖的北方。',
			},
			{
				speaker: 'Ally',
				role: 'ally',
				text: '前方是 Frost Commander 的堡垒。他的装甲极厚，火力强大！',
			},
			{
				speaker: 'Prince Roland',
				role: 'hero',
				text: '再厚的装甲也挡不住我的决心！',
			},
		],
		bossIntro: [
			{
				speaker: 'Frost Commander',
				role: 'boss',
				text: '愚蠢的王子，你的旅程到此为止。在我的冰霜之下，你将永远沉睡！',
			},
			{
				speaker: 'Prince Roland',
				role: 'hero',
				text: '我的心火会融化你的冰霜！',
			},
		],
		bossDefeated: [
			{
				speaker: 'Frost Commander',
				role: 'boss',
				text: '不...我的冰霜堡垒...崩塌了...',
			},
			{
				speaker: 'Prince Roland',
				role: 'hero',
				text: '已经过半了。Elara，我不会放弃！',
			},
		],
	},

	// ═══════════════════════════════════════════════════════════════════════════
	// 第 4 关：城市废墟 - Urban Tyrant
	// ═══════════════════════════════════════════════════════════════════════════
	{
		opening: [
			{
				speaker: 'Narrator',
				role: 'narrator',
				text: 'Roland 来到了被战火摧毁的城市废墟。',
			},
			{
				speaker: 'Ally',
				role: 'ally',
				text: 'Urban Tyrant 在这里设下了重重陷阱。他狡猾而残忍！',
			},
			{
				speaker: 'Prince Roland',
				role: 'hero',
				text: '无论多少陷阱，都阻止不了我！',
			},
		],
		bossIntro: [
			{
				speaker: 'Urban Tyrant',
				role: 'boss',
				text: '哈哈哈！欢迎来到我的战场。这里将是你的坟墓！',
			},
			{
				speaker: 'Prince Roland',
				role: 'hero',
				text: '你的暴政今天就要结束了！',
			},
		],
		bossDefeated: [
			{
				speaker: 'Urban Tyrant',
				role: 'boss',
				text: '不...我的帝国...我的统治...',
			},
			{
				speaker: 'Prince Roland',
				role: 'hero',
				text: '正义终将战胜邪恶！',
			},
		],
	},

	// ═══════════════════════════════════════════════════════════════════════════
	// 第 5 关：敌军基地 - General Vex
	// ═══════════════════════════════════════════════════════════════════════════
	{
		opening: [
			{
				speaker: 'Narrator',
				role: 'narrator',
				text: 'Roland 终于来到了 General Vex 的基地。',
			},
			{
				speaker: 'Princess Elara',
				role: 'princess',
				text: 'Roland！我知道你会来的！',
			},
			{
				speaker: 'General Vex',
				role: 'villain',
				text: '哼，你确实很顽强。但这里就是你的终点！',
			},
			{
				speaker: 'Prince Roland',
				role: 'hero',
				text: 'Vex！放了 Elara，我们一对一决斗！',
			},
		],
		bossIntro: [
			{
				speaker: 'General Vex',
				role: 'boss',
				text: '你以为你能打败我？我是最强的战士！',
			},
			{
				speaker: 'Prince Roland',
				role: 'hero',
				text: '为了 Elara，我会战斗到最后一刻！',
			},
		],
		bossDefeated: [
			{
				speaker: 'General Vex',
				role: 'boss',
				text: '不...这不可能...我怎么会输...',
			},
			{
				speaker: 'Princess Elara',
				role: 'princess',
				text: 'Roland！你做到了！',
			},
			{
				speaker: 'Prince Roland',
				role: 'hero',
				text: 'Elara，我来救你了！让我们回家吧！',
			},
			{
				speaker: 'Narrator',
				role: 'narrator',
				text: '但是...这真的结束了吗？',
			},
		],
	},

	// ═══════════════════════════════════════════════════════════════════════════
	// 第 6 关：火山熔岩 - Lava Guardian
	// ═══════════════════════════════════════════════════════════════════════════
	{
		opening: [
			{
				speaker: 'Narrator',
				role: 'narrator',
				text: '就在 Roland 以为一切结束时，地面突然震动起来。',
			},
			{
				speaker: 'Ally',
				role: 'ally',
				text: '不好！火山爆发了！Vex 在这里设置了最后的防线！',
			},
			{
				speaker: 'Princess Elara',
				role: 'princess',
				text: 'Roland，小心！前方有强大的守卫！',
			},
			{
				speaker: 'Prince Roland',
				role: 'hero',
				text: '我们必须穿过这里才能安全离开！',
			},
		],
		bossIntro: [
			{
				speaker: 'Lava Guardian',
				role: 'boss',
				text: '轰隆隆...你们休想逃离这里！',
			},
			{
				speaker: 'Prince Roland',
				role: 'hero',
				text: '我已经走到这一步了，不会在这里倒下！',
			},
		],
		bossDefeated: [
			{
				speaker: 'Lava Guardian',
				role: 'boss',
				text: '轰...隆...隆...',
			},
			{
				speaker: 'Princess Elara',
				role: 'princess',
				text: '太好了！我们可以离开了！',
			},
			{
				speaker: 'Prince Roland',
				role: 'hero',
				text: '还不能放松警惕，前方可能还有危险。',
			},
		],
	},

	// ═══════════════════════════════════════════════════════════════════════════
	// 第 7 关：冰封洞窟 - Ice Warden
	// ═══════════════════════════════════════════════════════════════════════════
	{
		opening: [
			{
				speaker: 'Narrator',
				role: 'narrator',
				text: 'Roland 和 Elara 逃离火山，却误入了一个冰封的洞窟。',
			},
			{
				speaker: 'Princess Elara',
				role: 'princess',
				text: '好冷...这里是什么地方？',
			},
			{
				speaker: 'Ally',
				role: 'ally',
				text: '这是 Vex 的秘密基地之一！Ice Warden 正在守卫这里！',
			},
			{
				speaker: 'Prince Roland',
				role: 'hero',
				text: 'Vex 的势力比我想象的还要庞大...但我不会退缩！',
			},
		],
		bossIntro: [
			{
				speaker: 'Ice Warden',
				role: 'boss',
				text: '你们将在这冰封的牢笼中永远沉睡！',
			},
			{
				speaker: 'Prince Roland',
				role: 'hero',
				text: '我们的意志比你的冰霜更坚固！',
			},
		],
		bossDefeated: [
			{
				speaker: 'Ice Warden',
				role: 'boss',
				text: '冰...在融化...不...',
			},
			{
				speaker: 'Princess Elara',
				role: 'princess',
				text: 'Roland，你真是太厉害了！',
			},
			{
				speaker: 'Prince Roland',
				role: 'hero',
				text: '我们必须继续前进，找到真正的出路。',
			},
		],
	},

	// ═══════════════════════════════════════════════════════════════════════════
	// 第 8 关：丛林迷宫 - Jungle Predator
	// ═══════════════════════════════════════════════════════════════════════════
	{
		opening: [
			{
				speaker: 'Narrator',
				role: 'narrator',
				text: 'Roland 和 Elara 走出洞窟，进入了一片茂密的丛林。',
			},
			{
				speaker: 'Princess Elara',
				role: 'princess',
				text: '这里的树木太密集了，我们会不会迷路？',
			},
			{
				speaker: 'Ally',
				role: 'ally',
				text: '小心！Jungle Predator 擅长在丛林中伏击！',
			},
			{
				speaker: 'Prince Roland',
				role: 'hero',
				text: '保持警惕，跟紧我！',
			},
		],
		bossIntro: [
			{
				speaker: 'Jungle Predator',
				role: 'boss',
				text: '嘶嘶...欢迎来到我的狩猎场...你们就是我的猎物！',
			},
			{
				speaker: 'Prince Roland',
				role: 'hero',
				text: '猎人和猎物的身份，马上就要颠倒了！',
			},
		],
		bossDefeated: [
			{
				speaker: 'Jungle Predator',
				role: 'boss',
				text: '不...我才是...顶级掠食者...',
			},
			{
				speaker: 'Princess Elara',
				role: 'princess',
				text: '太好了！我们终于可以离开这片丛林了！',
			},
			{
				speaker: 'Prince Roland',
				role: 'hero',
				text: '还有两关。我们一定能回家的！',
			},
		],
	},

	// ═══════════════════════════════════════════════════════════════════════════
	// 第 9 关：工业区 - Steel Colossus
	// ═══════════════════════════════════════════════════════════════════════════
	{
		opening: [
			{
				speaker: 'Narrator',
				role: 'narrator',
				text: 'Roland 和 Elara 来到了一个废弃的工业区。',
			},
			{
				speaker: 'Princess Elara',
				role: 'princess',
				text: '这里到处都是机械和钢铁...感觉很不祥。',
			},
			{
				speaker: 'Ally',
				role: 'ally',
				text: '这是 Vex 的军工厂！Steel Colossus 是他最强大的机械战士！',
			},
			{
				speaker: 'Prince Roland',
				role: 'hero',
				text: '再强大的机械，也有弱点！',
			},
		],
		bossIntro: [
			{
				speaker: 'Steel Colossus',
				role: 'boss',
				text: '目标锁定...消灭入侵者...执行命令...',
			},
			{
				speaker: 'Prince Roland',
				role: 'hero',
				text: '让我看看你的钢铁之躯有多坚固！',
			},
		],
		bossDefeated: [
			{
				speaker: 'Steel Colossus',
				role: 'boss',
				text: '系统...故障...无法...继续...',
			},
			{
				speaker: 'Princess Elara',
				role: 'princess',
				text: 'Roland，你太棒了！还有最后一关！',
			},
			{
				speaker: 'Prince Roland',
				role: 'hero',
				text: '最后的战斗即将到来。我们一定能胜利！',
			},
		],
	},

	// ═══════════════════════════════════════════════════════════════════════════
	// 第 10 关：终极决战 - Ultimate Destroyer
	// ═══════════════════════════════════════════════════════════════════════════
	{
		opening: [
			{
				speaker: 'Narrator',
				role: 'narrator',
				text: 'Roland 和 Elara 终于来到了最后的战场。',
			},
			{
				speaker: 'Ally',
				role: 'ally',
				text: '王子，前方是 Vex 的终极武器 - Ultimate Destroyer！',
			},
			{
				speaker: 'Princess Elara',
				role: 'princess',
				text: 'Roland，我相信你！我们一定能一起回家！',
			},
			{
				speaker: 'Prince Roland',
				role: 'hero',
				text: '这是最后一战了。为了我们的未来，我绝不会输！',
			},
		],
		bossIntro: [
			{
				speaker: 'Ultimate Destroyer',
				role: 'boss',
				text: '哈哈哈！你们以为能逃出我的手掌心？这就是你们的终点！',
			},
			{
				speaker: 'Prince Roland',
				role: 'hero',
				text: '不，这是你的终点！为了 Elara，为了和平，我会打败你！',
			},
		],
		bossDefeated: [
			{
				speaker: 'Ultimate Destroyer',
				role: 'boss',
				text: '不...不可能...我是...最强的...',
			},
			{
				speaker: 'Princess Elara',
				role: 'princess',
				text: 'Roland！我们胜利了！',
			},
			{
				speaker: 'Prince Roland',
				role: 'hero',
				text: 'Elara，我们终于可以回家了！',
			},
			{
				speaker: 'Narrator',
				role: 'narrator',
				text: 'Roland 和 Elara 携手战胜了所有敌人，终于回到了他们的王国。',
			},
			{
				speaker: 'Narrator',
				role: 'narrator',
				text: '他们的爱情和勇气，将永远被人们传颂。',
			},
		],
	},
];
