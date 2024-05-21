const TelegramBot = require('node-telegram-bot-api');
const token = '';

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Создаем экземпляр бота
const bot = new TelegramBot(token, {
    polling: {
        interval: 100,
        autoStart: true
    }
});

bot.on("polling_error", err => console.log(err.data.error.message));

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
  Endpoint = 31.128.32.240:51820
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


bot.on('text', async msg => {
    console.log(msg);
    try {
        if (msg.text.startsWith('/start')) {
            await bot.sendMessage(msg.chat.id, 'Привет, <b>' + msg.from.first_name + '! 👋</b>\nЛови свой лучший VPN!\n\n\🔒 Безопасность\n\🚀 Высокая скорость\n\🎯 Простотая настройка\n\🌐 Доступ к контенту\n\📶 Безопасное подключение\n\n\Стоимость 100₽/мес за 1 устройство, до 5 устройств.\n\n\⬇️ ⬇️  Жмите кнопку!  ⬇️ ⬇', {
                parse_mode: "HTML",
                reply_markup: {
                    inline_keyboard: [
                        [{ text: '⚙️ Инструкции по подключению ⚙️', callback_data: 'instruction' }],
                        [{ text: '🎊 Подключить VPN 🎊', callback_data: 'byVpn' }],
                        [{ text: 'Информация', callback_data: 'info' }, { text: 'О нас', callback_data: 'aboutus' }],
                    ]
                }
            });
        }

        else if (msg.text == '/help') {
            await bot.sendMessage(msg.chat.id, `Раздел помощи`);
        }
        else {
            await bot.sendMessage(msg.chat.id, msg.text);
        }
    }
    catch (error) {

        console.log(error);

    }

})




bot.on('callback_query', async ctx => {

    try {

        if (ctx.data == 'instruction') {

            await bot.sendMessage(ctx.message.chat.id, `Вам необходимо: \n📥 скачать приложение Wire Guard (доступно для всех ОС).\n📎 Добавить фаил конфигурации в приложении <i>(который будет отправлен вам после оплаты)</i>\n✅ Пользоваться защищенным соединением!
            `, {
                parse_mode: "HTML",
                reply_markup: {
                    inline_keyboard: [
                        [{ text: '📱 iOS', callback_data: 'app_ios' }, { text: '🤖 Android', callback_data: 'app_android' }],
                        [{ text: '🐧 Linux', callback_data: 'app_linux' }],
                        [{ text: '🪟 Windows', callback_data: 'app_windows' }, { text: '🍏 macOS', callback_data: 'app_mac' }],
                        [{ text: '🔙 Назад', callback_data: 'go_back' }]
                    ]
                },

            });

        }
        if (ctx.data == 'app_ios') {
            await bot.sendMessage(ctx.message.chat.id, `app_ios`)
        }

        if (ctx.data == 'app_android') {
            await bot.sendMessage(ctx.message.chat.id, `app_android`)
        }

        if (ctx.data == 'app_linux') {
            await bot.sendMessage(ctx.message.chat.id, `app_linux`)
        }

        if (ctx.data == 'app_windows') {
            await bot.sendMessage(ctx.message.chat.id, `app_windows`)
        }

        if (ctx.data == 'app_mac') {
            await bot.sendMessage(ctx.message.chat.id, `app_mac`)
        }

        console.log(ctx);

        switch (ctx.data) {
            case "go_back":

                await bot.deleteMessage(ctx.message.chat.id, ctx.message.message_id);
                await bot.deleteMessage(ctx.message.reply_to_message.chat.id, ctx.message.reply_to_message.message_id);

        }

    }
    catch (error) {

        console.log(error);

    }


}
)
