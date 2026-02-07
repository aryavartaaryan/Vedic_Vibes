'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import GayatriMantraSection from '@/components/GayatriMantraSection/GayatriMantraSection';
import PranicPathSection from '@/components/PranicPathSection/PranicPathSection';
import VoiceCallModal from '@/components/VoiceCallModal';
import styles from './page.module.css';

export default function Home() {
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);

  const handleTalkToUs = () => {
    setIsCallModalOpen(true);
  };

  return (
    <main className={styles.main}>
      <Navbar />

      {/* Hero Section: Modern Digital Gurukul */}
      <section className={styles.hero}>
        {/* Architecture & Atmosphere Layers */}
        <div className={styles.archwayFrame}></div>
        <div className={styles.sriYantraBg}></div>

        <div className={styles.godRayContainer}>
          <div className={styles.godRay}></div>
          <div className={styles.godRay} style={{ '--r': '15deg' } as React.CSSProperties}></div>
          <div className={styles.godRay} style={{ '--r': '-15deg' } as React.CSSProperties}></div>
        </div>

        <div className={styles.mistContainer}>
          <div className={styles.mistLayer}></div>
        </div>

        {/* Content */}
        <div className={styles.heroContent}>
          <div className={styles.omSymbol}>🕉</div>
          <h1 className={styles.heroTitle}>Find stillness in the wisdom of the ages.</h1>
          <p className={styles.heroSubtitle}>
            We bring the hallowed knowledge of the Great Rishis to your fingertips, offering a path to eternal youth through the balance of mind, body, and spirit.
            Rejuvenate your essence, brighten your inner glow, and embrace a life of serenity and strength.
          </p>

          <div className={styles.scrollButtonWrapper}>
            <button onClick={handleTalkToUs} className={styles.ctaButton}>
              Talk To Us
            </button>
          </div>
        </div>
      </section>

      {/* Daily Wisdom Section: Immersive Gayatri Mantra */}
      <div className={styles.fadeSeparator}></div>
      <GayatriMantraSection />

      {/* Pranic Path Section: Vedic-Zen Fusion */}
      <div className={styles.fadeSeparator}></div>
      <PranicPathSection />

      {/* Rishi Sharanam: The Digital Ashram */}
      <div className={styles.fadeSeparator}></div>
      <section className={styles.consultationSection}>
        <div className={styles.consultationCard}>
          <h2 className={styles.consultationTitle}>Rishi Sharanam</h2>
          <p className={styles.consultationText}>
            Enter the digital Ashram. Consult with our Vedic AI Healer to understand your Prakriti (nature),
            find balance for your Doshas, and receive personalized guidance for a younger, healthier you.
          </p>
          <Link href="/digital-vaidya" className={styles.zenButton}>
            Enter The Ashram
          </Link>
        </div>
      </section>

      {/* Voice Call Modal */}
      <VoiceCallModal
        isOpen={isCallModalOpen}
        onClose={() => setIsCallModalOpen(false)}
      />

    </main>
  );
}
