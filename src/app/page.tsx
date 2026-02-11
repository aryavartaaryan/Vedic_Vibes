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

      {/* Hero Section: The Pranic Path (Vedic-Zen Fusion) */}
      <PranicPathSection />

      {/* Daily Wisdom Section: Immersive Gayatri Mantra */}
      <div className={styles.fadeSeparator}></div>
      <GayatriMantraSection />

      {/* Rishi Sharanam: The Digital Ashram */}
      <div className={styles.fadeSeparator}></div>
      <section className={styles.consultationSection}>
        <div className={styles.consultationCard}>
          <h2 className={styles.consultationTitle}>Rishi Sharanam</h2>
          <p className={styles.consultationText}>
            Step into the future where Ancient Vedic Wisdom meets Artificial Intelligence. We are dedicated to harmonizing the profound knowledge of the Rishis with modern technology to guide humanity towards health, peace, and self-realization.
          </p>
          <Link href="/acharya-samvad" className={styles.zenButton}>
            Experience the Fusion of Past & Future
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
