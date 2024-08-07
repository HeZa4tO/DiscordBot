const { Client, GatewayIntentBits, EmbedBuilder, REST, Routes, SlashCommandBuilder, PermissionsBitField } = require("discord.js");
require('dotenv').config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});
const prefix = ".";

client.on("ready", async () => {
    console.log(`Бот запущен с ником ${client.user.tag}!`);

    // Регистрация слэш-команд
    const commands = [
        new SlashCommandBuilder()
            .setName('audit')
            .setDescription('Audit a user')
            .addSubcommand(subcommand =>
                subcommand
                    .setName('invite')
                    .setDescription('Audit invite command')
                    .addUserOption(option => 
                        option.setName('пользователь')
                            .setDescription('User to audit')
                            .setRequired(true))
                    .addStringOption(option => 
                        option.setName('паспорт')
                            .setDescription('User passport number')
                            .setRequired(true))
                    .addStringOption(option =>
                        option.setName('причина')
                            .setDescription('Reason for the audit')
                            .setRequired(true)))
            .addSubcommand(subcommand =>
                subcommand
                    .setName('up')
                    .setDescription('Audit up command')
                    .addUserOption(option =>
                        option.setName('пользователь')
                            .setDescription('User to audit')
                            .setRequired(true))
                    .addIntegerOption(option =>
                        option.setName('ранг')
                            .setDescription('Rank of the user')
                            .setRequired(true))
                    .addStringOption(option =>
                        option.setName('причина')
                            .setDescription('Reason for the audit')
                            .setRequired(true)))
            .addSubcommand(subcommand =>
                subcommand
                    .setName('kick')
                    .setDescription('Audit kick command')
                    .addUserOption(option => 
                        option.setName('пользователь')
                            .setDescription('User to audit')
                            .setRequired(true))
                    .addStringOption(option => 
                        option.setName('паспорт')
                            .setDescription('User passport number')
                            .setRequired(true))
                    .addStringOption(option =>
                        option.setName('причина')
                            .setDescription('Reason for the audit')
                            .setRequired(true)))
    ]
    .map(command => command.toJSON());

    const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(
            Routes.applicationGuildCommands(client.user.id, '1269967981107216454'),
            { body: commands },
        );

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    } 
});

client.on("messageCreate", async msg => {
    if (msg.author.bot || !msg.content.startsWith(prefix)) return;
    const args = msg.content.slice(prefix.length).trim().split(/ +/);
    const cmd = args.shift().toLowerCase();

    switch(cmd) {
        case "help":
            const helpEmbed = new EmbedBuilder()
                .setTitle(`Привет, ${msg.author.username}, это меню помощи`)
                .setColor(0xff0000)
                .setDescription('Я - описание')
                .addFields({ name: "Поле:", value: "А вот и я" })
                .setTimestamp();
            await msg.channel.send({ embeds: [helpEmbed] });
            break;
        case "clear":
            if (!msg.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) return msg.reply("Недостаточно прав.");
            if (!args[0]) return msg.reply("Воспользуйся командой /clear кол-во сообщений.");
            const number = parseInt(args[0], 10);
            if (isNaN(number)) return msg.reply("Воспользуйся командой /clear кол-во сообщений.");
            if (number > 50) return msg.reply("Нельзя удалить более 50 сообщений.");
            if (number < 1) return msg.reply("Нельзя удалить менее 1 сообщения.");
            try{
                await msg.channel.bulkDelete(number + 1, true);
            } 
            catch(e){
                msg.reply("Ошибка при удалении сообщений.");
                console.log(e);
            }   
            break;
        default:
            await msg.channel.send("Неизвестная команда");
    }
    try {
        await msg.delete();
    } catch (e) {
        console.log(`Ошибка при удалении сообщения: ${e.message}`);
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const { commandName, options, user } = interaction;

    if (commandName === 'audit') {
        const subcommand = options.getSubcommand();
        if (subcommand === 'invite') {
            const invUser = options.getUser('пользователь');
            const invPassportNumber = options.getString('паспорт');
            const invReason = options.getString('причина');

            const inviteEmbed = new EmbedBuilder()
                .setColor('#00FF00')
                .setAuthor({ name: "DΔSTI", iconURL: 'https://i.pinimg.com/236x/a4/01/42/a401427af3f46fbf774e56ab0723bab9.jpg', url: 'https://t.me/heza4to' })
                .setTitle('Принятие сотрудника')
                .setDescription(`Тег сотрудника: ${invUser} \n Номер паспорта: ${invPassportNumber} \n Действие: Принят во фракцию. \n Причина: **${invReason}** \n Автор: <@${user.id}>`)
                .setTimestamp();

            await interaction.reply({ embeds: [inviteEmbed] });
        } else if (subcommand === 'up') {
            const upUser = options.getUser('пользователь');
            const userRank = options.getInteger('ранг');
            const reason = options.getString('причина');

            const auditEmbed = new EmbedBuilder()
                .setColor('#FFA500')
                .setAuthor({ name: "DΔSTI", iconURL: 'https://i.pinimg.com/236x/a4/01/42/a401427af3f46fbf774e56ab0723bab9.jpg', url: 'https://t.me/heza4to' })
                .setTitle('Повышение сотрудника')
                .setDescription(`Тег сотрудника: ${upUser} \n Действие: Повышен на **${userRank}** ранг \n Причина: **${reason}** \n Автор: <@${user.id}>`)
                .setTimestamp();

            await interaction.reply({ embeds: [auditEmbed] });
        } else if (subcommand === 'kick') {
            const kickUser = options.getUser('пользователь');
            const kickPassportNumber = options.getString('паспорт');
            const kickReason = options.getString('причина');

            const kickEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setAuthor({ name: "DΔSTI", iconURL: 'https://i.pinimg.com/236x/a4/01/42/a401427af3f46fbf774e56ab0723bab9.jpg', url: 'https://t.me/heza4to' })
                .setTitle('Увольнение сотрудника')
                .setDescription(`Тег сотрудника: ${kickUser} \n Номер паспорта: ${kickPassportNumber} \n Действие: Уволен из фракции. \n Причина: **${kickReason}** \n Автор: <@${user.id}>`)
                .setTimestamp();

            await interaction.reply({ embeds: [kickEmbed] });
        }
    }
});

client.login(process.env.TOKEN);
