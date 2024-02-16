'use server';

let cache = {
  data: null,
  expiry: Date.now(),
};

const CACHE_DURATION = 3600 * 1000; // 1 hour

export async function fetchTokenPrices() {
  if (cache.data && Date.now() < cache.expiry) {
    console.log('Serving from cache');
    return cache.data;
  }

  console.log('Fetching new data');
  const tokenIds = {
    JUP: 'jupiter-exchange-solana',
    WEN: 'wen-4',
    PYTH: 'pyth-network',
    JITO: 'jito-governance-token',
  };
  const ids = Object.values(tokenIds).join(',');
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    cache = {
      data,
      expiry: Date.now() + CACHE_DURATION,
    };
    return data;
  } catch (error) {
    console.error('Failed to fetch token prices:', error);
    // Serve stale data if available
    return cache.data;
  }
};
