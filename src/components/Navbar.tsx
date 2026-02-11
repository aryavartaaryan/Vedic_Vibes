'use client';

import Link from 'next/link';
import { Search, Flame, User, Sparkles, Leaf, Home, MessageCircle } from 'lucide-react';
import styles from './Navbar.module.css';

export default function Navbar() {
    return (
        <nav className={styles.navbar}>
            <Link href="/" className={styles.logoLink}>
                <Flame size={24} color="var(--sacred-kumkum)" fill="var(--sacred-kumkum)" />
                <span>वैदिक वाइब्स</span>
            </Link>

            <div className={styles.navLinks}>
                <Link href="/" className={styles.navLink}>
                    <Home size={16} style={{ display: 'inline', marginRight: '4px', color: 'var(--primary-gold)' }} />
                    प्रारम्भ
                </Link>
                <Link href="/vedic-rasoi" className={styles.navLink}>
                    <Sparkles size={16} style={{ display: 'inline', marginRight: '4px', color: 'var(--primary-gold)' }} />
                    <span>
                        आयुर्वेदिक भोजन परामर्श
                        <span style={{ display: 'block', fontSize: '0.65em', color: 'var(--primary-gold)', marginTop: '-2px', fontStyle: 'italic' }}>
                            (अन्नपूर्णा अनुग्रह)
                        </span>
                    </span>
                </Link>
                <Link href="/acharya-samvad" className={styles.navLink}>
                    <MessageCircle size={16} style={{ display: 'inline', marginRight: '4px', color: 'var(--primary-gold)' }} />
                    आचार्य संवाद
                </Link>
                <Link href="/dhyan-kshetra" className={`${styles.navLink} ${styles.dhyanLink}`}>
                    <Leaf size={16} style={{ display: 'inline', marginRight: '4px', color: '#FF9933' }} />
                    ध्यान कक्षा
                </Link>
            </div>

            <div className={styles.actions}>
                <button className={styles.profileBtn} aria-label="Profile">
                    <User size={18} />
                </button>
            </div>
        </nav>
    );
}
