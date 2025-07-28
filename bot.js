const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits, ChannelType, SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Bot settings
const config = {
    token: 'BOT_TOKEN_HERE',
    guildId: 'GUILD_ID_HERE',
    ticketCategoryId: 'TICKET_CATEGORY_ID',
    logChannelId: 'TICKET_LOG_CHANELL_ID',
    staffRoleId: 'STAFF_ROLE_ID',
    adminRoleId: 'ADMIN_ROLE_ID'
};

const ticketData = new Map();
const ticketCounters = new Map();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

// Slash commands
const commands = [
    new SlashCommandBuilder()
        .setName('ticket-panel')
        .setDescription('Ticket panelini oluşturur')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    
    new SlashCommandBuilder()
        .setName('add')
        .setDescription('Ticket kanalına birini ekler')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Eklenecek kullanıcı')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
    
    new SlashCommandBuilder()
        .setName('remove')
        .setDescription('Ticket kanalından birini çıkarır')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Çıkarılacak kullanıcı')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
    
    new SlashCommandBuilder()
        .setName('close')
        .setDescription('Ticket kanalını kapatır')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
    
    new SlashCommandBuilder()
        .setName('ticket-stats')
        .setDescription('Ticket istatistiklerini gösterir')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
];

client.once('ready', async () => {
    console.log(`✅ Bot ${client.user.tag} olarak giriş yaptı!`);
    
    const guild = client.guilds.cache.get(config.guildId);
    if (guild) {
        await guild.commands.set(commands);
        console.log('✅ Slash komutları kaydedildi!');
    }
    
    // Bot status settings
    client.user.setActivity('Ticket Sistemi | /ticket-panel', { type: 'WATCHING' });
});

// Slash commands interactions
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;

    const { commandName } = interaction;

    try {
        switch (commandName) {
            case 'ticket-panel':
                await createTicketPanel(interaction);
                break;
            case 'add':
                await addUserToTicket(interaction);
                break;
            case 'remove':
                await removeUserFromTicket(interaction);
                break;
            case 'close':
                await closeTicket(interaction);
                break;
            case 'ticket-stats':
                await showTicketStats(interaction);
                break;
        }
    } catch (error) {
        console.error('Komut hatası:', error);
        await interaction.reply({ content: '❌ Bir hata oluştu!', ephemeral: true });
    }
});

// Ticket panel creating
async function createTicketPanel(interaction) {
    const embed = new EmbedBuilder()
        .setTitle('🎫 Destek Ticket Sistemi')
        .setDescription('Aşağıdaki butonlardan birini seçerek destek talebi oluşturabilirsiniz.')
        .addFields(
            { name: '🔧 Genel Destek', value: 'Genel sorular ve yardım için', inline: true },
            { name: '⚖️ İtiraz', value: 'Ban, kick vb. itirazlar için', inline: true },
            { name: '📋 Diğer', value: 'Diğer konular için', inline: true }
        )
        .setColor('#0099ff')
        .setFooter({ text: 'Ticket açmak için aşağıdaki butonları kullanın' })
        .setTimestamp();

    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('ticket_general')
                .setLabel('Genel Destek')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('🔧'),
            new ButtonBuilder()
                .setCustomId('ticket_appeal')
                .setLabel('İtiraz')
                .setStyle(ButtonStyle.Danger)
                .setEmoji('⚖️'),
            new ButtonBuilder()
                .setCustomId('ticket_other')
                .setLabel('Diğer')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('📋')
        );

    await interaction.reply({ embeds: [embed], components: [row] });
}

// button interactions
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;

    const { customId, user, guild } = interaction;

    if (customId.startsWith('ticket_')) {
        await createTicket(interaction, customId);
    } else if (customId === 'close_ticket') {
        await closeTicketWithButton(interaction);
    } else if (customId === 'transcript') {
        await createTranscript(interaction);
    }
});

