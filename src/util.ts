/*
 * Dateからフォーマットされた日付を取得する
 * @param {Date} date - 日付
 * @return {string} - フォーマットされた日付
 */
export function getFormattedDate(date: Date): string {
  const month = date.toLocaleString('en', { month: 'long' });
  const day = date.getDate();

  return `${month} ${day}`;
}
