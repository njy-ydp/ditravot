// Require the necessary discord.js classes
const fs = require('fs');
const { Client, Collection, Intents, MessageEmbed } = require('discord.js');
const dotenv = require('dotenv');
dotenv.config();

const request = require('request-promise');
const languages = [{ name: '한국어', value: 'ko' }, { name: '영어', value: 'en' }, { name: '일본어', value: 'ja' }, { name: '중국어 간체', value: 'zh-CN' }, { name: '중국어 번체', value: 'zh-TW' }, { name: '베트남어', value: 'vi' }, { name: '인도네시아어', value: 'id' }, { name: '태국어', value: 'th' }, { name: '독일어', value: 'de' }, { name: '러시아어', value: 'ru' }, { name: '스페인어', value: 'es' }, { name: '이탈리아어', value: 'it' }, { name: '프랑스어', value: 'fr' }]

// Create a new client instance
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

client.contextMenus = new Collection();
const contextMenuFiles = fs.readdirSync('./contextMenus');

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.data.name, command);
}

for (const file of contextMenuFiles) {
	const contextMenu = require(`./contextMenus/${file}`);
	client.contextMenus.set(contextMenu.data.name, contextMenu);
}

client.conversationTranslate = new Array();

// When the client is ready, run this code (only once)
client.once('ready', () => {
	console.log('Ready!');
});

// interactions
client.on('interactionCreate', async interaction => {
	if (interaction.isCommand()) {
		const command = client.commands.get(interaction.commandName);

		if (!command) return;
	
		try {
			await command.execute(interaction);
		}
		catch (error) {
			console.error(error);
			await interaction.reply({ content: '명령어 실행 중 오류가 발생했습니다 :(', ephemeral: true });
		}
	}
	else if (interaction.isMessageContextMenu()) {
		const messageContextMenu = client.contextMenus.get(interaction.commandName);

		if (!messageContextMenu) return;

		try {
			await messageContextMenu.execute(interaction);
		}
		catch (error) {
			console.error(error);
			await interaction.reply({ content: '명령어 실행 중 오류가 발생했습니다 :(', ephemeral: true });
		}
	}
	else if (interaction.isSelectMenu()) {
		if (interaction.customId == 'contextTranslate') {
			var text = interaction.message.embeds[0].description;
			var source;
			var target = interaction.values[0];
			var jsondata;

			// 언어감지
			options = {
				url: 'https://openapi.naver.com/v1/papago/detectLangs',
				form: { 'query': text },
				headers: { 'X-Naver-Client-Id': process.env.PAPAGO_CLIENT_ID, 'X-Naver-Client-Secret': process.env.PAPAGO_CLIENT_SECRET }
			}

			await request.post(options, (error, response, body) => {
				if (!error && response.statusCode == 200) {
					var detectedLanguage = JSON.parse(body).langCode;
					source = detectedLanguage;
				}
			})

			if (!languages.find(x => x.value == source)) {
				await interaction.reply('감지된 언어는 번역이 지원되지 않습니다.')
				return;
			}
	
			if (source == 'unk') {
				await interaction.reply('언어를 감지할 수 없습니다.')
				return;
			}

			// 번역
			if (source != target) {
				var options;
	
				options = {
					url: 'https://openapi.naver.com/v1/papago/n2mt',
					form: { 'source': source, 'target': target, 'text': text },
					headers: { 'X-Naver-Client-Id': process.env.PAPAGO_CLIENT_ID, 'X-Naver-Client-Secret': process.env.PAPAGO_CLIENT_SECRET }
				}
	
				await request.post(options, (error, response, body) => {
					if (!error && response.statusCode == 200) {
						jsondata = JSON.parse(body);
					}
				})
			}

			// 응답
			if (!jsondata.errorMessage) {
				await interaction.update({components: []})

				const replyMessage = new MessageEmbed()
            	replyMessage.addField(`${languages.find(x => x.value == source).name}(감지됨)`, text)
            	replyMessage.addField(`${languages.find(x => x.value == target).name}(번역됨)`, jsondata.message.result.translatedText)

				await interaction.followUp({ embeds: [replyMessage] });
			}
			else {
				await interaction.update({ content: jsondata.errorMessage, embeds: [], components: []})
			}
		}
	}
});

// Login to Discord with your client's token
client.login(process.env.TOKEN);

// messageCreate event
client.on('messageCreate', async message => {
	channelTranslateData = client.conversationTranslate.find(channel => channel.id == message.channelId);
	if (message.author.id != client.user.id) {
		if (channelTranslateData) {
			var source;
			var target;
			var jsondata;

			// 언어감지
			options = {
				url: 'https://openapi.naver.com/v1/papago/detectLangs',
				form: { 'query': message.content },
				headers: { 'X-Naver-Client-Id': process.env.PAPAGO_CLIENT_ID, 'X-Naver-Client-Secret': process.env.PAPAGO_CLIENT_SECRET }
			}

			await request.post(options, (error, response, body) => {
				if (!error && response.statusCode == 200) {
					var detectedLanguage = JSON.parse(body).langCode;
					source = detectedLanguage;
				}
			})

			if (!languages.find(x => x.value == source)) {
				return;
			}

			if (source == 'unk') {
				return;
			}

			if (source == channelTranslateData.lang1) {
				target = channelTranslateData.lang2;
			}
			else {
				target = channelTranslateData.lang1;
			}

			// 번역
			var options;

			options = {
				url: 'https://openapi.naver.com/v1/papago/n2mt',
				form: { 'source': source, 'target': target, 'text': message.content },
				headers: { 'X-Naver-Client-Id': process.env.PAPAGO_CLIENT_ID, 'X-Naver-Client-Secret': process.env.PAPAGO_CLIENT_SECRET }
			}

			await request.post(options, (error, response, body) => {
				if (!error && response.statusCode == 200) {
					jsondata = JSON.parse(body);
				}
			})

			// 응답
			if (!jsondata.errorMessage) {
				await message.reply(jsondata.message.result.translatedText);
			}
			else {
				await interaction.reply(jsondata.errorMessage);
			}
		}
	}
})