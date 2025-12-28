// 本地番剧数据配置
export type AnimeItem = {
	title: string; // 标题
	status: "watching" | "completed" | "planned"; // 状态
	rating: number; // 评分
	cover: string; // 封面
	description: string; // 描述
	episodes: string; // 集数
	year: string; // 年份
	genre: string[]; // 分类
	studio: string; // 制作公司
	link: string; // 链接
	progress: number; // 当前观看的集数
	totalEpisodes: number; // 总集数
	startDate: string; // 开始时间
	endDate: string; // 结束时间
};

const localAnimeList: AnimeItem[] = [
	{
		title: "葬送的芙莉莲",
		status: "completed",
		rating: 9.9,
		cover: "/assets/anime/zsdfll.webp",
		description: "寿命逾千年的魔法使芙莉莲，以曾经共同战胜魔王的勇者辛美尔之死为契机，踏上了了解人类的旅途。邂逅了同属勇者小队的僧侣海塔与战士艾泽分别培养出的菲伦与休塔尔克，芙莉莲与二人一同前往灵魂安眠之地。去往此地需要【一级魔法使】资格，因此芙莉莲与菲伦前往魔法都市维萨斯特，参加一级魔法使选拔测验。在那里有着形形色色的卓越魔法使…此刻，最顶尖的魔法将在维萨斯特展开激烈碰撞！",
		episodes: "28 episodes",
		year: "2023",
		genre: ["漫画改","奇幻","治愈","冒险"],
		studio: "MADHOUSE",
		link: "https://www.bilibili.com/bangumi/media/md21087073",
		progress: 28, // 当前观看的集数
		totalEpisodes: 28,
		startDate: "2023-09",
		endDate: "2023-12",
	},	{
		title: "野生的大魔王出现了！",
		status: "completed",
		rating: 9.8,
		cover: "/assets/anime/Yasei no Last Boss ga Arawareta!.webp",
		description: "米兹加尔兹历2800年，以“黑翼霸王”之名为世人所畏惧的「露法丝·玛法尔」，在与人称「七英雄」勇者们进行的最终决战中历经激战，其霸道之路迎来了终结。人们本以为霸王被封印能够带来安宁的时代…，但由于力量的均衡被打破，世界暴露在了魔神族的威胁之中。而在200年后──为了对抗魔神族，人类尝试召唤新的勇者。但出现在那里的，却是从漫长封印中苏醒的霸王露法丝的身影！",
		episodes: "12 episodes",
		year: "2025",
		genre: ["小说改","战斗","奇幻"],
		studio: "WAO World",
		link: "https://www.bilibili.com/bangumi/media/md27725120",
		progress: 12,
		totalEpisodes: 12,
		startDate: "2025-10",
		endDate: "2025-12",
	},
	
];

export default localAnimeList;
