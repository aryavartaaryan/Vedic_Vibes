'use client';

import { useState } from 'react';

interface RecipeHeroImageProps {
    src: string;
    alt: string;
    title: string;
    className: string;
}

export default function RecipeHeroImage({ src, alt, title, className }: RecipeHeroImageProps) {
    const [imgSrc, setImgSrc] = useState(src);

    return (
        <img
            src={imgSrc}
            alt={alt}
            className={className}
            onError={() => {
                setImgSrc('https://placehold.co/800x600?text=' + encodeURIComponent(title));
            }}
        />
    );
}
