'use client';
import Link from 'next/link';
import { Heart } from 'lucide-react';

export default function Footer() {
    return (
        <footer style={{
            background: '#081015', /* Deep Earth Black */
            color: 'rgba(255, 255, 255, 0.4)',
            padding: '6rem 2rem',
            textAlign: 'center',
            marginTop: 0,
            position: 'relative',
            borderTop: 'none'
        }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                {/* Brand */}
                <h2 style={{
                    fontFamily: "'Cinzel Decorative', cursive",
                    fontSize: '1.5rem',
                    marginBottom: '1rem',
                    color: '#F5F5DC', /* Antique Palm */
                    letterSpacing: '2px'
                }}>
                    A Fusion of Artificial Intelligence and Great Knowledge of Rishis
                </h2>

                {/* Mantra */}
                <p style={{
                    fontFamily: "'Cinzel Decorative', cursive",
                    fontSize: '1.5rem',
                    color: '#FFDB58', /* Gold */
                    marginBottom: '0.5rem',
                    textShadow: '0 0 15px rgba(255, 219, 88, 0.5)'
                }}>
                    &ldquo;Sarve Bhavantu Sukhinah&rdquo;
                </p>
                <p style={{
                    fontFamily: "'Cinzel Decorative', cursive",
                    fontSize: '1.2rem',
                    color: '#FFDB58', /* Gold */
                    marginBottom: '0.5rem',
                    textShadow: '0 0 10px rgba(255, 219, 88, 0.5)'
                }}>
                    &ldquo;ॐ सह नाववतु। सह नौ भुनक्तु। सह वीर्यं करवावहै। तेजस्वि नावधीतमस्तु मा विद्विषावहै॥ ॐ शान्तिः शान्तिः शान्तिः॥&rdquo;
                </p>

                {/* Translation */}
                <p style={{
                    fontFamily: "'Lato', sans-serif",
                    fontStyle: 'italic',
                    fontSize: '1.1rem',
                    color: '#aaa',
                    marginBottom: '3rem'
                }}>
                    May all beings be happy, may all beings be free from disease.
                </p>

                {/* Links Removed as per request */}
                <div style={{ marginBottom: '2rem' }}></div>

                {/* Copyright */}
                <div style={{
                    borderTop: '1px solid rgba(255,255,255,0.05)',
                    paddingTop: '2rem',
                    fontSize: '0.8rem',
                    opacity: 0.8,
                    fontFamily: "'Lato', sans-serif",
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '5px',
                    color: '#F3E5AB'
                }}>
                    A Product Crafted by Research & Development of Pranav.AI
                </div>
            </div>
        </footer >
    );
}
