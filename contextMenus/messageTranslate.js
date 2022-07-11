const { ContextMenuCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageEmbed, MessageSelectMenu } = require('discord.js');

module.exports = {
    data: new ContextMenuCommandBuilder()
        .setName('이 메세지 번역하기')
        .setType(3),

    async execute(interaction) {
        const row = new MessageActionRow()
            .addComponents(
                new MessageSelectMenu()
                    .setCustomId('contextTranslate')
                    .addOptions([
                        { label: '한국어', value: 'ko' },
                        { label: '영어', value: 'en' },
                        { label: '일본어', value: 'ja' },
                        { label: '중국어 간체', value: 'zh-CN' },
                        { label: '중국어 번체', value: 'zh-TW' },
                        { label: '베트남어', value: 'vi' },
                        { label: '인도네시아어', value: 'id' },
                        { label: '태국어', value: 'th' },
                        { label: '독일어', value: 'de' },
                        { label: '러시아어', value: 'ru' },
                        { label: '스페인어', value: 'es' },
                        { label: '이탈리아어', value: 'it' },
                        { label: '프랑스어', value: 'fr' }
                    ])
            );
        
        const embed = new MessageEmbed()
            .setDescription(interaction.targetMessage.content)
        await interaction.reply({ content: '번역될 문장의 언어를 선택해주세요.', embeds: [embed], components: [row], ephemeral: true });
    }
}