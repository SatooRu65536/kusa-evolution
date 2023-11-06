import { LEVEL_STEP } from "./const";
import { ILLUSTS } from "./illust";
import { Grass } from "./type";

/*
 * 草を取得する
 * @param {string} username - GitHubのユーザー名
 * @param {string} token - GitHubのトークン
 * @return {void}
 */
export async function getGrass(
  username: string,
  token: string
): Promise<Grass | Error> {
  return fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      query: `
        query($userName:String!) {
          user(login: $userName){
            contributionsCollection {
              contributionCalendar {
                totalContributions
                weeks {
                  contributionDays {
                    contributionCount
                    date
                  }
                }
              }
            }
          }
        }
      `,
      variables: {
        userName: username,
      },
    }),
  })
    .then((res) => res.json() as Promise<Grass>)
    .catch((err) => {
      console.log(err);
      return err as Promise<Error>;
    });
}

/*
 * 草のオブジェクトを週ごとの草の数に変換する
 * @param {Grass} grassRes - 草のレスポンス
 * @return {number[]} - 週ごとの草の数
 */
export function formatGrasse(grassRes: Grass): number[] {
  const contributionCalendar = grassRes.data.user.contributionsCollection;
  const grasses = contributionCalendar.contributionCalendar.weeks;
  const weeks = grasses.map((grass) => {
    return grass.contributionDays.map((day) => {
      return day.contributionCount;
    });
  });

  const weekly = weeks.map((week) => {
    return week.reduce((a, b) => a + b);
  });

  return weekly;
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
 * 小数点第n位を四捨五入する
 * @param {number} num - 数値
 * @param {number} digit - 桁数
 * @return {number} - 四捨五入された数値
 */
export function round(num: number, digit: number): number {
  return Math.round(num * 10 ** digit) / 10 ** digit;
}

/*
 * 数値からレベルを取得する
 * @param {number} n - 数値
 * @return {number} - レベル
 */
export function getLevel(n: number): number {
  for (let i = 0; i < LEVEL_STEP.length; i++) {
    if (n <= LEVEL_STEP[i]) return i;
  }
  return 0;
}

/*
 * レベルからイラストのパスを取得する
 * @param {number} level - レベル
 * @param {number} x - イラストのx座標
 * @return {string} - イラストのパス
 */
export function getIllust(level: number, x: number, y: number): string {
  if (0 <= level && level < ILLUSTS.length - 1) return ILLUSTS[level](x, y);
  else return ILLUSTS[ILLUSTS.length - 1](x, y);
}

export function getEvolutions(levels: number[]): string {
  let svg = "";
  const size = { width: 20, height: levels.length * 15 };

  for (let i = 0; i < levels.length; i++) {
    svg += getIllust(levels[i], 0, i * 15);
  }

  svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size.width} ${size.height}">${svg}</svg>`;
  return svg;
}
