import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
    try {
        const audioDirectory = path.join(process.cwd(), 'public/audio');

        // Ensure directory exists
        if (!fs.existsSync(audioDirectory)) {
            return NextResponse.json({ files: [] });
        }

        const files = fs.readdirSync(audioDirectory);

        // Filter for audio files (mp3, wav, m4a, ogg)
        const audioFiles = files.filter(file =>
            /\.(mp3|wav|m4a|ogg)$/i.test(file)
        );

        // Create file objects
        const fileList = audioFiles.map(file => {
            return {
                name: file,
                path: `/audio/${file}`,
                // basic stats if needed
                // size: fs.statSync(path.join(audioDirectory, file)).size
            };
        });

        return NextResponse.json({ files: fileList });
    } catch (error) {
        console.error('Error reading audio directory:', error);
        return NextResponse.json({ error: 'Failed to list audio files' }, { status: 500 });
    }
}
