import React, { useState, useEffect } from 'react';
import { useTokenPrices } from './useTokenPrices';

const TokenInfo = ({ transactions, tokenBalances }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [tokenData, setTokenData] = useState({});
  const { prices, isLoading: pricesLoading } = useTokenPrices();

  const tokenNameMappings = {
    "$BOZO": "bozo-collective",
    "$JUP": "jupiter-exchange-solana",
    "$PYTH": "pyth-network",
    "$WEN": "wen-4",
    "$JTO": "jito-governance-token",
  };

  useEffect(() => {
    const calculateTokenData = () => {
      const newTokenData = {};

      transactions.forEach((transaction) => {
        if (transaction.type === 'UNKNOWN' || !transaction.fromUserAccount) {
          // Airdrop
          const tokenName = Object.keys(transaction.airdropDetails)[0];
          const airdropAmount = transaction.airdropDetails[tokenName];

          if (!newTokenData[tokenName]) {
            newTokenData[tokenName] = {
              airdropped: airdropAmount || 0,
              current: tokenBalances[tokenName] || 0,
            };
          } else {
            newTokenData[tokenName].airdropped += airdropAmount || 0;
          }
        }
      });

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
    <div className='flex flex-row space-x-8'>
      {Object.keys(tokenData).map((token) => {
        const { airdropped, current } = tokenData[token];

        if ((airdropped === 0 || isNaN(airdropped)) && (current === 0 || isNaN(current))) {
          return null;
        }

        const tokenNameInPrices = tokenNameMappings[token];

        return (
          <div key={token} className='flex flex-col p-2 bg-white rounded-lg shadow-lg bg-opacity-20'>
            <h3 className='font-bold text-center'>{token}</h3>
            <div>
              Earned : {isNaN(airdropped) ? 0 : airdropped}
            </div>
            <div>
              Hold : {isNaN(current) ? 0 : Math.max(current, 0)}
            </div>
            <div>
              Current Value : {isNaN(current) ? 0 : (Math.max(current, 0) * prices[tokenNameInPrices]?.usd).toFixed(0)} $
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TokenInfo;
