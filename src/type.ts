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

export type Error = {
  message: string;
  documentation_url: string;
};
