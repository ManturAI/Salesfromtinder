require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

// Проверка наличия необходимых переменных окружения
if (!process.env.BOT_TOKEN) {
  console.error('Ошибка: Не указан токен бота в .env файле');
  process.exit(1);
}

if (!process.env.WEBAPP_URL) {
  console.error('Ошибка: Не указан URL веб-приложения в .env файле');
  process.exit(1);
}

// Создание экземпляра бота
const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

// Обработка команды /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const firstName = msg.from.first_name || 'пользователь';
  
  // Создаем клавиатуру с кнопкой для открытия веб-приложения
  const keyboard = {
    reply_markup: {
      keyboard: [
        [{
          text: '🌐 Открыть веб-приложение',
          web_app: { url: process.env.WEBAPP_URL }
        }]
      ],
      resize_keyboard: true
    }
  };
  
  bot.sendMessage(
    chatId, 
    `Привет, ${firstName}! 👋\n\nЯ бот для обучающей платформы. Нажми на кнопку ниже, чтобы открыть веб-приложение с учебными материалами.`,
    keyboard
  );
});

// Обработка команды /help
bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  
  bot.sendMessage(
    chatId,
    'Доступные команды:\n' +
    '/start - Запустить бота и показать кнопку для веб-приложения\n' +
    '/help - Показать справку'
  );
});

// Обработка текстовых сообщений
bot.on('message', (msg) => {
  // Игнорируем команды и сообщения от веб-приложения
  if (msg.text && !msg.text.startsWith('/') && !msg.web_app_data) {
    const chatId = msg.chat.id;
    
    bot.sendMessage(
      chatId,
      'Используйте кнопку ниже для доступа к обучающей платформе:',
      {
        reply_markup: {
          keyboard: [
            [{
              text: '🌐 Открыть веб-приложение',
              web_app: { url: process.env.WEBAPP_URL }
            }]
          ],
          resize_keyboard: true
        }
      }
    );
  }
});

// Обработка данных, полученных из веб-приложения
bot.on('web_app_data', (msg) => {
  const chatId = msg.chat.id;
  const data = msg.web_app_data.data;
  
  try {
    // Пытаемся распарсить данные как JSON
    const parsedData = JSON.parse(data);
    bot.sendMessage(chatId, `Получены данные из веб-приложения: ${JSON.stringify(parsedData, null, 2)}`);
  } catch (e) {
    // Если не удалось распарсить как JSON, отправляем как текст
    bot.sendMessage(chatId, `Получены данные из веб-приложения: ${data}`);
  }
});

console.log('Бот запущен! Нажмите Ctrl+C для остановки.');