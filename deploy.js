const { REST, Routes } = require('discord.js');
const { clientId, token } = require('./config.json');
const fs = require('node:fs');
const path = require('node:path');

const commands = [];

module.exports = commands;

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            commands.push(command.data.toJSON());
        } else {
            console.log(`⚠️ [WARNING] ⚠️ La commande ${filePath} manque "data" ou "execute" requis`);
        }
    }
}

const rest = new REST().setToken(token);

(async () => {
    try {
        console.log(`Actualisation de ${commands.length} (/) commandes`);

        const data = await rest.put(
            Routes.applicationCommands(clientId),
            { body: commands },
        );

        console.log(`${data.length} (/) commandes recharger avec succès`);
    } catch (error) {
        console.error(error);
    }
})();