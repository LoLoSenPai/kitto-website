'use client';

import React, { useState } from 'react';
import TransactionList from '../../components/TransactionList';
// import TokenPrices from "../../components/TokenPrices";
import TokenInfo from "../../components/TokenInfo";
import useTransactions from "../../components/useTransactions";
import { useTokenPrices } from "../../components/useTokenPrices";

const WalletChecker = () => {
    const [solanaWallet, setSolanaWallet] = useState("");
    const { parseTransactions, walletData, isLoading, tokenBalances } = useTransactions(solanaWallet);
    const { prices, isLoading: pricesLoading } = useTokenPrices();

    const handleCheckClick = () => {
        parseTransactions();
    };

    return (
        <main className="flex flex-col min-h-screen p-4 space-y-5 bg-img sm:p-8 lg:p-24">
            <div className='flex items-center justify-center space-x-2'>
                <input
                    type="text"
                    placeholder="Enter Solana Wallet"
                    value={solanaWallet}
                    onChange={(e) => setSolanaWallet(e.target.value)}
                    className='p-2 my-2 text-black bg-white rounded-md'
                />
                <button onClick={handleCheckClick} disabled={isLoading} className='p-2 text-white bg-black rounded w-28'>
                    {isLoading ? 'Loading...' : 'Check'}
                </button>
            </div>
            <div className='mt-20 space-x-3'>
                {!isLoading && walletData.length > 0 && !pricesLoading && (
                    <div className='space-y-10'>
                        <TokenInfo transactions={walletData} tokenBalances={tokenBalances} />
                        <TransactionList transactions={walletData} />
                    </div>
                )}
            </div>
        </main>
    );
};

export default WalletChecker;