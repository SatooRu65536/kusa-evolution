import { GitHubResponse } from './type';

/*
 * 草を取得する
 * @param {string} username - GitHubのユーザー名
 * @param {string} token - GitHubのトークン
 * @return {void}
 */
export async function fetchGrass(userName: string, token: string): Promise<GitHubResponse | Error> {
  const githubApiEndpoint = 'https://api.github.com/graphql';

  const variables = { userName };
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

  return await fetch(githubApiEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'User-Agent': 'MyCustomUserAgent',
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  })
    .then((response) => response.json())
    .then((data) => data as GitHubResponse)
    .catch((error) => error);
}
