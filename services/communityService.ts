
import { supabase } from './supabaseClient';
import { Suggestion } from '../types';

export const fetchSuggestions = async (): Promise<Suggestion[]> => {
    try {
        const { data, error } = await supabase
            .from('suggestions')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) throw error;

        return data.map((item: any) => ({
            id: item.id,
            text: item.content, // Assuming column name is 'content'
            timestamp: new Date(item.created_at).getTime()
        }));
    } catch (e) {
        console.warn("Failed to fetch suggestions from Supabase, returning mock data", e);
        // Fallback/Mock data for demonstration if DB is missing
        return [
            { id: '1', text: 'More events for the 19th century please!', timestamp: Date.now() - 100000 },
            { id: '2', text: 'The Einstein chat is amazing.', timestamp: Date.now() - 500000 },
            { id: '3', text: 'Fix the mobile layout overlap.', timestamp: Date.now() - 1000000 },
        ];
    }
};

export const submitSuggestion = async (text: string): Promise<boolean> => {
    try {
        const { error } = await supabase
            .from('suggestions')
            .insert([{ content: text }]);

        if (error) throw error;
        return true;
    } catch (e) {
        console.error("Failed to submit suggestion", e);
        return false;
    }
};
