import express from "express";
import {
  adjustLevel,
  formatGrasse,
  getEvolutions,
  getGrass,
  getLevel,
  normalize,
  smoothLevel,
} from "./src/util";
import { GitHubErrorResponse } from "./src/type";
import "dotenv/config";

const app = express();
const port = 3000;

app.get("/evolution", async (req, res) => {
  const token = process.env.GITHUB_TOKEN;
  const username = req.query.username as string | undefined;
  const length = req.query.length ? Number(req.query.length) : 7;

  if (!token) return res.status(500).send("GITHUB_TOKEN is not set");
  if (!username) return res.status(400).send("username is not set");

  const grassRes = await getGrass(username, token);

  if (grassRes instanceof Error) return res.status(500).send(grassRes.message);
  if (grassRes.data.user === null) {
    return res
      .status(500)
      .send((grassRes as GitHubErrorResponse).errors[0].message);
  }

  const weeklyGrass = formatGrasse(grassRes.data.user.contributionsCollection);
  const normalizedGrass = normalize(weeklyGrass);
  const grassLevels = normalizedGrass.map((g) => getLevel(g));
  const smoothLevels = smoothLevel(grassLevels);
  const adjustedSmoothLevels = adjustLevel(smoothLevels, length);
  const evolutionsSvg = getEvolutions(adjustedSmoothLevels, username);

  res.setHeader("Content-Type", "image/svg+xml");
  res.send(evolutionsSvg);
});

app.all("/", (req, res) =>
  res.send("repo: https://github.com/SatooRu65536/kusa-evolution")
);

app.all("*", (req, res) =>
  res.send(
    "404 not found. repo: https://github.com/SatooRu65536/kusa-evolution"
  )
);

app.listen(port, () => console.log(`listening on port ${port}!`));
