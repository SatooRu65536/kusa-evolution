// Dateからフォーマットされた日付を取得する
export function getFormattedDate(date: Date): string {
  const month = date.toLocaleString('en', { month: 'long' });
  const day = date.getDate();

  return `${month} ${day}`;
}

// 文字列から0以上1未満の疑似乱数を生成する(同じ文字列なら常に同じ値を返す)
export function seededRandom(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }

  return (hash >>> 0) / 0xffffffff;
}
