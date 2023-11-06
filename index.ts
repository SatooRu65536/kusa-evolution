import express from "express";
import {
  formatGrasse,
  getEvolutions,
  getGrass,
  getLevel,
  normalize,
} from "./src/util";
import "dotenv/config";

const app = express();
const port = 3000;

app.get("/evolution", async (req, res) => {
  const token = process.env.GITHUB_TOKEN;
  const username = req.query.username as string | undefined;

  if (!token) return res.status(500).send("GITHUB_TOKEN is not set");
  if (!username) return res.status(400).send("username is not set");

  const grassRes = await getGrass(username, token);
  if ("message" in grassRes) return res.status(500).send(grassRes.message);

  const weeklyGrass = formatGrasse(grassRes);
  const normalizedGrass = normalize(weeklyGrass);
  const grassLevels = normalizedGrass.map((g) => getLevel(g));
  const evolutionsSvg = getEvolutions(grassLevels);

  res.setHeader("Content-Type", "image/svg+xml");

  res.send(evolutionsSvg);
});

app.listen(port, () => console.log(`listening on port ${port}!`));
