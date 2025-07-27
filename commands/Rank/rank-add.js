const { PermissionOverwriteManager, PermissionOverwrites, SlashCommandBuilder, PermissionsBitField, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

module.exports = {
    data: new SlashCommandBuilder()
        .setName("rank-add")
        .setDescription("Ajoute un rôle à un membre")
        .addUserOption(option =>
            option.setName("membre")
                .setDescription("Membre à qui ajouter le rôle")
                .setRequired(true)
        )
        .addRoleOption(option =>
            option.setName("role")
                .setDescription('Rôle à ajouter')
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles), 
    async execute(interaction) {
        const role = interaction.options.getRole('role')
        const member = interaction.options.getMember('membre')

        const addChannelLogsKey = `server_${interaction.guild.id}_addChannelLogs`;
        const elevationChannelLogsKey = `server_${interaction.guild.id}_elevationChannelLogs`;

        const addChannelId = await db.get(addChannelLogsKey);
        const elevationChannelId = await db.get(elevationChannelLogsKey);

        const addChannel = interaction.guild.channels.cache.get(addChannelId);
        const elevationChannel = interaction.guild.channels.cache.get(elevationChannelId);

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

        const elevationEmbed = new EmbedBuilder()
            .setTitle("🚨・Tentative d'élévation de privilèges")
            .setDescription(`${member} a tenté d’obtenir des permissions ou rôles supérieurs aux siens.`)
            .addFields(
                { name: "Rôle Visé", value: `${role}` }
            )

        const elevationEmbed2 = new EmbedBuilder()
            .setTitle("🚨・Tentative d'élévation de privilèges")
            .setDescription(`${interaction.user} à tenté(e) une élévation de privilèges sur un utilisateur.`)
            .addFields(
                { name: "Membre Visé(e) :", value: `${member}`, inline: true },
                { name: "Rôle Visé :", value: `${role}`, inline: true }
            )

        if (interaction.guild.members.me.roles.highest.position <= role.position) {
            await interaction.reply({
                content: "Je ne peux pas ajouter un rôle au-dessus de mon rôle le plus haut.",
                ephemeral: true
            })
            return;
        }

        if (role.position >= interaction.member.roles.highest.position && interaction.user.id === member.id && interaction.user.id !== interaction.guild.ownerId) {
            await interaction.reply({
                content: "Vous ne pouvez pas ajouter un rôle supérieur à votre rôle le plus haut.\nUne alerte à été envoyé, merci de ne pas retenter sous peine de derank.",
                ephemeral: true
            });

            if (elevationChannel) {
                await elevationChannel.send({
                    content: "@everyone",
                    embeds: [elevationEmbed]
                });
            }
            return;
        }

        if (role.position >= interaction.member.roles.highest.position && interaction.user.id !== member.id && interaction.user.id !== interaction.guild.ownerId) {
            await interaction.reply({
                content: "Vous ne pouvez pas ajouter un rôle supérieur à votre rôle le plus haut.\nUne alerte à été envoyé, merci de ne pas retenter sous peine de derank.",
                ephemeral: true
            });

            if (elevationChannel) {
                await elevationChannel.send({
                    content: "@everyone",
                    embeds: [elevationEmbed2]
                })
            }
            return;
        }

        await member.roles.add(role)
        await interaction.reply({
            content: `Le rôle ${role} à été ajouté à ${member}`,
            ephemeral: true
        })

        const embed = new EmbedBuilder()
            .setTitle("➕・Ajouts de rôle")
            .setDescription(`${interaction.user} à ajouté(e) un rôle à un utilisateur.`)
            .addFields(
                { name: "Membre :", value: `${member}`, inline: true },
                { name: "Rôle :", value: `${role}`, inline: true}
            )
        
        if (addChannel) {
            await addChannel.send({ embeds: [embed] })
        }
    }
}