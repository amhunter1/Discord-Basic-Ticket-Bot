Discord Ticket Bot
A feature-rich Discord ticket bot that creates and manages support tickets with slash commands, button interactions, and transcript logging. This bot allows users to create tickets, add/remove users, close tickets, and view ticket statistics.
Features

**!!! The messages of this Discord bot are in Turkish by default — don't forget to translate them into your own language. !!!**


Slash Commands: Create ticket panels, add/remove users, close tickets, and view statistics.
Interactive Buttons: Users can open tickets with categorized buttons (General Support, Appeal, Other).
Ticket Management: Automatically creates ticket channels with proper permissions for users and staff.
Transcripts: Generates message transcripts for closed tickets.
Logging: Logs all ticket actions (creation, closure, user add/remove) to a designated channel.
Statistics: Displays active ticket counts and total tickets created.

Installation and Setup
Prerequisites

Node.js (v16.9.0 or higher)
A Discord bot token from the Discord Developer Portal
A Discord server where you have administrator permissions

Steps to Run the Bot

Clone the Repository
git clone <repository-url>
cd <repository-folder>


Install DependenciesInstall the required Node.js packages by running:
npm install discord.js


Configure the Bot

Open the bot.js file and locate the config object.
Replace the placeholder values with your own:const config = {
    token: 'YOUR_BOT_TOKEN',
    guildId: 'YOUR_GUILD_ID',
    ticketCategoryId: 'YOUR_TICKET_CATEGORY_ID',
    logChannelId: 'YOUR_LOG_CHANNEL_ID',
    staffRoleId: 'YOUR_STAFF_ROLE_ID',
    adminRoleId: 'YOUR_ADMIN_ROLE_ID'
};


token: Your Discord bot token from the Developer Portal.
guildId: The ID of your Discord server.
ticketCategoryId: The ID of the category where ticket channels will be created.
logChannelId: The ID of the channel where ticket logs will be sent.
staffRoleId: The ID of the role for staff members who can manage tickets.
adminRoleId: The ID of the role for administrators who can use all commands.




Run the BotStart the bot by running:
node bot.js


Invite the Bot to Your Server

Ensure the bot has the necessary permissions (e.g., Manage Channels, Send Messages, Read Message History).
Use the /ticket-panel slash command in your server to create the ticket panel.



Usage

Create a Ticket Panel: Use /ticket-panel to create an interactive panel with buttons for opening tickets.
Open a Ticket: Users can click the buttons (General Support, Appeal, Other) to create a ticket channel.
Manage Tickets:
/add <user>: Add a user to the ticket channel.
/remove <user>: Remove a user from the ticket channel.
/close: Close the current ticket channel.
/ticket-stats: View ticket statistics (active tickets, total created).


Close a Ticket: Staff can close tickets using the "Close Ticket" button or the /close command.
Transcript: Use the "Transcript" button to download a text file of the ticket's message history.

Troubleshooting

Bot Not Responding: Ensure the bot token is correct and the bot is invited to the server with proper permissions.
Slash Commands Not Appearing: Verify the guildId in the config and ensure the bot has permission to register commands.
Errors in Console: Check for missing dependencies or incorrect configuration values.

Contributing
Feel free to fork this repository, make improvements, and submit pull requests. For major changes, please open an issue first to discuss what you would like to change.
License
This project is licensed under the MIT License.

Discord Ticket Botu
Özelliklerle dolu bir Discord ticket botu, destek taleplerini oluşturur ve yönetir, slash komutları, buton etkileşimleri ve transkript kaydı ile çalışır. Bu bot, kullanıcıların ticket açmasını, kullanıcı ekleme/çıkarma, ticket kapatma ve ticket istatistiklerini görüntüleme imkanı sağlar.
Özellikler

