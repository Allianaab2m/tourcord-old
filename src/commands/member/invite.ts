import * as discord from 'discord.js'

import { Bot } from 'src/class/bot'

export const invite = (bot: Bot, message: discord.Message, args: String[]) => {
    if (!message.guild) return
    if (!message.member?.roles.cache.find(role => role.name === 'tc-Leader')) {
        const embed = new discord.MessageEmbed()
            .setTitle('招待失敗')
            .setDescription('リーダーではないため，このコマンドを実行できません。')
        return message.channel.send({ embeds: [embed] })
    }
    const inviteMemberId = args[0].slice(3, -1)
    bot.users.fetch(inviteMemberId).then(inviteMember => {
        const inviteDMEmbed = new discord.MessageEmbed()
            .setTitle(`${message.author.tag}さんから招待されました。`)
            .addField('参加するには？', `このメッセージに返信で，リーダーから教えられたIDをそのまま入力してください。`)
            .addField('招待情報',
                `招待者:${message.author.tag}
                招待元サーバー:${message.guild?.name}
            `)
            .setFooter(`meta:${message.guildId}`)
        inviteMember.send({ embeds: [inviteDMEmbed] })
        const embed = new discord.MessageEmbed()
            .setTitle('招待完了')
            .setDescription(`${inviteMember}さんに招待メッセージを送信しました。`)
            .setColor('GREEN')
        message.channel.send({ embeds: [embed] })
    })
}