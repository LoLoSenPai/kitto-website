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

  const tokenCorrespondence = {
    'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': 'USDC',
    'So11111111111111111111111111111111111111112': 'SOL',
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
          const tokenName = tokenNameMappings[soldToken] || soldToken;

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
        const tokenNameInPrices = tokenNameMappings[tokenName];

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
            <div>
              Total Sold : {isNaN(tokenData[token].soldTokens) ? 0 : tokenData[token].soldTokens}
            </div>
            <div>
              Total Value : {isNaN(tokenData[token].swapValue) ? 0 : tokenData[token].swapValue.toFixed(0)} $
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TokenInfo;