import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { parseISO, formatDistanceToNow } from 'date-fns';

function isValidDate(dateString) {
    const regEx = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/;
    return dateString.match(regEx) != null;
}

function convertToISO(dateStr) {
    try {
        console.log('Received date string:', dateStr);
        // Split the date string into parts
        const [date, time] = dateStr.split(' ');
        const [day, month, year] = date.split('/');
        const [hours, minutes, seconds] = time.split(':');

        const isoString = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}Z`;
        return isoString;
    } catch (error) {
        console.error('Error converting to ISO:', error);
        return null;
    }
}

function parseDate(dateStr) {
    const isoDateStr = convertToISO(dateStr);
    console.log('Converted to ISO:', isoDateStr);
    if (!isoDateStr || !isValidDate(isoDateStr)) {
        console.error('Invalid date string, unable to convert to ISO or invalid ISO format:', dateStr);
        return null;
    }
    return parseISO(isoDateStr);
}

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
                        const date = parseDate(transaction.timestamp);
                        const borderColor = index % 2 === 0 ? 'border-amber-900' : 'border-amber-700';
                        if (!date) {
                            // Handle the error, skip rendering this transaction, or render with a fallback date
                            console.error('Invalid date:', transaction.timestamp);
                            return <div key={index} className='text-red-500'>Invalid date: {transaction.timestamp}</div>;
                        }

                        return (
                            <React.Fragment key={index}>
                                <Link href={`https://solscan.io/tx/${transaction.signature}`} target='_blank' rel='noopener noreferrer'>
                                    <div className='flex items-center justify-between py-4 mx-8 transition-transform duration-200 ease-in-out cursor-pointer hover:scale-105'>
                                        <span className=''>{transaction.description}</span>
                                        <span className=''>{formatDistanceToNow(date, { addSuffix: true })}</span>
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
