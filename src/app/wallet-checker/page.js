'use client';

import React, { useState } from 'react';
import TransactionList from '../../components/TransactionList';

const WalletChecker = () => {
    const [walletData, setWalletData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [solanaWallet, setSolanaWallet] = useState("");

    const parseTransactions = async () => {

        let lastSignature = null;
        let pythAirdropReceived = false;
        let relevantInfo = [];

        setIsLoading(true);

        const myWallet = solanaWallet;
        const apiKey = "64346ca6-3d02-46b4-9b31-b59eb59dbb57";
        let url = `https://api.helius.xyz/v0/addresses/${myWallet}/transactions?api-key=${apiKey}`;


        const tokenMap = {
            'WENWENvqqNya429ubCdR81ZmD69brwQaaBYY6p3LCpk': '$WEN',
            'HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3': '$PYTH',
            'BoZoQQRAmYkr5iJhqo7DChAs7DPDwEZ5cv1vkYC9yzJG': '$BOZO',
            'J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn': '$JITO'
        };

        while (true) {
            if (lastSignature) {
                url += `&before=${lastSignature}`;
            }

            const response = await fetch(url);
            const data = await response.json();

            if (data && data.length > 0) {

                const filteredTransactions = data.filter(transaction => {
                    return transaction.tokenTransfers.some(transfer =>
                        Object.keys(tokenMap).includes(transfer.mint) &&
                        (transfer.fromUserAccount === myWallet || transfer.toUserAccount === myWallet)
                    ) && transaction.type !== "CREATE_ORDER";
                });

                const bozoAirdropSender = '6esfV2ZaR1YN6arDZATkfqBsSTTgVNhHtBQLtjY2C7Dc';

                relevantInfo = relevantInfo.concat(filteredTransactions.map(transaction => {
                    const tokenTransfers = transaction.tokenTransfers.filter(transfer =>
                        Object.keys(tokenMap).includes(transfer.mint) &&
                        (transfer.fromUserAccount === myWallet || transfer.toUserAccount === myWallet)
                    );

                    let description;
                    if (tokenTransfers.length > 0) {
                        if (tokenTransfers[0].toUserAccount === myWallet) {
                            if (tokenTransfers[0].mint === 'BoZoQQRAmYkr5iJhqo7DChAs7DPDwEZ5cv1vkYC9yzJG' &&
                                tokenTransfers[0].fromUserAccount === bozoAirdropSender) {
                                description = `${myWallet} was airdropped ${tokenTransfers[0].tokenAmount} $BOZO`;
                            } else {
                                description = `${myWallet} was airdropped ${tokenTransfers[0].tokenAmount} ${tokenMap[tokenTransfers[0].mint]}`;
                            }
                        }
                    }
                    description = description || transaction.description || 'No description';

                    return {
                        description: description,
                        type: transaction.type,
                        source: transaction.source,
                        timestamp: new Date(transaction.timestamp * 1000).toLocaleString(),
                        // tokenTransfers: tokenTransfers.map(t => `Token: ${tokenMap[t.mint]}, Amount: ${t.tokenAmount}, From: ${t.fromUserAccount}, To: ${t.toUserAccount}`)
                    };
                }));

                console.log("Relevant Transaction Details: ", JSON.stringify(relevantInfo, null, 2));

                lastSignature = data[data.length - 1].signature;

                // Verify if PYTH airdrop has been received
                const pythAirdrop = relevantInfo.find(transaction => {
                    return transaction.description.includes("$PYTH") &&
                        transaction.description.includes("airdropped");
                });

                if (pythAirdrop) {
                    pythAirdropReceived = true;
                    console.log("PYTH airdrop received. Stopping further fetch.");
                    break; // Stop fetching transactions
                }
            } else {
                console.log("No more transactions available.");
                break;
            }
        }
        setIsLoading(false);

        return relevantInfo;
    };

    const handleCheckClick = () => {
        parseTransactions().then((data) => {
            console.log("Data from parseTransactions:", data);
            setWalletData(data);
        });
    };

    return (
        <main className="flex flex-col min-h-screen p-4 sm:p-8 lg:p-24">
            <div className='mt-20 space-x-3'>
                <h1 className='text-xl font-bold underline decoration-wavy'>Wallet Checker</h1>
                <input
                    type="text"
                    placeholder="Enter Solana Wallet"
                    value={solanaWallet}
                    onChange={(e) => setSolanaWallet(e.target.value)}
                    className='p-2 my-2 text-black bg-white rounded-md'
                />
                <button onClick={handleCheckClick} disabled={isLoading} className='p-2 text-white bg-black rounded-md'>
                    {isLoading ? 'Loading...' : 'Check'}
                </button>
                {walletData.length > 0 && (
                    <TransactionList transactions={walletData} />
                )}
            </div>
        </main>
    );
};

export default WalletChecker;