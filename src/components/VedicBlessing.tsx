import { Mantra } from '@/lib/types';
import { Sparkles } from 'lucide-react';
import styles from './VedicBlessing.module.css';

interface VedicBlessingProps {
    mantra: Mantra;
}

export default function VedicBlessing({ mantra }: VedicBlessingProps) {
    return (
        <div className={styles.card}>
            <div className={styles.pattern}></div>
            <span className={styles.label}>वैदिक आशीर्वाद</span>
            <div className={styles.icon}>
                <Sparkles size={24} />
            </div>
            <h3 className={styles.sanskrit}>{mantra.sanskrit}</h3>
            <p className={styles.translation}>&quot;{mantra.meaning}&quot;</p>
        </div>
    );
}
