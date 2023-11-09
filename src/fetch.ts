import axios from "axios";
import { GitHubResponse } from "./type";

/*
 * 草を取得する
 * @param {string} username - GitHubのユーザー名
 * @param {string} token - GitHubのトークン
 * @return {void}
 */
export async function fetchGrass(
  username: string,
  token: string
): Promise<GitHubResponse | Error> {
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
    .post<GitHubResponse | Error>(
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
