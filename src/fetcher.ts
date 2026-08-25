import { GitHubResponse } from './type';

// 草を取得する
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

  try {
    const response = await fetch(githubApiEndpoint, {
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
    });

    return (await response.json()) as GitHubResponse;
  } catch (error) {
    return error instanceof Error ? error : new Error(String(error));
  }
}