Slash Komutları: Ticket panelleri oluşturma, kullanıcı ekleme/çıkarma, ticket kapatma ve istatistik görüntüleme.
Etkileşimli Butonlar: Kullanıcılar, Genel Destek, İtiraz ve Diğer kategorileri için butonlarla ticket açabilir.
Ticket Yönetimi: Kullanıcılar ve yetkili ekibi için uygun izinlerle otomatik ticket kanalları oluşturur.
Transkriptler: Kapanan ticket'lar için mesaj transkriptleri oluşturur.
Kayıt Tutma: Ticket oluşturma, kapatma, kullanıcı ekleme/çıkarma gibi tüm işlemleri belirlenen bir kanala kaydeder.
İstatistikler: Aktif ticket sayısı ve toplam oluşturulan ticket'ları gösterir.

Kurulum ve Ayar Yapma
Gereksinimler

Node.js (v16.9.0 veya üstü)
Discord Developer Portal üzerinden alınmış bir bot token'ı
Yönetici izinlerine sahip olduğunuz bir Discord sunucusu

Botu Çalıştırma Adımları

Depoyu Klonlayın
git clone <depo-url'si>
cd <depo-klasörü>


Bağımlılıkları YükleyinGerekli Node.js paketlerini yüklemek için:
npm install discord.js


Botu Yapılandırın

bot.js dosyasını açın ve config nesnesini bulun.
Yer tutucu değerleri kendi değerlerinizle değiştirin:const config = {
    token: 'BOT_TOKENINIZ',
    guildId: 'SUNUCU_ID',
    ticketCategoryId: 'TICKET_KATEGORI_ID',
    logChannelId: 'LOG_KANALI_ID',
    staffRoleId: 'YETKILI_ROL_ID',
    adminRoleId: 'YONETICI_ROL_ID'
};


token: Discord Developer Portal'dan aldığınız bot token'ı.
guildId: Discord sunucunuzun ID'si.
ticketCategoryId: Ticket kanallarının oluşturulacağı kategori ID'si.
logChannelId: Ticket loglarının gönderileceği kanal ID'si.
staffRoleId: Ticket'ları yönetebilecek yetkili rolün ID'si.
adminRoleId: Tüm komutları kullanabilen yönetici rolünün ID'si.




Botu ÇalıştırınBotu başlatmak için:
node bot.js


Botu Sunucunuza Davet Edin

Botun gerekli izinlere (örn. Kanal Yönetimi, Mesaj Gönderme, Mesaj Geçmişini Okuma) sahip olduğundan emin olun.
Sunucunuzda /ticket-panel slash komutunu kullanarak ticket panelini oluşturun.



Kullanım

Ticket Paneli Oluşturma: /ticket-panel komutunu kullanarak etkileşimli bir panel oluşturun.
Ticket Açma: Kullanıcılar, Genel Destek, İtiraz veya Diğer butonlarına tıklayarak ticket kanalı oluşturabilir.
Ticket Yönetimi:
/add <kullanıcı>: Bir kullanıcıyı ticket kanalına ekler.
/remove <kullanıcı>: Bir kullanıcıyı ticket kanalından çıkarır.
/close: Mevcut ticket kanalını kapatır.
/ticket-stats: Ticket istatistiklerini gösterir (aktif ticket'lar, toplam oluşturulanlar).


Ticket Kapatma: Yetkililer, "Ticket Kapat" butonu veya /close komutu ile ticket'ları kapatabilir.
Transkript: "Transcript" butonu ile ticket mesaj geçmişinin txt dosyasını indirebilirsiniz.

Sorun Giderme

Bot Yanıt Vermiyor: Bot token'ının doğru olduğundan ve botun sunucuya doğru izinlerle davet edildiğinden emin olun.
Slash Komutları Görünmüyor: guildId değerini kontrol edin ve botun komut kaydetme iznine sahip olduğundan emin olun.
Konsolda Hatalar: Eksik bağımlılıklar veya yanlış yapılandırma değerlerini kontrol edin.

Katkıda Bulunma
Bu depoyu fork edebilir, iyileştirmeler yapabilir ve pull request gönderebilirsiniz. Büyük değişiklikler için lütfen önce bir issue açarak neyi değiştirmek istediğinizi tartışın.
Lisans
Bu proje MIT Lisansı altında lisanslanmıştır.
