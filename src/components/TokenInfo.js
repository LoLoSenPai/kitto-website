import React, { useState, useEffect } from 'react';
import { useTokenPrices } from './useTokenPrices';

const TokenInfo = ({ transactions, tokenBalances }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [tokenData, setTokenData] = useState({});
  const { prices, isLoading: pricesLoading } = useTokenPrices();

  const tokenInfo = {
    "$BOZO": { id: "bozo-collective", imageUrl: "https://assets.coingecko.com/coins/images/34336/standard/IMG_9610-1.png?1704679690", priceAtAirdrop: 0.000000079 },
    "$JUP": { id: "jupiter-exchange-solana", imageUrl: "logo-jup.jpg", priceAtAirdrop: 0.3 },
    "$PYTH": { id: "pyth-network", imageUrl: "https://assets.coingecko.com/coins/images/31924/standard/pyth.png?1701245725", priceAtAirdrop: 0.67 },
    "$WEN": { id: "wen-4", imageUrl: "https://assets.coingecko.com/coins/images/34856/standard/wen.jpeg?1706281701", priceAtAirdrop: 0.000043 },
    "$JTO": { id: "jito-governance-token", imageUrl: "https://assets.coingecko.com/coins/images/33228/standard/jto.png?1701137022", priceAtAirdrop: 2.06 },
  };

  const tokenCorrespondence = {
    'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': 'USDC',
    'So11111111111111111111111111111111111111112': 'SOL',
  };

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
    const calculateTokenData = () => {
      const newTokenData = {};

      transactions.forEach((transaction) => {

        console.log("Transaction:", transaction);
        console.log("Swap Details Length:", Object.keys(transaction.swapDetails || {}).length);


        if (transaction.swapDetails) {
          console.log("Swap Details:", transaction.swapDetails);
        }
        if (transaction.transferDetails) {
          console.log("Transfer Details:", transaction.transferDetails);
        }

        if (transaction.type === 'UNKNOWN' || !transaction.fromUserAccount) {
          // Airdrop
          const tokenName = Object.keys(transaction.airdropDetails)[0];
          const airdropAmount = transaction.airdropDetails[tokenName];

          if (!newTokenData[tokenName]) {
            newTokenData[tokenName] = {
              airdropped: airdropAmount || 0,
              current: tokenBalances[tokenName] || 0,
              soldTokens: 0,
              swapValue: 0,
            };
          } else {
            newTokenData[tokenName].airdropped += airdropAmount || 0;
          }
        }

        if (transaction.type === 'SWAP' && transaction.swapDetails) {
          console.log("Valid Swap Details:", transaction.swapDetails);
          const { entry, exit } = transaction.swapDetails;

          // Determine the token name from entry or exit
          const soldToken = entry?.token || exit?.token || null;
          const tokenName = tokenInfo[soldToken] ? tokenInfo[soldToken].id : soldToken;

          if (!newTokenData[tokenName]) {
            newTokenData[tokenName] = {
              airdropped: 0,
              current: tokenBalances[tokenName] || 0,
              soldTokens: 0,
              swapValue: 0,
              soldTokenNames: {},
            };
          }

          newTokenData[tokenName].soldTokens += entry?.amount || 0;

          if (exit) {
            const exitTokenAddress = exit.token;
            const exitTokenName = tokenCorrespondence[exitTokenAddress] || exitTokenAddress;
            newTokenData[tokenName].soldTokenNames[exitTokenName] = true;
          }
        }
      });

      Object.keys(newTokenData).forEach((tokenName) => {
        const tokenData = newTokenData[tokenName];
        const tokenNameInPrices = tokenInfo[tokenName] ? tokenInfo[tokenName].id : tokenName;

        let totalSwaps = 0;
        let totalValue = 0;

        transactions.forEach((transaction) => {
          if (
            transaction.type === 'SWAP' &&
            transaction.swapDetails &&
            transaction.swapDetails.exit.token === tokenName
          ) {
            totalSwaps++;

            const exitTokenAddress = transaction.swapDetails.exit.token;
            const exitTokenName = tokenCorrespondence[exitTokenAddress] || exitTokenAddress;

            totalValue += transaction.swapDetails.exit.amount * prices[tokenNameInPrices]?.usd || 0;

            if (!tokenData.soldTokenNames) {
              tokenData.soldTokenNames = {};
            }

            tokenData.soldTokenNames[exitTokenName] = true;
          }
        });

        tokenData.totalSwaps = totalSwaps;
        tokenData.totalValue = totalValue;
      });

      console.log("Final Token Data:", newTokenData);

      setTokenData(newTokenData);
      setIsLoading(false);
    };

    if (!pricesLoading) {
      calculateTokenData();
    }
  }, [transactions, tokenBalances, pricesLoading]);


  if (isLoading || pricesLoading) {
    return <div>Loading...</div>;
  }


  return (
    <div className='w-full max-w-6xl p-5 mx-auto'>
      <div className='overflow-hidden'>
        <div className='grid grid-cols-8 p-2 font-bold text-center'>
          <div>Token</div>
          <div>Tokens Received</div>
          <div>Tokens Sold</div>
          <div>Tokens Held</div>
          <div>Purchase Price</div>
          <div>Current Price</div>
          <div>Current Value</div>
          <div>PnL</div>
        </div>

        <div className='space-y-3'>
          {Object.keys(tokenData).map((token) => {
            const { airdropped, current } = tokenData[token];
            if ((airdropped === 0 || isNaN(airdropped)) && (current === 0 || isNaN(current))) {
              return null;
            }

            const tokenNameInPrices = tokenInfo[token] ? tokenInfo[token].id : token;
            const tokenImageUrl = tokenInfo[token] ? tokenInfo[token].imageUrl : 'https://pbs.twimg.com/profile_images/1755725702005927937/ohQkTn50_400x400.jpg';
            const tokenPriceAtAirdrop = tokenInfo[token] ? tokenInfo[token].priceAtAirdrop : 0;

            const initialValue = airdropped * tokenPriceAtAirdrop;
            const currentValue = airdropped * formatPrice(prices[tokenNameInPrices]?.usd);
            const pnl = currentValue - initialValue;
            const pnlFormatted = pnl >= 0 ? `+${pnl.toFixed(2)}` : pnl.toFixed(2);
            const pnlClass = pnl >= 0 ? 'text-green-500' : 'text-red-500';

            return (
              <div key={token} className='grid grid-cols-8 p-2 text-center bg-white rounded-lg shadow-lg bg-opacity-60'>
                <div className='flex items-center justify-center'>
                  <img src={tokenImageUrl} alt="Logo of the token" className='w-6 h-6 mr-2 rounded-full' />
                  {token}
                </div>
                <div>{isNaN(airdropped) ? 0 : airdropped}</div>
                <div>{isNaN(current) ? 0 : Math.max(current, 0)}</div>
                <div>{isNaN(tokenData[token].soldTokens) ? 0 : tokenData[token].soldTokens}</div>
                <div>{formatPrice(tokenPriceAtAirdrop)}</div>
                <div>${formatPrice(prices[tokenNameInPrices]?.usd)}</div>
                <div>{isNaN(current) ? 0 : (Math.max(current, 0) * prices[tokenNameInPrices]?.usd).toFixed(0)} $</div>
                <div className={`${pnlClass} flex justify-center`}>{pnlFormatted} $</div>
              </div>
            );
          })}
        </div>
      </div>
    </div >
  );
}

export default TokenInfo;