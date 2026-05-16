// ── Theme toggle ──
const themeToggle = document.getElementById('theme-toggle');
themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('light');
    themeToggle.textContent = document.body.classList.contains('light') ? 'WHITE' : 'BLACK';
});

// ── Counter ──
let count = 0;
const counter = document.getElementById('counter');
const btnclicker = document.getElementById('counter-btn');
btnclicker.addEventListener('click', () => {
    count += 1;
    counter.textContent = 'Кликов: ' + count;
});

// ── Enter → отправить ──
const input = document.querySelector('.input-field input');
input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') buttonAI.click();
});

// ── Burger / overlay ──
const burger = document.getElementById('burger');
const navMenu = document.getElementById('nav-menu');
const overlay = document.getElementById('overlay');

function closeMenu() {
    burger.classList.remove('open');
    navMenu.classList.remove('open');
    overlay.classList.remove('open');
}

burger.addEventListener('click', () => {
    burger.classList.toggle('open');
    navMenu.classList.toggle('open');
    overlay.classList.toggle('open');
});
overlay.addEventListener('click', closeMenu);

// ── Навигация между страницами ──
const navLinks = document.querySelectorAll('.nav-menu a[data-page]');
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const pageId = link.dataset.page;
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        document.getElementById('page-' + pageId).classList.add('active');
        navLinks.forEach(l => l.classList.remove('active-link'));
        link.classList.add('active-link');
        closeMenu();
    });
});

// ── Модели по провайдерам ──
const MODELS = {
    gemini: [
        { value: 'gemini-2.5-flash-lite', label: 'Gemini 2.5 Flash Lite' },
        { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
        { value: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro' },
    ],
    openai: [
        { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
        { value: 'gpt-4o', label: 'GPT-4o' },
        { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
        { value: 'o3-mini', label: 'o3-mini' },
    ],
    anthropic: [
        { value: 'claude-haiku-4-5-20251001', label: 'Claude Haiku 4.5' },
        { value: 'claude-sonnet-4-6', label: 'Claude Sonnet 4.6' },
        { value: 'claude-opus-4-6', label: 'Claude Opus 4.6' },
    ],
};

const providerSelect = document.getElementById('ai-provider-select');
const modelSelect = document.getElementById('ai-model-select');

function populateModels(provider) {
    modelSelect.innerHTML = '';
    MODELS[provider].forEach(m => {
        const opt = document.createElement('option');
        opt.value = m.value;
        opt.textContent = m.label;
        modelSelect.appendChild(opt);
    });
}

providerSelect.addEventListener('change', () => {
    populateModels(providerSelect.value);
    // восстанавливаем сохранённую модель для этого провайдера, если есть
    const saved = localStorage.getItem('ai_model_' + providerSelect.value);
    if (saved) modelSelect.value = saved;
});

// ── Загрузка настроек из localStorage ──
function loadSettings() {
    const key = localStorage.getItem('ai_api_key') || '';
    const provider = localStorage.getItem('ai_provider') || 'gemini';
    const model = localStorage.getItem('ai_model_' + provider) || '';

    document.getElementById('api-key-input').value = key;
    providerSelect.value = provider;
    populateModels(provider);
    if (model) modelSelect.value = model;
}
loadSettings();

// ── Показать/скрыть ключ ──
const toggleKeyBtn = document.getElementById('toggle-key-visibility');
const apiKeyInput = document.getElementById('api-key-input');
toggleKeyBtn.addEventListener('click', () => {
    apiKeyInput.type = apiKeyInput.type === 'password' ? 'text' : 'password';
});

// ── Сохранение настроек ──
const saveStatus = document.getElementById('save-status');
document.getElementById('save-settings').addEventListener('click', () => {
    const key = apiKeyInput.value.trim();
    const provider = providerSelect.value;
    const model = modelSelect.value;

    if (!key) {
        saveStatus.textContent = '⚠ Введи API ключ';
        saveStatus.className = 'save-status error';
        return;
    }

    localStorage.setItem('ai_api_key', key);
    localStorage.setItem('ai_provider', provider);
    localStorage.setItem('ai_model_' + provider, model);

    saveStatus.textContent = '✓ Сохранено';
    saveStatus.className = 'save-status success';
    setTimeout(() => { saveStatus.textContent = ''; }, 2500);
});

// ── Вызов API по провайдеру ──
async function callAI(userText) {
    const key = localStorage.getItem('ai_api_key');
    const provider = localStorage.getItem('ai_provider') || 'gemini';
    const model = localStorage.getItem('ai_model_' + provider) || MODELS[provider][0].value;

    if (!key) throw new Error('API ключ не задан. Зайди в Настройки и вставь ключ.');

    if (provider === 'gemini') {
        const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: userText }] }] }),
            }
        );
        const data = await res.json();
        if (data.candidates) return data.candidates[0].content.parts[0].text;
        throw new Error(data.error?.message || 'Ошибка Gemini API');
    }

    if (provider === 'openai') {
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${key}`,
            },
            body: JSON.stringify({
                model,
                messages: [{ role: 'user', content: userText }],
            }),
        });
        const data = await res.json();
        if (data.choices) return data.choices[0].message.content;
        throw new Error(data.error?.message || 'Ошибка OpenAI API');
    }

    if (provider === 'anthropic') {
        const res = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': key,
                'anthropic-version': '2023-06-01',
                'anthropic-dangerous-direct-browser-access': 'true',
            },
            body: JSON.stringify({
                model,
                max_tokens: 1024,
                messages: [{ role: 'user', content: userText }],
            }),
        });
        const data = await res.json();
        if (data.content) return data.content[0].text;
        throw new Error(data.error?.message || 'Ошибка Anthropic API');
    }

    throw new Error('Неизвестный провайдер: ' + provider);
}

// ── Кнопка отправки ──
const buttonAI = document.getElementById('send-ai');
const aiResponse = document.getElementById('ai-response');

buttonAI.addEventListener('click', async () => {
    const userText = input.value.trim();
    if (!userText) {
        aiResponse.textContent = 'Введи текст сучк';
        return;
    }

    aiResponse.textContent = 'Загрузка...';
    aiResponse.classList.add('loading');

    try {
        aiResponse.textContent = await callAI(userText);
    } catch (error) {
        aiResponse.textContent = 'Ошибка: ' + error.message;
    } finally {
        aiResponse.classList.remove('loading');
    }
});
