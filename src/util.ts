import { LEVEL_STEP } from "./const";
import { ILLUSTS } from "./illust";
import { Grass } from "./type";
import axios from "axios";

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
  const githubApiEndpoint = "https://api.github.com/graphql";

  const query = `
    query($userName: String!) {
      user(login: $userName) {
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
`;

  const variables = {
    userName: username,
  };

  return axios
    .post<Grass | Error>(
      githubApiEndpoint,
      {
        query,
        variables,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    )
    .then((response) => response.data)
    .catch((error) => error);
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
  return length >= 2 ? levels.slice(0, length) : levels;
}

/*
 * 乱数を生成する
 * @param {number} min - 最小値
 * @param {number} max - 最大値
 * @param {string} username - ユーザー名
 * @return {number} - シード
 */
function random(min: number, max: number, seed: string): number {
  const date = new Date();
  const num1 = date.getFullYear() + date.getMonth() + date.getDate();
  const nums = seed.split("").map((s) => s.charCodeAt(0));
  const num2 = nums.reduce((sum, a) => sum + a);

  return (num1 * num2) % (max - min + 1) + min;
}

/*
 * レベルからイラストのパスを取得する
 * @param {number} level - レベル
 * @param {number} x - イラストのx座標
 * @return {string} - イラストのパス
 */
export function getIllust(
  username: string,
  level: number,
  x: number,
  y: number
): string {
  if (0 <= level && level < ILLUSTS.length - 1) {
    if (level === 5) {
      const randomNum = random(0, 100, username);
      if (randomNum === 1) return ILLUSTS[ILLUSTS.length - 1](x, y);
      else return ILLUSTS[level + 1](x, y);
    }
    return ILLUSTS[level](x, y);
  } else return ILLUSTS[ILLUSTS.length - 1](x, y);
}

/*
 * テキストのSVGを取得する
 * @param {string} text - テキスト
 * @param {number} x - x座標
 * @param {number} y - y座標
 * @return {string} - テキストのSVG
 */
function getTextSvg(text: string, x: number, y: number): string {
  return `<text transform="matrix(1 0 0 1 ${x} ${y})" class="st1 st2">${text}</text>`;
}

/*
 * Dateからフォーマットされた日付を取得する
 * @param {Date} date - 日付
 * @return {string} - フォーマットされた日付
 */
function getFormattedDate(date: Date): string {
  // 月を英語表記にする
  const month = date.toLocaleString("en", { month: "long" });
  const day = date.getDate();

  return `${month} ${day}`;
}

/*
 * レベルの配列から進化のイラストを取得する
 * @param {number[]} levels - レベルの配列
 * @param {number} length - 表示するイラストの数
 * @return {string} - イラストのパス
 */
export function getEvolutions(levels: number[], usrname: string): string {
  const size = { width: 162 * levels.length, height: 305 };
  let content = "";
  for (let i = 0; i < levels.length; i++) {
    content += getIllust(usrname, levels[i], 162 * i, 0);
  }

  const svgOpen = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size.width} ${size.height}">`;
  const style = `
    <defs>
      <style>
        rect {
          fill: none;
        }
      </style>
    </defs>
  `;

  const length = levels.length;
  const startDate = new Date();
  const endDate = startDate.setDate(startDate.getDate() - length + 1);
  const startDateText = getFormattedDate(new Date(endDate));
  const endDateText = getFormattedDate(new Date());
  const startDateSvg = getTextSvg(startDateText, 30, 305);
  const x = 162 * levels.length - 130;
  const endDateSvg = getTextSvg(endDateText, x, 305);

  return `${svgOpen}${style}${startDateSvg}${endDateSvg}${content}</svg>`;
}
