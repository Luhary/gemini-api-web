let count = 0;
let btnclicker = document.getElementById('counter-btn');
btnclicker.addEventListener('click', () => {
    count += 1;
    counter.textContent = 'Кликов: ' + count;
});

let buttonAI = document.getElementById('send-ai');
let aiResponse = document.getElementById('ai-response');
buttonAI.addEventListener('click', async () => {
    let input = document.querySelector('.input-field input');
    let userText = input.value;

    if (!userText) {
        aiResponse.textContent = 'Введи текст сучк';
        return;
    }
    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                { text: userText }
                            ]
                        }
                    ]
                })
            }
        );

        const data = await response.json();
        if (data.candidates) {
            aiResponse.textContent = data.candidates[0].content.parts[0].text;
        } else {
            aiResponse.textContent = 'Ошибка API: ' + (data.error?.message || 'неизвестная ошибка');
        }

    } catch (error) {
        aiResponse.textContent = 'Ошибка: ' + error.message;
    }
});