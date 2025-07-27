const { EmbedBuilder, SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

module.exports = {
    data: new SlashCommandBuilder()
        .setName("logs-channel")
        .setDescription("Setup les channels de logs")
        .addChannelOption(option =>
            option.setName("salon-logs-add")
                .setDescription("Salon des ajouts de rôle")
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true)
        )
        .addChannelOption(option =>
            option.setName("salon-logs-remove")
                .setDescription("Salon des retaits de rôle")
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true)
        )
        .addChannelOption(option =>
            option.setName("salon-logs-elevation")
                .setDescription("Salon des alertes d'élévations de privilèges")
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(false)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
        async execute(interaction) {
            const addChannel = interaction.options.getChannel('salon-logs-add');
            const removeChannel = interaction.options.getChannel('salon-logs-remove');
            const elevationChannel = interaction.options.getChannel('salon-logs-elevation')

            const addChannelLogsKey = `server_${interaction.guild.id}_addChannelLogs`;
            const removeChannelLogsKey = `server_${interaction.guild.id}_removeChannelLogs`;
            const elevationChannelLogsKey = `server_${interaction.guild.id}_elevationChannelLogs`;

            await db.set(addChannelLogsKey, addChannel.id)
            await db.set(removeChannelLogsKey, removeChannel.id)
            await db.set(elevationChannelLogsKey, elevationChannel.id)

            await interaction.reply({
                content: `Les logs d'ajouts de rôle seront désormais envoyé dans ${addChannel}.\nLes logs de retraits de rôle seront désormais envoyé dans ${removeChannel}.`,
                ephemeral: true
            })
        }
}