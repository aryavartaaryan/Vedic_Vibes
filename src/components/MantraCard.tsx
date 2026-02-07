import React from 'react';
import { VedicMantra } from '@/data/vedic-mantras';
import styles from './MantraCard.module.css';

interface MantraCardProps {
    mantra: VedicMantra;
    className?: string;
}

export default function MantraCard({ mantra, className }: MantraCardProps) {
    if (!mantra) return null;

    return (
        <div className={`${styles.card} ${className || ''}`}>
            <div className={styles.icon}>🕉️</div>
            <p className={styles.sanskrit}>{mantra.sanskrit}</p>
            <p className={styles.transliteration}>{mantra.transliteration}</p>
            <div className={styles.divider}></div>
            <p className={styles.meaning}>{mantra.meaning}</p>
            <p className={styles.usage}>Usage: {mantra.usage}</p>
        </div>
    );
}
