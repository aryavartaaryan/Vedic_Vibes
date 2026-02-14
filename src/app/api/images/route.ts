import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
    const directoryPath = path.join(process.cwd(), 'public', 'images');

    try {
        if (!fs.existsSync(directoryPath)) {
            return NextResponse.json({ files: [] });
        }

        const files = fs.readdirSync(directoryPath);

        // Filter for image files, excluding system files like .DS_Store
        const imageFiles = files.filter(file =>
            file.match(/\.(jpg|jpeg|png|gif|webp)$/i)
        ).map(file => {
            return {
                name: file,
                path: `/images/${file}`
            };
        });

        return NextResponse.json({ files: imageFiles });
    } catch (error) {
        console.error('Error reading images directory:', error);
        return NextResponse.json({ error: 'Failed to read directory' }, { status: 500 });
    }
}
