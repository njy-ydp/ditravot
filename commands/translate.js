const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const request = require('request-promise');
const languages = [{ name: '한국어', value: 'ko' }, { name: '영어', value: 'en' }, { name: '일본어', value: 'ja' }, { name: '중국어 간체', value: 'zh-CN' }, { name: '중국어 번체', value: 'zh-TW' }, { name: '베트남어', value: 'vi' }, { name: '인도네시아어', value: 'id' }, { name: '태국어', value: 'th' }, { name: '독일어', value: 'de' }, { name: '러시아어', value: 'ru' }, { name: '스페인어', value: 'es' }, { name: '이탈리아어', value: 'it' }, { name: '프랑스어', value: 'fr' }]

module.exports = {
    data: new SlashCommandBuilder()
        .setName('번역')
        .setDescription('입력한 문장을 번역합니다.')
        .addStringOption(option =>
            option.setName('text')
                .setDescription('번역할 문장을 입력하세요.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('original_language')
                .setDescription('원래 문장의 언어를 선택하세요.')
                .setRequired(true)
                .addChoices({ name: '언어감지', value: 'detect' })
                .addChoices({ name: '한국어', value: 'ko' })
                .addChoices({ name: '영어', value: 'en' })
                .addChoices({ name: '일본어', value: 'ja' })
                .addChoices({ name: '중국어 간체', value: 'zh-CN' })
                .addChoices({ name: '중국어 번체', value: 'zh-TW' })
                .addChoices({ name: '베트남어', value: 'vi' })
                .addChoices({ name: '인도네시아어', value: 'id' })
                .addChoices({ name: '태국어', value: 'th' })
                .addChoices({ name: '독일어', value: 'de' })
                .addChoices({ name: '러시아어', value: 'ru' })
                .addChoices({ name: '스페인어', value: 'es' })
                .addChoices({ name: '이탈리아어', value: 'it' })
                .addChoices({ name: '프랑스어', value: 'fr' }))
        .addStringOption(option =>
            option.setName('translate_language')
                .setDescription('번역될 문장의 언어를 선택하세요.')
                .setRequired(true)
                .addChoices({ name: '한국어', value: 'ko' })
                .addChoices({ name: '영어', value: 'en' })
                .addChoices({ name: '일본어', value: 'ja' })
                .addChoices({ name: '중국어 간체', value: 'zh-CN' })
                .addChoices({ name: '중국어 번체', value: 'zh-TW' })
                .addChoices({ name: '베트남어', value: 'vi' })
                .addChoices({ name: '인도네시아어', value: 'id' })
                .addChoices({ name: '태국어', value: 'th' })
                .addChoices({ name: '독일어', value: 'de' })
                .addChoices({ name: '러시아어', value: 'ru' })
                .addChoices({ name: '스페인어', value: 'es' })
                .addChoices({ name: '이탈리아어', value: 'it' })
                .addChoices({ name: '프랑스어', value: 'fr' })),

    async execute(interaction) {
        var text = interaction.options.getString('text');
        var source = interaction.options.getString('original_language');
        var target = interaction.options.getString('translate_language');
        var jsondata;
        var isDetected;
        
        // 언어감지
        if (source == 'detect') {
            options = {
                url: 'https://openapi.naver.com/v1/papago/detectLangs',
                form: { 'query': text },
                headers: { 'X-Naver-Client-Id': process.env.PAPAGO_CLIENT_ID, 'X-Naver-Client-Secret': process.env.PAPAGO_CLIENT_SECRET }
            }

            await request.post(options, (error, response, body) => {
                if (!error && response.statusCode == 200) {
                    var detectedLanguage = JSON.parse(body).langCode;
                    source = detectedLanguage;
                    isDetected = true;
                }
            })
        }

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
            const replyMessage = new MessageEmbed()
            if (isDetected == true)
            {
                replyMessage.addField(`${languages.find(x => x.value == source).name}(감지됨)`, text)
            }
            else
            {
                replyMessage.addField(`${languages.find(x => x.value == source).name}`, text)
            }
            replyMessage.addField(`${languages.find(x => x.value == target).name}(번역됨)`, jsondata.message.result.translatedText)
            await interaction.reply({ embeds: [replyMessage] });
        }
        else {
            await interaction.reply(jsondata.errorMessage);
        }
    },
};