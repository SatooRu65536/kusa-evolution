import { text, toSvg } from './csv';
import { evolutionMap } from './evolutions';
import { Grass } from './type';
import { getFormattedDate } from './util';

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
 * レベルの配列をなめらかなレベルの配列に変換する
 * @param {number} levels - レベル
 * @return {number} - なめらかなレベル
 */
export function smoothLevels(levels: number[], max: number): number[] {
  return levels.reduce(
    (acc, cur, i) => {
      if (i === 0) return acc;

      const prev = levels[i - 1];
      const prevLevel = acc.at(-1) ?? 0;

      if (cur === 0) {
        acc.push(0);
      } else if (prev === cur) {
        acc.push(prevLevel);
      } else if (prev < cur) {
        const level = Math.min(max, prevLevel + 1);
        acc.push(level);
      } else {
        const level = Math.max(0, prevLevel - 1);
        acc.push(level);
      }

      return acc;
    },
    [0]
  );
}

/*
 * レベルの配列を指定した長さに調整する
 * @param {number} levels - レベル
 * @param {number} length - 長さ
 * @return {number} - 調整されたレベル
 */
export function adjustLevels(levels: number[], length: number): number[] {
  return length < 2 ? levels : levels.slice(-length);
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
export function levels2csv(levels: number[], color: string, bg: string): string {
  const width = 130;
  const size = { width: width * levels.length, height: 305 };
  let content = '';
  for (let i = 0; i < levels.length; i++) {
    content += level2csvPart(levels[i], width * i, -10);
  }

  const style = `
    <defs>
      <style>
        svg {
          background-color: ${bg};
        }
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
  const startDateSvg = text(startDateText, 30, 295);
  const x = width * levels.length - 100;
  const endDateSvg = text(endDateText, x, 295);
  content += startDateSvg + endDateSvg;

  return toSvg(content, size.width, size.height, style);
}
