import { Hono } from 'hono';
import { env } from 'hono/adapter';
import { toMessageSvg } from './csv';
import { fetchGrass } from './fetcher';
import { adjustLevels, formatGrasse, levels2csv, smoothLevels } from './convert';

export interface Env extends Record<string, string> {
  GITHUB_TOKEN: string;
}

const app = new Hono();

app.get('/', (c) => c.text('Hello Homo sapiens!'));

app.get('/evolution', async (c) => {
  const { GITHUB_TOKEN: token } = env<Env>(c);
  const query = c.req.query();

  const header = {
    'Content-Type': 'image/svg+xml',
  };

  if (!token) {
    const svg = toMessageSvg('GitHub Token が見つかりません。管理者にお知らせください');
    return c.body(svg, 500, header);
  }

  if (!query.username) {
    const svg = toMessageSvg('ユーザー名が見つかりません。URL にユーザー名を指定してください');
    return c.body(svg, 400, header);
  }

  const grassRes = await fetchGrass(query.username, token);

  if (grassRes instanceof Error) {
    const svg = toMessageSvg(grassRes.message);
    return c.body(svg, 500, header);
  }

  if ('errors' in grassRes) {
    const svg = toMessageSvg(grassRes.errors[0].message);
    return c.body(svg, 500, header);
  }

  const levels = formatGrasse(grassRes.data.user.contributionsCollection);
  const smoothedLevels = smoothLevels(levels, 7);
  const adjustedLevels = adjustLevels(smoothedLevels, 7);

  let color = query.darkmode === 'true' ? 'white' : 'black';
  let bg = query.darkmode === 'true' ? 'black' : 'white';
  if (query.color !== undefined) color = query.color;
  if (query.bg !== undefined) bg = query.bg;

  const evolutionCsv = levels2csv(adjustedLevels, color, bg);

  return c.body(evolutionCsv, 200, header);
  // let color = darkMode ? "beige" : "black";
  // let bg = darkMode ? "black" : "white";

  // if (req.query.color) color = req.query.color as string;
  // if (req.query.bg) bg = req.query.bg as string;

  // if (!token) return res.status(500).send("GITHUB_TOKEN is not set");
  // if (!username) return res.status(400).send("username is not set");

  // const grassRes = await fetchGrass(username, token);

  // if (grassRes instanceof Error) return res.status(500).send(grassRes.message);
  // if (grassRes.data.user === null) {
  //   return res
  //     .status(500)
  //     .send((grassRes as GitHubErrorResponse).errors[0].message);
  // }

  // const weeklyGrass = formatGrasse(grassRes.data.user.contributionsCollection);
  // const smoothLevels = smoothLevel(weeklyGrass);
  // const adjustedSmoothLevels = adjustLevel(smoothLevels, length);
  // const replacedLevels = replaceRandom(adjustedSmoothLevels, username, 5, -1);
  // const evolutionsSvg = levels2csv(replacedLevels, color, bg);

  // res.setHeader("Content-Type", "image/svg+xml");
  // res.send(evolutionsSvg);
});

export default app;
