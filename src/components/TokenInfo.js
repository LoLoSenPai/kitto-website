import React, { useState, useEffect } from 'react';
import { useTokenPrices } from './useTokenPrices';

const TokenInfo = ({ transactions, tokenBalances, mode }) => {
  console.log('Token Balances at TokenInfo start:', tokenBalances);

  const [isLoading, setIsLoading] = useState(true);
  const [tokenData, setTokenData] = useState({});
  const { prices, isLoading: pricesLoading } = useTokenPrices();

  const tokenInfo = {
    "$JUP": { id: "jupiter-exchange-solana", imageUrl: "logo-jup.jpg", priceAtAirdrop: 0.3 },
    "$PYTH": { id: "pyth-network", imageUrl: "https://assets.coingecko.com/coins/images/31924/standard/pyth.png?1701245725", priceAtAirdrop: 0.3 },
    "$WEN": { id: "wen-4", imageUrl: "https://assets.coingecko.com/coins/images/34856/standard/wen.jpeg?1706281701", priceAtAirdrop: 0.000043 },
    "$JTO": { id: "jito-governance-token", imageUrl: "https://assets.coingecko.com/coins/images/33228/standard/jto.png?1701137022", priceAtAirdrop: 2.06 },
  };

  const usdcId = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';

  const formatPrice = (price) => {
    const numberPrice = parseFloat(price);
    if (isNaN(numberPrice)) {
      return 'N/A';
    }
    if (numberPrice >= 1) {
      return numberPrice.toFixed(2);
    } else if (numberPrice >= 0.01) {
      return numberPrice.toFixed(2);
    } else if (numberPrice >= 0.000001) {
      return numberPrice.toFixed(6);
    } else {
      return numberPrice.toFixed(9);
    }
  };

  useEffect(() => {
    const newTokenData = {};

    const trackedTokens = ['$JUP', '$WEN', '$JTO', '$PYTH'];
    trackedTokens.forEach(token => {
      newTokenData[token] = {
        airdropped: 0,
        current: tokenBalances[token] || 0,
        boughtAmount: 0,
        boughtTotalCost: 0,
        soldAmount: 0,
        soldTotalRevenue: 0,
      };
    });

    transactions.forEach((transaction) => {

      console.log("Transaction:", transaction);

      if (transaction.type === 'UNKNOWN' && transaction.airdropDetails) {
        Object.entries(transaction.airdropDetails).forEach(([tokenKey, amount]) => {
          if (newTokenData[tokenKey]) {
            newTokenData[tokenKey].airdropped += amount;
          }
        });
      }

      // Swaps
      if (transaction.type === 'SWAP' && transaction.swapDetails) {
        const { entry, exit } = transaction.swapDetails;

        if (newTokenData[exit.token]) {
          newTokenData[exit.token].boughtAmount += exit.amount;
          newTokenData[exit.token].boughtTotalCost += (entry.amount);
        }

        if (newTokenData[entry.token]) {
          newTokenData[entry.token].soldAmount += entry.amount;
          newTokenData[entry.token].soldTotalRevenue += (exit.amount);
        }
      }
    });

    setTokenData(newTokenData);
    console.log('newTokenData:', newTokenData);
    setIsLoading(false);
  }, [transactions, tokenBalances, pricesLoading]);


  const gridClass = mode === "Portfolio" ? "grid-cols-5" : "grid-cols-4";

  if (isLoading || pricesLoading) {
    return <div>Loading...</div>;
  }


  return (
    <div className='w-full max-w-6xl p-5 mx-auto'>
      <div className='overflow-hidden'>
        {/* HEADER */}
        <div className={`grid ${gridClass} p-2 font-bold text-center`}>
          <div>Token</div>
          <div>{mode === "Airdrops" ? "Tokens Received" : "Tokens Held"}</div>
          {mode === "Portfolio" && <div>Airdrop Price</div>}
          <div>Current Price</div>
          <div>{mode === "Airdrops" ? "Total Value" : "PnL"}</div>
        </div>

        {/* ROWS */}
        <div className='space-y-3'>
          {Object.keys(tokenData).map((token) => {
            const { airdropped, current, boughtAmount, boughtTotalCost, soldAmount, soldTotalRevenue } = tokenData[token];
            if ((airdropped === 0 || isNaN(airdropped)) && (current === 0 || isNaN(current))) {
              return null;
            }

            const tokenNameInPrices = tokenInfo[token] ? tokenInfo[token].id : token;
            const tokenImageUrl = tokenInfo[token] ? tokenInfo[token].imageUrl : 'https://pbs.twimg.com/profile_images/1755725702005927937/ohQkTn50_400x400.jpg';
            const tokenPriceAtAirdrop = tokenInfo[token] ? tokenInfo[token].priceAtAirdrop : 0;

            const currentPrice = prices[tokenNameInPrices]?.usd || 0;

            const initialValueAirdropped = airdropped * tokenPriceAtAirdrop;
            const currentValueAirdropped = airdropped * currentPrice;
            const pnlAirdropped = currentValueAirdropped - initialValueAirdropped;

            const averageBuyPrice = boughtAmount > 0 ? boughtTotalCost / boughtAmount : 0;
            const pnlFromBuying = boughtAmount * (currentPrice - averageBuyPrice);
        
            const averageSellPrice = soldAmount > 0 ? soldTotalRevenue / soldAmount : 0;
            const pnlFromSelling = soldAmount * (averageSellPrice - tokenPriceAtAirdrop);

            const totalPnL = pnlAirdropped + pnlFromBuying + pnlFromSelling;

            const pnlFormatted = totalPnL >= 0 ? `+${totalPnL.toFixed(2)}` : totalPnL.toFixed(2);
            const pnlClass = mode === "Portfolio" ? (totalPnL >= 0 ? 'text-green-500' : 'text-red-500') : 'text-green-500';

            return (
              <div key={token} className={`grid ${gridClass} p-2 text-center bg-white rounded-lg shadow-lg bg-opacity-60`}>
                <div className='flex items-center justify-center'>
                  <img src={tokenImageUrl} alt="Logo of the token" className='w-6 h-6 mr-2 rounded-full' />
                  {token}
                </div>
                <div>{mode === "Airdrops" ? airdropped : Math.max(current, 0)}</div>
                {mode === "Portfolio" && <div>{formatPrice(tokenPriceAtAirdrop)}</div>}
                <div>${formatPrice(prices[tokenNameInPrices]?.usd)}</div>
                <div className={`${pnlClass} flex justify-center`}>
                  {mode === "Airdrops" ? `$${currentValueAirdropped.toFixed(2)}` : `${pnlFormatted} $`}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div >
  );
}

export default TokenInfo;