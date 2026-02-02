import { Chapter, quranAPI } from '@/utils/quran-api';
import { useEffect, useState } from 'react';

export function useQuranChapters() {
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadChapters();
    }, []);

    const loadChapters = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await quranAPI.getChapters();
            if (data.length > 0) {
                setChapters(data);
            } else {
                setError('Failed to load chapters');
            }
        } catch (err) {
            setError('An error occurred while loading chapters');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return {
        chapters,
        isLoading,
        error,
        refetch: loadChapters
    };
}
