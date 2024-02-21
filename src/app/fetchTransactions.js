'use server';

export async function fetchTransactions(solanaWallet, lastSignature = '') {
  const queryParams = new URLSearchParams({ solanaWallet });
  if (lastSignature) queryParams.append('before', lastSignature);

  const url = `https://api.helius.xyz/v0/addresses/${solanaWallet}/transactions?api-key=${process.env.HELIUS_API_KEY}&${queryParams}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching transactions:', error);
    throw error; // Rethrow the error so the caller can handle it
  }
}
