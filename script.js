const themeToggle = document.getElementById('theme-toggle');

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('light');

    if (document.body.classList.contains('light')) {
        themeToggle.textContent = 'WHILE';
    } else {
        themeToggle.textContent = 'BLACK';
    }
});

let count = 0;
let counter = document.getElementById('counter');
let btnclicker = document.getElementById('counter-btn');
btnclicker.addEventListener('click', () => {
    count += 1;
    counter.textContent = 'Кликов: ' + count;
});
let input = document.querySelector('.input-field input');

input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        buttonAI.click();
    }
});

const burger = document.getElementById('burger');
const navMenu = document.getElementById('nav-menu');
const overlay = document.getElementById('overlay');

burger.addEventListener('click', () => {
    burger.classList.toggle('open');
    navMenu.classList.toggle('open');
    overlay.classList.toggle('open');
});

overlay.addEventListener('click', () => {
    burger.classList.remove('open');
    navMenu.classList.remove('open');
    overlay.classList.remove('open');
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

    aiResponse.textContent = 'Загрузка...';
    aiResponse.classList.add('loading');      // подсвечиваем рамку пока ждём

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${API_KEY}`,
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
    } finally {
        aiResponse.classList.remove('loading');   // убираем подсветку в любом случае
    }
});