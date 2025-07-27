const { EmbedBuilder } = require('discord.js');
const { PermissionOverwriteManager, PermissionOverwrites, SlashCommandBuilder, PermissionsBitField, PermissionFlagsBits } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

module.exports = {
    data: new SlashCommandBuilder()
        .setName("rank-remove")
        .setDescription("Retire un rôle à un membre")
        .addUserOption(option =>
            option.setName("membre")
                .setDescription("Membre à qui retirer le rôle")
                .setRequired(true)
        )
        .addRoleOption(option =>
            option.setName("role")
                .setDescription('Rôle à retirer')
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles), 
    async execute(interaction) {
        const role = interaction.options.getRole('role')
        const member = interaction.options.getMember('membre')

        const removeChannelLogsKey = `server_${interaction.guild.id}_removeChannelLogs`;
        const removeChannelId = await db.get(removeChannelLogsKey);

        const removeChannel = interaction.guild.channels.cache.get(removeChannelId)

        if (!role) {
            return interaction.reply({
                content: "Rôle introuvable",
                ephemeral: true
            });
        }

        if (!member) {
            return interaction.reply({
                content: "Membre Introuvable",
                ephemeral: true
            });
        }

        if (role.position >= interaction.member.roles.highest.position && interaction.user.id !== interaction.guild.ownerId) {
            await interaction.reply({
                content: "Vous ne pouvez pas retirer un rôle plus haut que votre rôle le plus haut.",
                ephemeral: true
            });
            return;
        }

        if (interaction.guild.members.me.roles.highest.position <= role.position) {
            await interaction.reply({
                content: "Je ne peux pas retirer un rôle au-dessus de mon plus haut rôle.",
                ephemeral:true
            });
            return;
        }

        await member.roles.remove(role)
        await interaction.reply({
            content: `Le rôle ${role} à été retiré à ${member}`,
            ephemeral: true
        })

        const embed = new EmbedBuilder()
            .setTitle("➖・Rôle retiré")
            .setDescription(`${interaction.user} à rétiré(e) un rôle à un utilisateur.`)
            .addFields(
                { name: "Membre :", value: `${member}`, inline: true },
                { name: "Rôle :", value: `${role}`, inline: true }
            )

        if (removeChannel) {
            await removeChannel.send({ embeds: [embed] })
        }
    }
}
