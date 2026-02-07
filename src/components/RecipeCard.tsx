'use client';

import Link from 'next/link';
import { Clock, Users, Sparkles } from 'lucide-react';
import { Recipe, BilingualString } from '@/lib/types';
import styles from './RecipeCard.module.css';

interface RecipeCardProps {
    recipe: Recipe;
    lang?: 'hi' | 'en';
}

export default function RecipeCard({ recipe, lang = 'hi' }: RecipeCardProps) {
    const getText = (field: BilingualString | undefined) => {
        if (!field) return '';
        if (typeof field === 'string') return field;
        return field[lang] || field['hi'] || '';
    };

    return (
        <Link href={`/recipe/${recipe.slug}`} className={styles.card}>

            <div className={styles.content}>
                <div className={styles.badgeContainer}>
                    <span className={styles.regionBadge}>{getText(recipe.region)}</span>
                    {recipe.isSattvic && (
                        <span className={styles.sattvicBadge}>
                            <Sparkles size={12} fill="white" />
                            Sattvic
                        </span>
                    )}
                </div>
                <h3 className={styles.title}>{getText(recipe.title)}</h3>
                <p className={styles.description}>{getText(recipe.description)}</p>
                {recipe.doshaEffect && (
                    <p className={styles.doshaEffect}>
                        ✨ {getText(recipe.doshaEffect)}
                    </p>
                )}

                <div className={styles.meta}>
                    <div className={styles.metaItem}>
                        <Clock size={16} />
                        <span>{recipe.prepTime + recipe.cookTime} mins</span>
                    </div>
                    <div className={styles.metaItem}>
                        <Users size={16} />
                        <span>{recipe.servings} Servings</span>
                    </div>
                </div>
            </div>
        </Link>
    );
}
