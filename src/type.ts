export type Date = `${number}-${number}-${number}`;

export type GrassWeek = {
  contributionDays: {
    contributionCount: number;
    date: Date;
  }[];
};

export type Grass = {
  data: {
    user: {
      contributionsCollection: {
        contributionCalendar: {
          totalContributions: number;
          weeks: GrassWeek[];
        };
      };
    };
  };
};

export type GitHubError = {
  data: { user: null };
  errors: {
    type: string;
    path: string[];
    locations: string[];
    message: string;
  }[];
};

export type Error = {
  message: string;
  documentation_url: string;
};
