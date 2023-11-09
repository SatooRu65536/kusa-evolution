export type Date = `${number}-${number}-${number}`;

export type GrassWeek = {
  contributionDays: {
    contributionCount: number;
    date: Date;
  }[];
};

export type Grass = {
  contributionCalendar: {
    totalContributions: number;
    weeks: GrassWeek[];
  };
};

export type GitHubSuccessResponse = {
  data: {
    user: {
      contributionsCollection: Grass;
    };
  };
};

export type GitHubErrorResponse = {
  data: {
    user: null;
  };
  errors: {
    type: string;
    path: string[];
    locations: string[];
    message: string;
  }[];
};

export type GitHubResponse = GitHubSuccessResponse | GitHubErrorResponse;

export type Error = {
  message: string;
  documentation_url: string;
};
