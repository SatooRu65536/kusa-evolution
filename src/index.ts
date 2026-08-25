import { Context, Hono } from 'hono';
import { env } from 'hono/adapter';
import { toMessageSvg } from './csv';
import { fetchGrass } from './fetcher';
import { adjustLevels, formatGrasse, levels2csv, smoothLevels } from './convert';

export interface Env extends Record<string, string> {
  GITHUB_TOKEN: string;
}

const app = new Hono();

const SVG_HEADER = { 'Content-Type': 'image/svg+xml' };

function errorSvg(c: Context, message: string, status: 400 | 500) {
  return c.body(toMessageSvg(message), status, SVG_HEADER);
}

app.get('/', (c) => c.text('Hello Homo sapiens!'));

app.get('/evolution', async (c) => {
  const { GITHUB_TOKEN: token } = env<Env>(c);
  const query = c.req.query();

  if (!token) {
    return errorSvg(c, 'GitHub Token が見つかりません。管理者にお知らせください', 500);
  }

  if (!query.username) {
    return errorSvg(c, 'ユーザー名が見つかりません。URL にユーザー名を指定してください', 400);
  }

  const grassRes = await fetchGrass(query.username, token);

  if (grassRes instanceof Error) {
    return errorSvg(c, grassRes.message, 500);
  }

  if ('errors' in grassRes) {
    return errorSvg(c, grassRes.errors[0].message, 500);
  }

  if (!('data' in grassRes) || grassRes.data.user === null) {
    const message = 'message' in grassRes ? grassRes.message : 'ユーザーが見つかりません';
    return errorSvg(c, message, 500);
  }

  const levels = formatGrasse(grassRes.data.user.contributionsCollection);
  const smoothedLevels = smoothLevels(levels, 7);
  const adjustedLevels = adjustLevels(smoothedLevels, 7);

  const darkmode = query.darkmode === 'true';
  const color = query.color ?? (darkmode ? 'white' : 'black');
  const bg = query.bg ?? (darkmode ? 'black' : 'white');

  const evolutionCsv = levels2csv(adjustedLevels, color, bg);

  return c.body(evolutionCsv, 200, SVG_HEADER);
});

export default app;
