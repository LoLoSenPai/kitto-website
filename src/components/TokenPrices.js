'use client';
import { useState, useEffect } from 'react';

const tokenData = {
    'jupiter-exchange-solana': {
        name: "$JUP",
        imageUrl: "logo-jup.jpg",
    },
    'wen-4': {
        name: "$WEN",
        imageUrl: "https://assets.coingecko.com/coins/images/34856/standard/wen.jpeg?1706281701",
    },
    'pyth-network': {
        name: "$PYTH",
        imageUrl: "https://assets.coingecko.com/coins/images/31924/standard/pyth.png?1701245725",
    },
    'bozo-collective': {
        name: "$BOZO",
        imageUrl: "https://assets.coingecko.com/coins/images/34336/standard/IMG_9610-1.png?1704679690",
    },
    'jito-governance-token': {
        name: "$JTO",
        imageUrl: "https://assets.coingecko.com/coins/images/33228/standard/jto.png?1701137022",
    },
};

const TokenPrices = () => {

    const [prices, setPrices] = useState({});

    useEffect(() => {
        const fetchTokenPrices = async () => {
            const tokenIds = {
                JUP: 'jupiter-exchange-solana',
                WEN: 'wen-4',
                PYTH: 'pyth-network',
                BOZO: 'bozo-collective',
                JITO: 'jito-governance-token'
            };
            const ids = Object.values(tokenIds).join(',');
            const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`;

            try {
                const response = await fetch(url);
                const data = await response.json();
                setPrices(data);
            } catch (error) {
                console.error('Failed to fetch token prices:', error);
            }
        };

        if (typeof window !== "undefined") {
            const savedPrices = localStorage.getItem('tokenPrices');
            if (savedPrices && savedPrices !== "undefined") {
                setPrices(JSON.parse(savedPrices));
            } else {
                fetchTokenPrices();
            }
        }
    }, []);

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

    return (
        <div className="w-full p-4 mx-auto bg-white rounded-lg shadow-lg bg-opacity-20">
            <h2 className="mb-4 text-2xl font-bold text-center text-gray-800">Token Prices</h2>
            <div className="flex flex-wrap items-center justify-around">
                {Object.entries(prices).map(([tokenId, priceData]) => {
                    const tokenInfo = tokenData[tokenId];
                    console.log(`Token Name: ${tokenInfo.name}`);
                    console.log('Price Data:', priceData);

                    return (
                        <div key={tokenId} className="flex flex-col items-center w-full p-4 m-2 rounded-lg md:w-auto">
                            <div className="w-20 h-20 mb-2">
                                <img src={tokenInfo.imageUrl} alt={tokenInfo.name} className="object-cover w-full h-full rounded-full" />
                            </div>
                            <div className="text-lg font-medium text-gray-800">
                                {tokenInfo.name}
                            </div>
                            <div className="text-xl font-semibold text-gray-800">
                                ${formatPrice(priceData?.usd)}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default TokenPrices;