'use client';

import React, { useState } from 'react';
import { toast } from 'react-toastify';
import TransactionList from '../../components/TransactionList';
import TokenInfo from "../../components/TokenInfo";
import useTransactions from "../../components/useTransactions";
import { useTokenPrices } from "../../components/useTokenPrices";

const WalletChecker = () => {
    const [solanaWallet, setSolanaWallet] = useState("");
    const [activeTab, setActiveTab] = useState('Portfolio');
    const { parseTransactions, walletData, isLoading, tokenBalances } = useTransactions(solanaWallet);
    const { prices, isLoading: pricesLoading } = useTokenPrices();

    const handleCheckClick = async () => {
        if (solanaWallet.trim()) {
            parseTransactions();
            toast.info("Data will be cached for 24 hours to minimize API calls.", {
                position: "bottom-center",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
        }
    };

    return (
        <main className="flex flex-col min-h-screen p-4 space-y-5 sm:p-8 lg:p-24">
            <div className='flex items-center justify-center pt-4 space-x-2'>
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

            {/* TABS */}
            <div className="flex justify-center">
                <button
                    className={`px-4 ${activeTab === 'Portfolio' ? 'border-b-[3px] border-amber-900' : ''}`}
                    onClick={() => setActiveTab('Portfolio')}
                >
                    Portfolio
                </button>
                <button
                    className={`px-4 ${activeTab === 'Airdrops' ? 'border-b-[3px] border-amber-900' : ''}`}
                    onClick={() => setActiveTab('Airdrops')}
                >
                    Airdrops
                </button>
            </div>

            {/* TABS CONTENT */}
            {!isLoading && walletData.length > 0 && !pricesLoading && (
                <div>
                    <TokenInfo transactions={walletData} tokenBalances={tokenBalances} mode={activeTab} />
                    {activeTab === 'Portfolio' && <TransactionList transactions={walletData} />}
                </div>
            )}

        </main>
    );
};

export default WalletChecker;