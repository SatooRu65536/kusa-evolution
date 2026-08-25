import { text, toSvg } from './csv';
import { evolutionMap } from './evolutions';
import { Grass } from './type';
import { getFormattedDate } from './util';

// 草のレスポンスを配列に変換する
export function formatGrasse(grass: Grass): number[] {
  const grasses = grass.contributionCalendar.weeks;
  const weeks = grasses.map((grass) => {
    return grass.contributionDays.map((day) => {
      return day.contributionCount;
    });
  });

  return weeks.flat();
}

// レベルの配列をなめらかなレベルの配列に変換する
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

// レベルの配列を指定した長さに調整する
export function adjustLevels(levels: number[], length: number): number[] {
  return length < 2 ? levels : levels.slice(-length);
}

// レベルからイラストのパスを取得する
function level2csvPart(level: number, x: number, y: number): string {
  const type = evolutionMap.find((t) => t.level === level);
  if (type !== undefined) return type.csv(x, y);
  return evolutionMap[0].csv(x, y);
}

// レベルの配列から進化のイラストを取得する
export function levels2csv(levels: number[], color: string, bg: string): string {
  const illustrationWidth = 130;
  const svgHeight = 305;
  const svgWidth = illustrationWidth * levels.length;

  let content = '';
  for (let i = 0; i < levels.length; i++) {
    content += level2csvPart(levels[i], illustrationWidth * i, -10);
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

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - levels.length + 1);
  const startDateText = getFormattedDate(startDate);
  const endDateText = getFormattedDate(new Date());
  content += text(startDateText, 30, 295);
  content += text(endDateText, svgWidth - 100, 295);

  return toSvg(content, svgWidth, svgHeight, style);
}
