'use client';

import { useState } from 'react';
import { Ingredient } from '@/lib/types';
import styles from './IngredientList.module.css';

interface IngredientListProps {
    ingredients: Ingredient[];
}

export default function IngredientList({ ingredients }: IngredientListProps) {
    const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

    const toggleItem = (name: string) => {
        setCheckedItems(prev => ({
            ...prev,
            [name]: !prev[name]
        }));
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h3 className={styles.title}>Ingredients</h3>
            </div>
            <ul className={styles.list}>
                {ingredients.map((ing, idx) => {
                    const getName = (n: any) => typeof n === 'string' ? n : (n.en || n.hi || '');
                    const nameStr = getName(ing.name);
                    const isChecked = checkedItems[nameStr];

                    return (
                        <li key={idx} className={styles.item}>
                            <input
                                type="checkbox"
                                id={`ing-${idx}`}
                                className={styles.checkbox}
                                checked={!!isChecked}
                                onChange={() => toggleItem(nameStr)}
                            />
                            <label
                                htmlFor={`ing-${idx}`}
                                className={`${styles.label} ${isChecked ? styles.checkedLabel : ''}`}
                            >
                                <span className={styles.quantity}>{ing.quantity}</span>
                                {nameStr}
                                {ing.notes && <span style={{ opacity: 0.7, fontStyle: 'italic' }}> ({ing.notes})</span>}
                            </label>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
