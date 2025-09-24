export type PortfolioEntry = {
  symbol: string;
  shares: number;
  avgPrice: number;
};

export type PortfolioItem = PortfolioEntry & {
  id: string;
};


