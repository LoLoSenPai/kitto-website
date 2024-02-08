import { useState } from 'react';

const useTransactions = (solanaWallet) => {
    const [walletData, setWalletData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [tokenBalances, setTokenBalances] = useState({});

    const apiKey = process.env.NEXT_PUBLIC_HELIUS_API_KEY;
    const timestamp19Nov2023 = new Date('2023-11-19T00:00:00Z').getTime();
    const bozoAirdropSender = '6esfV2ZaR1YN6arDZATkfqBsSTTgVNhHtBQLtjY2C7Dc';

    const tokenMap = {
        'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN': '$JUP',
        'WENWENvqqNya429ubCdR81ZmD69brwQaaBYY6p3LCpk': '$WEN',
        'HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3': '$PYTH',
        'BoZoQQRAmYkr5iJhqo7DChAs7DPDwEZ5cv1vkYC9yzJG': '$BOZO',
        'J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn': '$JITO'
    };

    const parseTransactions = async () => {

        let lastSignature = null;
        let relevantInfo = [];

        setIsLoading(true);

        let url = `https://api.helius.xyz/v0/addresses/${solanaWallet}/transactions?api-key=${apiKey}`;




        while (true) {
            if (lastSignature) {
                url += `&before=${lastSignature}`;
            }

            const response = await fetch(url);
            const data = await response.json();

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
                    // console.log("Transaction Timestamp: ", new Date(transactionTimestamp).toLocaleString());

                    if (transactionTimestamp <= timestamp19Nov2023) {
                        return false; // Exclude transactions on or before 19th November 2023
                    }

                    return transaction.tokenTransfers.some(transfer =>
                        Object.keys(tokenMap).includes(transfer.mint) &&
                        (transfer.fromUserAccount === solanaWallet || transfer.toUserAccount === solanaWallet)
                    ) && transaction.type !== "CREATE_ORDER";
                });

                if (filteredTransactions.length === 0) {
                    console.log("No more relevant transactions available. Stopping further fetch.");
                    break; // Stop fetching transactions
                }



                relevantInfo = relevantInfo.concat(filteredTransactions.map(transaction => {
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

                        if (!tokenBalances[tokenName]) {
                            tokenBalances[tokenName] = 0;
                        }

                        if (transaction.type === 'UNKNOWN' && transfer.toUserAccount === solanaWallet) {
                            // Airdrop
                            tokenBalances[tokenName] += transfer.tokenAmount;
                        } else if (transaction.type === 'SWAP' && transfer.fromUserAccount === solanaWallet) {
                            // Swap exit
                            tokenBalances[tokenName] -= transfer.tokenAmount;
                        } else if (transaction.type === 'SWAP' && transfer.toUserAccount === solanaWallet) {
                            // Swap entry
                            tokenBalances[tokenName] += transfer.tokenAmount;
                        } else if (transaction.type === 'TRANSFER' && transfer.toUserAccount === solanaWallet) {
                            // Transfer received
                            tokenBalances[tokenName] += transfer.tokenAmount;
                        } else if (transaction.type === 'TRANSFER' && transfer.fromUserAccount === solanaWallet) {
                            // Transfer sent
                            tokenBalances[tokenName] -= transfer.tokenAmount;
                        } else {
                            console.log("Unknown transaction type: ", transaction.type);
                        }

                        // Bozo Airdrop
                        if ((transaction.type === 'TRANSFER' && transfer.fromUserAccount === bozoAirdropSender) &&
                            transfer.mint === 'BoZoQQRAmYkr5iJhqo7DChAs7DPDwEZ5cv1vkYC9yzJG') {
                            // C'est un airdrop BOZO
                            description = `${solanaWallet} was airdropped ${transfer.tokenAmount} $BOZO`;
                            airdropDetails['$BOZO'] = (airdropDetails['$BOZO'] || 0) + transfer.tokenAmount;
                        }

                        // Other Airdrops with UNKNOWN type
                        if (transaction.type === 'UNKNOWN' && transfer.toUserAccount === solanaWallet) {
                            description = `${solanaWallet} was airdropped ${transfer.tokenAmount} ${tokenName}`;
                            airdropDetails[tokenName] = (airdropDetails[tokenName] || 0) + transfer.tokenAmount;
                        }
                    });

                    if (transaction.type === 'SWAP') {
                        const swapTransfers = transaction.tokenTransfers;

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
                                } else if (!exit && entry.token !== (tokenMap[selectedTransfer.mint] || selectedTransfer.mint)) {
                                    exit = {
                                        token: tokenMap[selectedTransfer.mint] || selectedTransfer.mint,
                                        amount: selectedTransfer.tokenAmount,
                                    };
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
                            if (transferIn.fromUserAccount === bozoAirdropSender) {
                                description = `${solanaWallet} was airdropped ${transferIn.tokenAmount} $BOZO`;
                            } else {
                                description = `Received ${transferIn.tokenAmount} ${tokenMap[transferIn.mint] || transferIn.mint}`;
                            }
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
                        timestamp: new Date(transaction.timestamp * 1000).toLocaleString(),
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
        }
        setTokenBalances({ ...tokenBalances });
        setIsLoading(false);
        setWalletData(relevantInfo);
    };

    return { parseTransactions, walletData, isLoading, tokenBalances };
};

export default useTransactions;