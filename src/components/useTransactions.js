import { useState, useEffect } from 'react';
import { differenceInMilliseconds } from 'date-fns';
import { fetchTransactions } from '../app/fetchTransactions';

const useTransactions = (solanaWallet) => {
    const [walletData, setWalletData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [tokenBalances, setTokenBalances] = useState({});

    const apiKey = process.env.NEXT_PUBLIC_HELIUS_API_KEY;
    const timestamp19Nov2023 = new Date('2023-11-19T00:00:00Z').getTime();

    const cacheKey = `transactions-${solanaWallet}`;
    const cacheTimeKey = `${cacheKey}-timestamp`;

    const tokenMap = {
        'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN': '$JUP',
        'WENWENvqqNya429ubCdR81ZmD69brwQaaBYY6p3LCpk': '$WEN',
        'HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3': '$PYTH',
        'J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn': '$JITO'
    };

    useEffect(() => {
        setWalletData([]);
        setTokenBalances({});
        console.log('Reset walletData and tokenBalances due to solanaWallet change');
    }, [solanaWallet]);

    const parseTransactions = async () => {
        if (isLoading) return;

        try {
            const cachedData = localStorage.getItem(cacheKey);
            const cachedTime = localStorage.getItem(cacheTimeKey);
            const now = new Date().getTime();

            console.log('Now:', now);
            console.log('Cached time:', cachedTime);

            // Verify if cache is valid
            if (cachedData && cachedTime) {
                const parsedCachedTime = parseInt(cachedTime, 10);
                console.log('Parsed Cached Time:', parsedCachedTime);

                const timeDifference = differenceInMilliseconds(now, parsedCachedTime);
                console.log('Time Difference:', timeDifference);

                if (timeDifference < 24 * 60 * 60 * 1000) {
                    const { walletData, tokenBalances } = JSON.parse(cachedData);
                    setWalletData(walletData);
                    setTokenBalances(tokenBalances);
                    console.log("Loaded data from cache");
                    return; // Stop execution here if cache is valid
                }
            }
        } catch (error) {
            console.error('Error reading from cache', error);
            // Handle error or invalidate cache
            localStorage.removeItem(cacheKey);
            localStorage.removeItem(cacheTimeKey);
        }

        setIsLoading(true);

        let lastSignature = null;
        let relevantInfo = [];
        let updatedTokenBalances = { ...tokenBalances };

        while (true) {
            let url = `https://api.helius.xyz/v0/addresses/${solanaWallet}/transactions?api-key=${apiKey}`;
            if (lastSignature) {
                url += `&before=${lastSignature}`;
            }

            try {
                const data = await fetchTransactions(solanaWallet, lastSignature);

                if (data && data.length > 0) {

                    // Verify if PYTH airdrop has been received
                    const pythAirdrop = relevantInfo.find(transaction => {
                        return transaction.description.includes("$PYTH") &&
                            transaction.description.includes("airdropped");
                    });

                    if (pythAirdrop) {
                        console.log("PYTH airdrop received. Stopping further fetch.");
                        break; // Stop fetching transactions
                    }

                    const filteredTransactions = data.filter(transaction => {
                        const transactionTimestamp = transaction.timestamp * 1000;

                        if (transactionTimestamp <= timestamp19Nov2023) {
                            return false; // Exclude transactions on or before 19th November 2023
                        }

                        return transaction.tokenTransfers.some(transfer =>
                            Object.keys(tokenMap).includes(transfer.mint) &&
                            (transfer.fromUserAccount === solanaWallet || transfer.toUserAccount === solanaWallet)
                        ) && transaction.type !== "TOKEN_MINT";
                    });

                    if (filteredTransactions.length === 0) {
                        console.log("No more relevant transactions available. Stopping further fetch.");
                        break; // Stop fetching transactions
                    }

                    const finalFilteredTransactions = filteredTransactions.filter(transaction => transaction.type !== "CREATE_ORDER");

                    relevantInfo = relevantInfo.concat(finalFilteredTransactions.map(transaction => {
                        let description = transaction.description || 'No description';
                        let airdropDetails = {};
                        let swapDetails = {};
                        let transferDetails = {};

                        const tokenTransfers = transaction.tokenTransfers.filter(transfer =>
                            Object.keys(tokenMap).includes(transfer.mint) &&
                            (transfer.fromUserAccount === solanaWallet || transfer.toUserAccount === solanaWallet)
                        );

                        tokenTransfers.forEach(transfer => {
                            const tokenName = tokenMap[transfer.mint] || transfer.mint;

                            if (!updatedTokenBalances[tokenName]) {
                                updatedTokenBalances[tokenName] = 0;
                            }

                            if (transaction.type === 'UNKNOWN' && transfer.toUserAccount === solanaWallet) {
                                // Airdrop
                                updatedTokenBalances[tokenName] += transfer.tokenAmount;
                            } else if (transaction.type === 'SWAP' && transfer.toUserAccount === solanaWallet) {
                                // Swap received
                                updatedTokenBalances[tokenName] += transfer.tokenAmount;
                            } else if (transaction.type === 'SWAP' && transfer.fromUserAccount === solanaWallet) {
                                // Swap sent
                                updatedTokenBalances[tokenName] -= transfer.tokenAmount;
                            } else if (transaction.type === 'TRANSFER' && transfer.toUserAccount === solanaWallet) {
                                // Transfer received
                                updatedTokenBalances[tokenName] += transfer.tokenAmount;
                            } else if (transaction.type === 'TRANSFER' && transfer.fromUserAccount === solanaWallet) {
                                // Transfer sent
                                updatedTokenBalances[tokenName] -= transfer.tokenAmount;
                            } else {
                                console.log("Unknown transaction type: ", transaction.type);
                            }

                            // Airdrops with UNKNOWN type
                            if (transaction.type === 'UNKNOWN' && transfer.toUserAccount === solanaWallet) {
                                description = `Was airdropped ${transfer.tokenAmount} ${tokenName}`;
                                airdropDetails[tokenName] = (airdropDetails[tokenName] || 0) + transfer.tokenAmount;
                            } else if (transaction.type === 'UNKNOWN' && transfer.fromUserAccount === solanaWallet) {
                                description = `Staked ${transfer.tokenAmount} ${tokenName}`;
                                transferDetails = {
                                    sentToken: tokenName,
                                    sentAmount: transfer.tokenAmount,
                                };
                            }
                        });

                        if (transaction.type === 'SWAP') {
                            const swapTransfers = transaction.tokenTransfers;

                            let modifiedDescription = transaction.description.match(/swapped\s.*/i);

                            if (modifiedDescription && modifiedDescription.length > 0) {
                                description = modifiedDescription[0].charAt(0).toUpperCase() + modifiedDescription[0].slice(1);
                            }

                            if (swapTransfers.length >= 2) {
                                let transferGroups = {};

                                swapTransfers.forEach((transfer) => {
                                    if (transfer.tokenAmount !== 0) {
                                        if (transfer.fromUserAccount === solanaWallet || transfer.toUserAccount === solanaWallet) {
                                            const tokenName = tokenMap[transfer.mint] || transfer.mint;

                                            if (!transferGroups[tokenName]) {
                                                transferGroups[tokenName] = [];
                                            }

                                            transferGroups[tokenName].push(transfer);
                                        }
                                    }
                                });

                                let entry, exit;

                                Object.values(transferGroups).forEach((group) => {
                                    group.sort((a, b) => b.tokenAmount - a.tokenAmount);
                                    const selectedTransfer = group[0];

                                    if (!entry) {
                                        entry = {
                                            token: tokenMap[selectedTransfer.mint] || selectedTransfer.mint,
                                            amount: selectedTransfer.tokenAmount,
                                        };
                                        // if entry.token is SOL ('So11111111111111111111111111111111111111112'), multiply entry.amount by 100 to simulate USDC conversion, and change entry.token to USDC ('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v') 
                                        if (entry.token === 'So11111111111111111111111111111111111111112') {
                                            entry.amount *= 100;
                                            entry.token = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
                                        }
                                    } else if (!exit && entry.token !== (tokenMap[selectedTransfer.mint] || selectedTransfer.mint)) {
                                        exit = {
                                            token: tokenMap[selectedTransfer.mint] || selectedTransfer.mint,
                                            amount: selectedTransfer.tokenAmount,
                                        };
                                        // if exit.token is SOL ('So11111111111111111111111111111111111111112'), multiply exit.amount by 100 to simulate USDC conversion, and change exit.token to USDC ('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v') 
                                        if (exit.token === 'So11111111111111111111111111111111111111112') {
                                            exit.amount *= 100;
                                            exit.token = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
                                        }
                                    }
                                });

                                if (entry && exit) {
                                    swapDetails = {
                                        entry,
                                        exit,
                                    };
                                } else {
                                    console.log("Not enough swap transfers found.");
                                }
                            } else {
                                console.log("Not enough swap transfers found.");
                            }
                        }

                        if (transaction.type === 'TRANSFER') {
                            const transferIn = tokenTransfers.find(t => t.toUserAccount === solanaWallet);
                            const transferOut = tokenTransfers.find(t => t.fromUserAccount === solanaWallet);

                            if (transferIn && !transferOut) {
                                description = `Received ${transferIn.tokenAmount} ${tokenMap[transferIn.mint] || transferIn.mint}`;
                                transferDetails = {
                                    receivedToken: tokenMap[transferIn.mint] || transferIn.mint,
                                    receivedAmount: transferIn.tokenAmount,
                                };
                            } else if (transferIn && transferOut) {
                                description = `Sent ${transferOut.tokenAmount} ${tokenMap[transferOut.mint] || transferOut.mint} to ${transferIn.toUserAccount}`;
                                transferDetails = {
                                    sentToken: tokenMap[transferOut.mint] || transferOut.mint,
                                    sentAmount: transferOut.tokenAmount,
                                };
                            } else if (!transferIn && transferOut) {
                                description = `Sent ${transferOut.tokenAmount} ${tokenMap[transferOut.mint] || transferOut.mint} to ${transferOut.toUserAccount}`;
                                transferDetails = {
                                    sentToken: tokenMap[transferOut.mint] || transferOut.mint,
                                    sentAmount: transferOut.tokenAmount,
                                };
                            }
                        }

                        return {
                            description,
                            type: transaction.type,
                            source: transaction.source,
                            timestamp: transaction.timestamp * 1000,
                            signature: transaction.signature,
                            airdropDetails,
                            swapDetails,
                            transferDetails,
                        };
                    }));

                    console.log("Relevant Transaction Details: ", JSON.stringify(relevantInfo, null, 2));

                    lastSignature = data[data.length - 1].signature;
                } else {
                    console.log("No more transactions available.");
                    break;
                }
            } catch (error) {
                console.error('Error fetching transactions:', error);
                break;
            }
        }
        localStorage.setItem(cacheKey, JSON.stringify({ walletData: relevantInfo, tokenBalances: updatedTokenBalances }));
        localStorage.setItem(cacheTimeKey, new Date().getTime().toString());

        setWalletData(relevantInfo);
        setTokenBalances(updatedTokenBalances);
        setIsLoading(false);
    };
    console.log('tokenBalances:', tokenBalances);

    return { parseTransactions, walletData, isLoading, tokenBalances };
};

export default useTransactions;