// Ticket create
async function createTicket(interaction, ticketType) {
    const { user, guild } = interaction;
    const existingTicket = guild.channels.cache.find(
        channel => channel.name.startsWith('ticket-') && 
        channel.topic && channel.topic.includes(user.id)
    );

    if (existingTicket) {
        return await interaction.reply({
            content: `❌ Zaten açık bir ticket'ınız var: ${existingTicket}`,
            ephemeral: true
        });
    }

    await interaction.deferReply({ ephemeral: true });

// ticket types
    const ticketTypes = {
        'ticket_general': { name: 'Genel Destek', emoji: '🔧' },
        'ticket_appeal': { name: 'İtiraz', emoji: '⚖️' },
        'ticket_other': { name: 'Diğer', emoji: '📋' }
    };

    const ticketInfo = ticketTypes[ticketType];
    const ticketNumber = getNextTicketNumber(guild.id);
    const channelName = `ticket-${ticketNumber}`;

    try {
        // Ticket channel creating
        const ticketChannel = await guild.channels.create({
            name: channelName,
            type: ChannelType.GuildText,
            parent: config.ticketCategoryId,
            topic: `Ticket sahibi: ${user.tag} (${user.id}) | Tip: ${ticketInfo.name}`,
            permissionOverwrites: [
                {
                    id: guild.id,
                    deny: [PermissionFlagsBits.ViewChannel],
                },
                {
                    id: user.id,
                    allow: [
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.SendMessages,
                        PermissionFlagsBits.ReadMessageHistory,
                        PermissionFlagsBits.AttachFiles
                    ],
                },
                {
                    id: config.staffRoleId,
                    allow: [
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.SendMessages,
                        PermissionFlagsBits.ReadMessageHistory,
                        PermissionFlagsBits.ManageMessages,
                        PermissionFlagsBits.AttachFiles
                    ],
                },
            ],
        });
        ticketData.set(ticketChannel.id, {
            userId: user.id,
            type: ticketInfo.name,
            createdAt: new Date(),
            number: ticketNumber
        });

        // Ticket message
        const ticketEmbed = new EmbedBuilder()
            .setTitle(`${ticketInfo.emoji} ${ticketInfo.name} Ticket #${ticketNumber}`)
            .setDescription(`Merhaba ${user}, ticket'ınız başarıyla oluşturuldu!\n\nYetkili ekibimiz en kısa sürede sizinle ilgilenecektir.`)
            .addFields(
                { name: 'Ticket Sahibi', value: `${user}`, inline: true },
                { name: 'Ticket Tipi', value: ticketInfo.name, inline: true },
                { name: 'Oluşturulma Zamanı', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
            )
            .setColor('#00ff00')
            .setFooter({ text: 'Ticket kapatmak için aşağıdaki butonu kullanın' })
            .setTimestamp();

        const ticketButtons = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('close_ticket')
                    .setLabel('Ticket Kapat')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('🗑️'),
                new ButtonBuilder()
                    .setCustomId('transcript')
                    .setLabel('Transcript Al')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('📄')
            );

        await ticketChannel.send({ 
            content: `${user} <@&${config.staffRoleId}>`, 
            embeds: [ticketEmbed], 
            components: [ticketButtons] 
        });

        // Log channel send message
        await logTicketAction('create', user, ticketChannel, ticketInfo.name);

        await interaction.editReply({
            content: `✅ Ticket'ınız başarıyla oluşturuldu! ${ticketChannel}`
        });

    } catch (error) {
        console.error('Ticket oluşturma hatası:', error);
        await interaction.editReply({
            content: '❌ Ticket oluşturulurken bir hata oluştu!'
        });
    }
}

// Ticket add user
async function addUserToTicket(interaction) {
    const channel = interaction.channel;
    const userToAdd = interaction.options.getUser('user');
    
    if (!channel.name.startsWith('ticket-')) {
        return await interaction.reply({
            content: '❌ Bu komut sadece ticket kanallarında kullanılabilir!',
            ephemeral: true
        });
    }

    try {
        await channel.permissionOverwrites.create(userToAdd.id, {
            ViewChannel: true,
            SendMessages: true,
            ReadMessageHistory: true,
            AttachFiles: true
        });

        const embed = new EmbedBuilder()
            .setDescription(`✅ ${userToAdd} ticket'a eklendi!`)
            .setColor('#00ff00')
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
        await logTicketAction('add_user', interaction.user, channel, `${userToAdd.tag} eklendi`);

    } catch (error) {
        console.error('Kullanıcı ekleme hatası:', error);
        await interaction.reply({
            content: '❌ Kullanıcı eklenirken bir hata oluştu!',
            ephemeral: true
        });
    }
}

// Ticket remove user
async function removeUserFromTicket(interaction) {
    const channel = interaction.channel;
    const userToRemove = interaction.options.getUser('user');
    
    if (!channel.name.startsWith('ticket-')) {
        return await interaction.reply({
            content: '❌ Bu komut sadece ticket kanallarında kullanılabilir!',
            ephemeral: true
        });
    }

    try {
        await channel.permissionOverwrites.delete(userToRemove.id);

        const embed = new EmbedBuilder()
            .setDescription(`✅ ${userToRemove} ticket'tan çıkarıldı!`)
            .setColor('#ff9900')
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
        await logTicketAction('remove_user', interaction.user, channel, `${userToRemove.tag} çıkarıldı`);

    } catch (error) {
        console.error('Kullanıcı çıkarma hatası:', error);
        await interaction.reply({
            content: '❌ Kullanıcı çıkarılırken bir hata oluştu!',
            ephemeral: true
        });
    }
}

// Ticket close (slash command)
async function closeTicket(interaction) {
    const channel = interaction.channel;
    
    if (!channel.name.startsWith('ticket-')) {
        return await interaction.reply({
            content: '❌ Bu komut sadece ticket kanallarında kullanılabilir!',
            ephemeral: true
        });
    }

    await closeTicketProcess(interaction, channel);
}

