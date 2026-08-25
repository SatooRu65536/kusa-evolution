export type DateString = `${number}-${number}-${number}`;

export interface GrassWeek {
  contributionDays: {
    contributionCount: number;
    date: DateString;
  }[];
}

export interface Grass {
  contributionCalendar: {
    totalContributions: number;
    weeks: GrassWeek[];
  };
}

export interface GitHubSuccessResponse {
  data: {
    user: {
      contributionsCollection: Grass;
    };
  };
}

export interface GitHubErrorResponse {
  data: {
    user: null;
  };
  errors: {
    type: string;
    path: string[];
    locations: string[];
    message: string;
  }[];
}

export interface GitHubApiError {
  message: string;
  documentation_url: string;
}

export type GitHubResponse = GitHubSuccessResponse | GitHubErrorResponse | GitHubApiError;
