import {
  bushi,
  enjin,
  gendaijin,
  genjin,
  kyujin,
  miraijin,
  ninja,
  shinjin,
  yayoijin,
} from "./csv";

// 種類
export const evolutionMap = [
  { level: 0, name: "猿人", csv: enjin },
  { level: 1, name: "原人", csv: genjin },
  { level: 2, name: "旧人", csv: kyujin },
  { level: 3, name: "新人", csv: shinjin },
  { level: 4, name: "弥生人", csv: yayoijin },
  { level: 5, name: "武士", csv: bushi },
  { level: 6, name: "現代人", csv: gendaijin },
  { level: 7, name: "未来人", csv: miraijin },
  { level: -1, name: "忍者", csv: ninja },
] as const;

// 0-100を段階的に分ける
export const evolutionStep = evolutionMap.filter((t) => t.level >= 0).map((_, i) =>
  Math.floor(((i + 1) * 100) / evolutionMap.length)
);
