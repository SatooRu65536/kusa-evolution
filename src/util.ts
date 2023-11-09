import { text2csv } from "./csv";
import { evolutionMap, evolutionStep } from "./evolutions";
import { Grass } from "./type";

/*
 * 草のレスポンスを配列に変換する
 * @param {Grass} grassRes - 草のレスポンス
 * @return {number[]} - 週ごとの草の数
 */
export function formatGrasse(grass: Grass): number[] {
  const grasses = grass.contributionCalendar.weeks;
  const weeks = grasses.map((grass) => {
    return grass.contributionDays.map((day) => {
      return day.contributionCount;
    });
  });

  return weeks.flat();
}

/*
 * 小数点第n位を四捨五入する
 * @param {number} num - 数値
 * @param {number} digit - 桁数
 * @return {number} - 四捨五入された数値
 */
function round(num: number, digit: number): number {
  return Math.round(num * 10 ** digit) / 10 ** digit;
}

/*
 * 配列の最大値を100としたときの配列を返す
 * @param {number[]} arr - 数値の配列
 * @return {number[]} - 正規化された配列
 */
export function normalize(arr: number[]): number[] {
  const max = Math.max(...arr);
  return arr.map((num) => round((num / max) * 100, 1));
}

/*
 * 数値からレベルを取得する
 * @param {number} n - 数値
 * @return {number} - レベル
 */
export function num2Level(n: number): number {
  for (let i = 0; i < evolutionStep.length; i++) {
    if (n <= evolutionStep[i]) return i;
  }
  return 0;
}

/*
 * レベルの配列をなめらかなレベルの配列に変換する
 * @param {number} levels - レベル
 * @return {number} - なめらかなレベル
 */
export function smoothLevel(levels: number[]): number[] {
  for (let i = 0; i < levels.length - 1; i++) {
    if (i === 0) continue;

    const current = levels[i];
    const prev = levels[i - 1];
    if (current >= prev) levels[i] = prev + 1;
    else if (current < prev) levels[i] = prev - 1;
  }

  return levels;
}

/*
 * レベルの配列を指定した長さに調整する
 * @param {number} levels - レベル
 * @param {number} length - 長さ
 * @return {number} - 調整されたレベル
 */
export function adjustLevel(levels: number[], length: number): number[] {
  return length < 2 ? levels : levels.slice(-length);
}

/*
 * 乱数を生成する
 * @param {number} min - 最小値
 * @param {number} max - 最大値
 * @param {string} seed - シード
 * @return {number} - シード
 */
function randint(min: number, max: number, seed: string): number {
  const date = new Date();
  const num1 = date.getFullYear() + date.getMonth() + date.getDate();
  const nums = seed.split("").map((s) => s.charCodeAt(0));
  const num2 = nums.reduce((sum, a) => sum + a);

  return ((num1 * num2) % (max - min + 1)) + min;
}

/*
 * 一定確率で指定した数値を置換する
 * @param {number} levels - レベル
 * @param {string} username - ユーザー名
 * @param {number} replace - 置換前の数値
 * @param {number} set - 置換後の数値
 * @return {number} - 置換されたレベル
 */
export function replaceRandom(
  levels: number[],
  username: string,
  replace: number,
  set: number
): number[] {
  levels.map((l, i) => {
    if (l !== replace) return levels;
    if (randint(0, 20, username) === 1) return set;
    else return l;
  });

  return levels;
}

/*
 * Dateからフォーマットされた日付を取得する
 * @param {Date} date - 日付
 * @return {string} - フォーマットされた日付
 */
export function getFormattedDate(date: Date): string {
  const month = date.toLocaleString("en", { month: "long" });
  const day = date.getDate();

  return `${month} ${day}`;
}

/*
 * レベルからイラストのパスを取得する
 * @param {number} level - レベル
 * @param {number} x - イラストのx座標
 * @return {string} - イラストのパス
 */
function level2csvPart(level: number, x: number, y: number): string {
  // evolutionMap の中から level と一致するものを取得する
  const type = evolutionMap.find((t) => t.level === level);
  if (type !== undefined) return type.csv(x, y);
  return evolutionMap[0].csv(x, y);
}

/*
 * レベルの配列から進化のイラストを取得する
 * @param {number[]} levels - レベルの配列
 * @return {string} - イラストのパス
 */
export function levels2csv(levels: number[], color: string): string {
  const size = { width: 162 * levels.length, height: 305 };
  let content = "";
  for (let i = 0; i < levels.length; i++) {
    content += level2csvPart(levels[i], 162 * i, 0);
  }

  const svgOpen = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size.width} ${size.height}">`;
  const style = `
    <defs>
      <style>
        rect {
          fill: none;
        }
        path {
          fill: ${color};
        }
        text {
          fill: ${color};
        }
      </style>
    </defs>
  `;

  const length = levels.length;
  const startDate = new Date();
  const endDate = startDate.setDate(startDate.getDate() - length + 1);
  const startDateText = getFormattedDate(new Date(endDate));
  const endDateText = getFormattedDate(new Date());
  const startDateSvg = text2csv(startDateText, 30, 305);
  const x = 162 * levels.length - 130;
  const endDateSvg = text2csv(endDateText, x, 305);

  return `${svgOpen}${style}${startDateSvg}${endDateSvg}${content}</svg>`;
}