// Ticket close (button)
async function closeTicketWithButton(interaction) {
    const channel = interaction.channel;
    await closeTicketProcess(interaction, channel);
}

async function closeTicketProcess(interaction, channel) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageChannels) && 
        !interaction.member.roles.cache.has(config.adminRoleId)) {
        return await interaction.reply({
            content: '❌ Bu işlem için yeterli yetkiniz yok!',
            ephemeral: true
        });
    }

    await interaction.deferReply();

    try {
        const ticketInfo = ticketData.get(channel.id);
        
        const transcript = await createChannelTranscript(channel);
        
        await logTicketAction('close', interaction.user, channel, 'Kapatıldı', transcript);

        ticketData.delete(channel.id);

        await interaction.editReply({
            content: '✅ Ticket 5 saniye içinde kapatılacak...'
        });

        setTimeout(async () => {
            await channel.delete();
        }, 5000);

    } catch (error) {
        console.error('Ticket kapatma hatası:', error);
        await interaction.editReply({
            content: '❌ Ticket kapatılırken bir hata oluştu!'
        });
    }
}
async function createTranscript(interaction) {
    await interaction.deferReply({ ephemeral: true });
    
    try {
        const transcript = await createChannelTranscript(interaction.channel);
        await interaction.editReply({
            content: '✅ Transcript oluşturuldu!',
            files: [{ attachment: Buffer.from(transcript, 'utf8'), name: `transcript-${interaction.channel.name}.txt` }]
        });
    } catch (error) {
        console.error('Transcript hatası:', error);
        await interaction.editReply({
            content: '❌ Transcript oluşturulurken bir hata oluştu!'
        });
    }
}

async function createChannelTranscript(channel) {
    const messages = await channel.messages.fetch({ limit: 100 });
    const sortedMessages = messages.sort((a, b) => a.createdTimestamp - b.createdTimestamp);
    
    let transcript = `Ticket Transcript - ${channel.name}\n`;
    transcript += `Oluşturulma Zamanı: ${new Date().toLocaleString('tr-TR')}\n`;
    transcript += `${'='.repeat(50)}\n\n`;
    
    for (const message of sortedMessages.values()) {
        const timestamp = message.createdAt.toLocaleString('tr-TR');
        transcript += `[${timestamp}] ${message.author.tag}: ${message.content}\n`;
        
        if (message.attachments.size > 0) {
            message.attachments.forEach(attachment => {
                transcript += `  📎 Ek: ${attachment.url}\n`;
            });
        }
    }
    
    return transcript;
}

// Ticket statistics
async function showTicketStats(interaction) {
    const guild = interaction.guild;
    const ticketChannels = guild.channels.cache.filter(c => c.name.startsWith('ticket-'));
    
    const embed = new EmbedBuilder()
        .setTitle('📊 Ticket İstatistikleri')
        .addFields(
            { name: 'Aktif Ticket Sayısı', value: `${ticketChannels.size}`, inline: true },
            { name: 'Toplam Oluşturulan', value: `${getTicketCounter(guild.id)}`, inline: true },
            { name: 'Sistem Durumu', value: '🟢 Aktif', inline: true }
        )
        .setColor('#0099ff')
        .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
}

// Log
async function logTicketAction(action, user, channel, details, transcript = null) {
    const logChannel = client.channels.cache.get(config.logChannelId);
    if (!logChannel) return;

    const actions = {
        create: { emoji: '✅', color: '#00ff00', title: 'Ticket Oluşturuldu' },
        close: { emoji: '🗑️', color: '#ff0000', title: 'Ticket Kapatıldı' },
        add_user: { emoji: '➕', color: '#0099ff', title: 'Kullanıcı Eklendi' },
        remove_user: { emoji: '➖', color: '#ff9900', title: 'Kullanıcı Çıkarıldı' }
    };

    const actionInfo = actions[action];
    
    const embed = new EmbedBuilder()
        .setTitle(`${actionInfo.emoji} ${actionInfo.title}`)
        .addFields(
            { name: 'Kanal', value: `${channel}`, inline: true },
            { name: 'İşlem Yapan', value: `${user}`, inline: true },
            { name: 'Detay', value: details, inline: true },
            { name: 'Zaman', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: false }
        )
        .setColor(actionInfo.color)
        .setTimestamp();

    const logData = { embeds: [embed] };
    
    if (transcript) {
        logData.files = [{ 
            attachment: Buffer.from(transcript, 'utf8'), 
            name: `transcript-${channel.name}.txt` 
        }];
    }

    await logChannel.send(logData);
}
function getNextTicketNumber(guildId) {
    const current = ticketCounters.get(guildId) || 0;
    const next = current + 1;
    ticketCounters.set(guildId, next);
    return next;
}
function getTicketCounter(guildId) {
    return ticketCounters.get(guildId) || 0;
}
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    process.exit(1);
});
client.login(config.token);