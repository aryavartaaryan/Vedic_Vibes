
async function testVaidya() {
    try {
        const response = await fetch('http://localhost:3000/api/digital-vaidya', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messages: [
                    { role: 'user', content: 'I feel very anxious and my stomach is upset.' }
                ],
                language: 'en'
            })
        });

        const data = await response.json();
        console.log('Status:', response.status);
        console.log('Response:', JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error:', error);
    }
}

testVaidya();
