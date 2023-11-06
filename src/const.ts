// 種類
export const TYPES = [
  { level: 0, id: "enjin", name: "猿人" },
  { level: 1, id: "genjin", name: "原人" },
  { level: 2, id: "kyujin", name: "旧人" },
  { level: 3, id: "shinjin", name: "新人" },
  { level: 4, id: "yayoijin", name: "弥生人" },
  { level: 5, id: "bushi", name: "武士" },
  { level: 6, id: "gendaijin", name: "現代人" },
  { level: 7, id: "miraijin", name: "未来人" },
  { level: -1, id: "ninja", name: "忍者" },
] as const;

// 0-100を段階的に分ける
export const LEVEL_STEP = TYPES.map((_, i) =>
  Math.floor(((i + 1) * 100) / TYPES.length)
);
