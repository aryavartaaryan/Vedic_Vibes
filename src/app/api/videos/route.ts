import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const folder = searchParams.get('folder');

    if (!folder) {
        return NextResponse.json({ error: 'Folder parameter is required' }, { status: 400 });
    }

    // Allow only specific folders for security
    const allowedFolders = ['Flash Videos', 'Slide Videos'];
    if (!allowedFolders.includes(folder)) {
        return NextResponse.json({ error: 'Invalid folder' }, { status: 403 });
    }

    const directoryPath = path.join(process.cwd(), 'public', folder);

    try {
        const files = fs.readdirSync(directoryPath);

        // Filter for video files only
        const videoFiles = files.filter(file =>
            file.endsWith('.mp4') || file.endsWith('.webm') || file.endsWith('.mov')
        ).map(file => {
            return {
                name: file,
                path: `/${folder}/${file}`
            }
        });

        return NextResponse.json({ files: videoFiles });
    } catch (error) {
        console.error('Error reading video directory:', error);
        return NextResponse.json({ error: 'Failed to read directory' }, { status: 500 });
    }
}
