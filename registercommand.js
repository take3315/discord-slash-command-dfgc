const { SlashCommandBuilder } = require('@discordjs/builders'); 
const { REST } = require('@discordjs/rest'); 
const { Routes } = require('discord-api-types/v9'); 
require('dotenv').config();
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const DISCORD_CLIENT_ID  = process.env.DISCORD_CLIENT_ID;
const DISCORD_GUILD_ID = process.env.DISCORD_GUILD_ID;


const commands = [
    new SlashCommandBuilder().setName('report').setDescription('月次活動係数の報告'), 
    new SlashCommandBuilder().setName('tokenchange').setDescription('受取トークンの変更'), 
]
    .map(command => command.toJSON());

const rest = new REST({ version: '9' }).setToken(DISCORD_TOKEN);

rest.put(Routes.applicationGuildCommands(DISCORD_CLIENT_ID, DISCORD_GUILD_ID), { body: commands }) 
    .then(() => console.log('Successfully registered application commands.'))
    .catch(console.error)