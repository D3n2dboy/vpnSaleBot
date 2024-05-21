const TelegramBot = require('node-telegram-bot-api');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const token = '<YOUR TELEGRAM BOT TOKEN>';
const bot = new TelegramBot(token, { polling: true });

// Обработчик команды /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Привет! Используйте команду /newuser чтобы создать нового пользователя WireGuard.');
});

// Обработчик команды /newuser
bot.onText(/\/newuser/, (msg) => {
  const chatId = msg.chat.id;
  
  const clientPrivateKey = execSync('wg genkey').toString().trim();
  const clientPublicKey = execSync(`echo ${clientPrivateKey} | wg pubkey`).toString().trim();
  const serverPublicKey = '<YOUR_SERVER_PUBLIC_KEY>'; // Укажите публичный ключ вашего сервера
  const clientAddress = '10.0.0.2/32'; // Выдайте новый IP для клиента

  const clientConfig = `
  [Interface]
  PrivateKey = ${clientPrivateKey}
  Address = ${clientAddress}
  DNS = 8.8.8.8

  [Peer]
  PublicKey = ${serverPublicKey}
  Endpoint = <YOUR_SERVER_IP>:51820
  AllowedIPs = 0.0.0.0/0
  `;

  fs.writeFileSync(`client_${chatId}.conf`, clientConfig);

  // Добавить клиента на сервер
  exec(`sudo wg set wg0 peer ${clientPublicKey} allowed-ips ${clientAddress}`, (error, stdout, stderr) => {
    if (error) {
      bot.sendMessage(chatId, 'Ошибка при добавлении пользователя на сервер.');
      console.error(`exec error: ${error}`);
      return;
    }
    bot.sendMessage(chatId, 'Пользователь успешно создан. Отправляю конфигурационный файл...');
    bot.sendDocument(chatId, `client_${chatId}.conf`);
  });
});

console.log('Бот запущен...');