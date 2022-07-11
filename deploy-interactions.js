const fs = require('fs');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const dotenv = require('dotenv');
dotenv.config();

const interactions = [];

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
const contextMenuFiles = fs.readdirSync('./contextMenus').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	interactions.push(command.data.toJSON());
}

for (const file of contextMenuFiles) {
	const contextMenu = require(`./contextMenus/${file}`);
	interactions.push(contextMenu.data.toJSON());
}

const rest = new REST({ version: '9' }).setToken(process.env.TOKEN);

rest.put(Routes.applicationGuildCommands(process.env.APPLICATION_ID, process.env.GUILD_ID), { body: interactions })
	.then(() => console.log('Sucessfully registered application interactions.'))
	.catch(console.error);