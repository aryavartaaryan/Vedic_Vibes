'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Flame, User, Sparkles, Leaf, Home, MessageCircle, Menu, X } from 'lucide-react';
import styles from './Navbar.module.css';

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Lock body scroll when menu is open
    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isMenuOpen]);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
    const closeMenu = () => setIsMenuOpen(false);

    return (
        <nav className={styles.navbar}>
            <div className={styles.navHeader}>
                <Link href="/" className={styles.logoLink} onClick={closeMenu}>
                    <Flame size={24} color="var(--sacred-kumkum)" fill="var(--sacred-kumkum)" />
                    <span>Pranav</span>
                </Link>

                <button
                    className={styles.hamburgerBtn}
                    onClick={toggleMenu}
                    aria-label="Toggle menu"
                >
                    {isMenuOpen ? <X size={28} color="#F3E5AB" /> : <Menu size={28} color="#F3E5AB" />}
                </button>
            </div>

            {/* Desktop Links */}
            <div className={`${styles.navLinks} ${styles.desktopOnly}`}>
                <Link href="/" className={styles.navLink}>
                    <Home size={16} style={{ display: 'inline', marginRight: '4px', color: 'var(--primary-gold)' }} />
                    प्रारम्भ
                </Link>
                <Link href="/vedic-rasoi" className={styles.navLink}>
                    <Sparkles size={16} style={{ display: 'inline', marginRight: '4px', color: 'var(--primary-gold)' }} />
                    <span>
                        आयुर्वेदिक भोजन
                        <span style={{ display: 'block', fontSize: '0.65em', color: 'var(--primary-gold)', marginTop: '-2px', fontStyle: 'italic' }}>
                            (अन्नपूर्णा)
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

            <div className={`${styles.actions} ${styles.desktopOnly}`}>
                <button className={styles.profileBtn} aria-label="Profile">
                    <User size={18} />
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            <div className={`${styles.mobileMenuOverlay} ${isMenuOpen ? styles.open : ''}`}>
                <div className={styles.mobileLinks}>
                    <Link href="/" className={styles.mobileLink} onClick={closeMenu}>
                        <Home size={20} /> प्रारम्भ
                    </Link>
                    <Link href="/vedic-rasoi" className={styles.mobileLink} onClick={closeMenu}>
                        <Sparkles size={20} /> भोजन परामर्श (अन्नपूर्णा)
                    </Link>
                    <Link href="/acharya-samvad" className={styles.mobileLink} onClick={closeMenu}>
                        <MessageCircle size={20} /> आचार्य संवाद
                    </Link>
                    <Link href="/dhyan-kshetra" className={`${styles.mobileLink} ${styles.dhyanMobileLink}`} onClick={closeMenu}>
                        <Leaf size={20} /> ध्यान कक्षा
                    </Link>
                </div>
            </div>
        </nav>
    );
}
