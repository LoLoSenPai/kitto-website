import { useState, useEffect } from 'react';
import { fetchTokenPrices } from '../app/action';

export const useTokenPrices = () => {
    const [prices, setPrices] = useState({});
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadPrices = async () => {
            try {
                const data = await fetchTokenPrices();
                setPrices(data);
                setIsLoading(false);
                console.log("Token Prices Loaded:", data);
            } catch (error) {
                console.error("Error loading token prices:", error);
                setIsLoading(false);
            }
        };

        loadPrices();
    }, []);

    return { prices, isLoading };
};
