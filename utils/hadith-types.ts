import { Hadith } from './hadith-settings';

export const HADITH_API_KEY = '$2y$10$Mya0JReiVpQA0PbWJXJ4hoRCoYM3854wghdyNwwgAlLPQaurclO6';

export interface Chapter {
    id: number;
    chapterNumber: string;
    chapterEnglish: string;
    chapterArabic: string;
    bookSlug: string;
}

export interface HadithApiResponse {
    status: number;
    message: string;
    hadiths: {
        current_page: number;
        data: Hadith[];
        last_page: number;
        total: number;
    };
}

export interface ChapterApiResponse {
    status: number;
    message: string;
    chapters: Chapter[];
}
