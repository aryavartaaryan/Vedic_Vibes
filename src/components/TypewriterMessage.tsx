import React, { useState, useEffect, useMemo } from 'react';

interface TypewriterMessageProps {
    content: string;
    onComplete?: () => void;
    onUpdate?: () => void;
    speed?: number;
}

/** Split string into grapheme clusters (one "character" as seen by the user). Prevents Devanagari/Indic and emoji from breaking when typing character-by-character. */
function getGraphemeClusters(text: string): string[] {
    if (typeof Intl !== 'undefined' && Intl.Segmenter) {
        try {
            // Use 'hi' for Devanagari/Hindi so base + vowel signs stay one grapheme
            const segmenter = new Intl.Segmenter('hi', { granularity: 'grapheme' });
            return Array.from(segmenter.segment(text)).map((s) => s.segment);
        } catch {
            // fallback
        }
    }
    // Fallback: split by code point (keeps base + combining marks as separate items; better than charAt for surrogate pairs)
    return Array.from(text);
}

const TypewriterMessage: React.FC<TypewriterMessageProps> = ({ content, onComplete, onUpdate, speed = 30 }) => {
    const [displayedContent, setDisplayedContent] = useState('');
    const [isComplete, setIsComplete] = useState(false);

    // Memoize graphemes to prevent re-calculation on every render
    const graphemes = useMemo(() => getGraphemeClusters(content || ''), [content]);

    useEffect(() => {
        // Reset state when content changes
        setDisplayedContent('');
        setIsComplete(false);

        if (!content) return;

        let i = 0;
        const timer = setInterval(() => {
            if (i < graphemes.length) {
                setDisplayedContent((prev) => prev + graphemes[i]);
                i++;
                if (onUpdate) onUpdate();
            } else {
                clearInterval(timer);
                setIsComplete(true);
                if (onComplete) onComplete();
            }
        }, speed);

        return () => clearInterval(timer);
    }, [content, graphemes, speed, onComplete, onUpdate]);

    if (!content) return null;

    // Once typing is complete, render the full original string to ensure 
    // perfect ligature rendering and text shaping (especially for Hindi)
    return <>{isComplete ? content : displayedContent}</>;
};

export default TypewriterMessage;
