const { Client, Collection, GatewayIntentBits, ActivityType } = require('discord.js');
const { token } = require('./config.json');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ],
});

client.commands = new Collection();
client.buttons = new Collection();
client.selectMenus = new Collection();

require('./handlers/eventsHandler')(client);
require('./handlers/commandsHandler')(client);
require('./handlers/interactionsHandler')(client);

client.login(token);