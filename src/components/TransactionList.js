import React, { useEffect, useState } from 'react';
import Link from 'next/link';

const TransactionList = ({ transactions }) => {
    const [transactionListData, setTransactionListData] = useState([]);

    useEffect(() => {
        setTransactionListData(transactions);
        console.log(transactions);
        console.log(transactionListData);
    }, [transactions]);

    return (
        <div>
            <h2 className='my-5 text-xl'>Transaction List</h2>
            <ul>
                {transactionListData.map((transaction, index) => (
                    <Link href={`https://solscan.io/tx/${transaction.signature}`} key={index} target='blank'>
                        <li className='p-2 my-3 bg-white rounded-lg backdrop-blur-md bg-opacity-60'>
                            <strong>Description:</strong> {transaction.description}<br />
                            <strong>Timestamp:</strong> {transaction.timestamp}<br />
                        </li>
                    </Link>
                ))}
            </ul>
        </div>
    );
};

export default TransactionList;
