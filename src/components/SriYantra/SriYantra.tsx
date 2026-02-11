import React from 'react';
import Image from 'next/image';
import styles from './SriYantra.module.css';

export default function SriYantra() {
    return (
        <div className={styles.tripleContainer}>
            {/* Left Side Yantra - Clockwise Rotation */}
            <div className={styles.sideYantra}>
                <div className={styles.yantraClockwise}>
                    <Image
                        src="/sri-yantra-side.png?v=20260208"
                        alt="Sri Yantra Left"
                        width={500}
                        height={500}
                        unoptimized
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain'
                        }}
                    />
                </div>
            </div>

            {/* Center Yantra - Counter-Clockwise Rotation (Original) */}
            <div className={styles.container}>
                <div className={styles.yantra}>
                    <Image
                        src="/sri-yantra-authentic.png?v=20260208"
                        alt="Sri Yantra - Sacred Geometry"
                        width={800}
                        height={800}
                        priority
                        unoptimized
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain'
                        }}
                    />
                </div>
            </div>

            {/* Right Side Yantra - Clockwise Rotation */}
            <div className={styles.sideYantra}>
                <div className={styles.yantraClockwise}>
                    <Image
                        src="/sri-yantra-side.png?v=20260208"
                        alt="Sri Yantra Right"
                        width={500}
                        height={500}
                        unoptimized
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain'
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
