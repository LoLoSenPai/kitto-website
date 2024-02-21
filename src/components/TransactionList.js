import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

const TransactionList = ({ transactions }) => {
    const [transactionListData, setTransactionListData] = useState([]);

    useEffect(() => {
        setTransactionListData(transactions);
    }, [transactions]);

    return (
        <div className='flex flex-col items-center px-4'>
            <div className='w-full max-w-6xl mx-auto'>
                <h2 className='my-5 ml-20 text-xl'>Transaction List</h2>
                <div className='w-full'>
                    {transactionListData.map((transaction, index) => {
                        const date = new Date(transaction.timestamp);
                        const distanceToNow = formatDistanceToNow(date, { addSuffix: true });
                        const borderColor = index % 2 === 0 ? 'border-amber-900' : 'border-amber-700';
                        if (!date) {
                            // Handle the error, skip rendering this transaction, or render with a fallback date
                            console.error('Invalid date:', transaction.timestamp);
                            return <div key={index} className='text-red-500'>Invalid date: {transaction.timestamp}</div>;
                        }

                        return (
                            <React.Fragment key={index}>
                                <Link href={`https://solscan.io/tx/${transaction.signature}`} target='_blank' rel='noopener noreferrer'>
                                    <div className='flex flex-col justify-between py-4 mx-8 text-sm transition-transform duration-200 ease-in-out cursor-pointer md:items-center md:flex-row md:text-md lg:text-md xl:text-lg hover:scale-105'>
                                        <span className=''>{transaction.description}</span>
                                        <span className='font-bold md:font-normal'>{distanceToNow}</span>
                                    </div>
                                </Link>
                                {index < transactionListData.length - 1 && (
                                    <hr className={`${borderColor} border-t-1`} />
                                )}
                            </React.Fragment>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default TransactionList;
