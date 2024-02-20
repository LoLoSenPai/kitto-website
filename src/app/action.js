'use server';

let cache = {
  data: null,
  expiry: Date.now(),
};

const CACHE_DURATION = 3600 * 1000; // 1 hour

export async function fetchTokenPrices() {
  const now = Date.now();
  if (cache.data && typeof cache.expiry === 'number' && now < cache.expiry) {
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
    if (!response.ok) {
      throw new Error('Network response was not ok.');
    }
    const data = await response.json();
    const futureExpiry = new Date(now + CACHE_DURATION);
    if (futureExpiry <= now) {
      throw new Error('Calculated expiry is not in the future. Possible system clock issue.');
    }
    cache = {
      data,
      expiry: futureExpiry.getTime(),
    };
    return data;
  } catch (error) {
    console.error('Failed to fetch token prices:', error);
    // Invalidate cache if fetch failed after expiry
    if (now >= cache.expiry) {
      cache.data = null; // or you might want to keep old data but mark it as stale
    }
    return cache.data || 'Fallback data or error message';
  }
}