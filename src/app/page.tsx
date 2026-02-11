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
            Enter the digital Ashram. Consult with our Vedic AI Healer to understand your Prakriti (nature),
            find balance for your Doshas, and receive personalized guidance for a younger, healthier you.
          </p>
          <Link href="/acharya-samvad" className={styles.zenButton}>
            Acharya Samvad (आचार्य संवाद)
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
