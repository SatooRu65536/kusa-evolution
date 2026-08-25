// Dateからフォーマットされた日付を取得する
export function getFormattedDate(date: Date): string {
  const month = date.toLocaleString('en', { month: 'long' });
  const day = date.getDate();

  return `${month} ${day}`;
}
