import React, { useEffect, useState } from 'react';

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
                    <li key={index} className='p-2 my-3 bg-white rounded-lg backdrop-blur-md bg-opacity-60'>
                        <strong>Description:</strong> {transaction.description}<br />
                        <strong>Timestamp:</strong> {transaction.timestamp}<br />
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default TransactionList;
