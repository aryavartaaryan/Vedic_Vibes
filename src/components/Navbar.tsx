'use client';

import Link from 'next/link';
import { Search, Flame, User, Sparkles, Leaf, Home } from 'lucide-react';
import styles from './Navbar.module.css';

export default function Navbar() {
    return (
        <nav className={styles.navbar}>
            <Link href="/" className={styles.logoLink}>
                <Flame size={24} color="var(--sacred-kumkum)" fill="var(--sacred-kumkum)" />
                <span>VEDICVIBES</span>
            </Link>

            <div className={styles.navLinks}>
                <Link href="/" className={styles.navLink}>
                    <Home size={16} style={{ display: 'inline', marginRight: '4px', color: 'var(--primary-gold)' }} />
                    Praramabh
                </Link>
                <Link href="/vedic-rasoi" className={styles.navLink}>
                    <Sparkles size={16} style={{ display: 'inline', marginRight: '4px', color: 'var(--primary-gold)' }} />
                    The Vedic Rasoi
                </Link>
                <Link href="/healthy" className={styles.navLink}>Healthy Living</Link>
                <Link href="/vaidya-sharanam" className={styles.navLink}>
                    <Leaf size={16} style={{ display: 'inline', marginRight: '4px', color: 'var(--primary-gold)' }} />
                    Rishi Sharanam
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
