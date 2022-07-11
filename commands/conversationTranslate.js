const { SlashCommandBuilder } = require('@discordjs/builders');
const languages = [{ name: '한국어', value: 'ko' }, { name: '영어', value: 'en' }, { name: '일본어', value: 'ja' }, { name: '중국어 간체', value: 'zh-CN' }, { name: '중국어 번체', value: 'zh-TW' }, { name: '베트남어', value: 'vi' }, { name: '인도네시아어', value: 'id' }, { name: '태국어', value: 'th' }, { name: '독일어', value: 'de' }, { name: '러시아어', value: 'ru' }, { name: '스페인어', value: 'es' }, { name: '이탈리아어', value: 'it' }, { name: '프랑스어', value: 'fr' }]

module.exports = {
    data: new SlashCommandBuilder()
        .setName('대화번역')
        .setDescription('선택된 두 언어를 서로 번역합니다.')
        .addSubcommand(subcommand =>
            subcommand
                .setName('시작')
                .setDescription('대화변역을 시작합니다.')
                .addStringOption(option =>
                    option.setName('language1')
                        .setDescription('첫 번째 언어를 선택하세요.')
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
                        .addChoices({ name: '프랑스어', value: 'fr' }))
                .addStringOption(option =>
                    option.setName('language2')
                        .setDescription('두 번째 언어를 선택하세요.')
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
                        .addChoices({ name: '프랑스어', value: 'fr' })))
        .addSubcommand(subcommand =>
            subcommand
                .setName('종료')
                .setDescription('대화변역을 종료합니다.')),

    async execute(interaction) {
        channelTranslateData = interaction.client.conversationTranslate.find(channel => channel.id == interaction.channelId);
        if (interaction.options._subcommand == '시작') {
            if (channelTranslateData) {
                var originalLang1 = interaction.options.getString('language1');
                var originalLang2 = interaction.options.getString('language2');
                if (originalLang1 == channelTranslateData.lang1 && originalLang2 == channelTranslateData.lang2) {
                    await interaction.reply("대화번역이 이미 진행중입니다.");
                }
                else {
                    if (originalLang1 != originalLang2) {
                        channelTranslateData.lang1 = originalLang1;
                        channelTranslateData.lang2 = originalLang2;
                        await interaction.reply(`${languages.find(x => x.value == originalLang1).name}와 ${languages.find(x => x.value == originalLang2).name}로 대화번역 언어를 변경합니다.`);
                    }
                }
            }
            else {
                var lang1 = interaction.options.getString('language1');
                var lang2 = interaction.options.getString('language2');
                if (lang1 != lang2) {
                    interaction.client.conversationTranslate.push({ id: interaction.channelId, lang1: lang1, lang2: lang2 });
                    await interaction.reply(`${languages.find(x => x.value == lang1).name}와 ${languages.find(x => x.value == lang2).name}로 대화번역을 시작합니다.`);
                }
            }
        }
        else if (interaction.options._subcommand == '종료') {
            if (channelTranslateData) {
                var index = interaction.client.conversationTranslate.findIndex(channel => channel.id == interaction.channelId);
                interaction.client.conversationTranslate.splice(index, 1);
                await interaction.reply('대화번역을 종료합니다.');
            }
            else {
                await interaction.reply('대화번역이 진행중이지 않습니다.');
            }
        }
    },
};