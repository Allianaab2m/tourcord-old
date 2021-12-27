import * as discord from 'discord.js'
import * as csv from 'csv/sync'
import * as fs from 'fs'
import Hashids from 'hashids'

import { Bot } from 'src/class/bot'
import { configJSON, csvData } from 'src/types'

export const entry = async (bot: Bot, message: discord.Message, args: string[]) => {
    if (!message.guild) {
        message.channel.send('このコマンドはサーバー内で実行してください。')
        return
    }
    const csvRawData = fs.readFileSync(`./data/${message.guildId}/tournament.csv`, 'utf8')
    const jsonRawData = fs.readFileSync(`./data/${message.guildId}/config.json`, 'utf8')
    const csvData: csvData[] = csv.parse(csvRawData, { columns: true })
    const jsonData: configJSON = JSON.parse(jsonRawData)
    if (csvData === undefined) {
        message.channel.send('トーナメントが作成されていません。')
        return
    }
    if (jsonData === undefined) {
        message.channel.send('コンフィグが作成されていません。')
        return
    }

    const teamName = args.join(' ')
    if (args.length === 0) {
        const embed = new discord.MessageEmbed()
            .setTitle('エントリー失敗')
            .setDescription('チーム名を指定してください。')
        return message.channel.send({ embeds: [embed]})
    } else if (csvData.find(data => data.leaderId === message.author.id)) {
        const embed = new discord.MessageEmbed()
            .setTitle('エントリー失敗')
            .setDescription('既にエントリー済みです。')
        return message.channel.send({ embeds: [embed] })
    } else if (csvData.find(data => data.teamMembers.includes(message.author.id))) {
        const embed = new discord.MessageEmbed()
            .setTitle('エントリー失敗')
            .setDescription('既にチームに所属しています。')
        return message.channel.send({ embeds: [embed]})
    } else if (csvData.length >= jsonData.maxTeam) {
        const embed = new discord.MessageEmbed()
            .setTitle('エントリー失敗')
            .setDescription('チーム数が上限に達しています。')
        return message.channel.send({ embeds: [embed]})
    } else if (message.guild.channels.cache.find(channel => channel.name === teamName)) {
        const embed = new discord.MessageEmbed()
            .setTitle('エントリー失敗')
            .setDescription('チーム名が既に使用されています。')
        return message.channel.send({ embeds: [embed] })
    }

    const hashids = new Hashids('tc', 8, '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ')
    const matchTimesPerTeams = bot.returnMatchTimesPerTeamsArray(jsonData.maxTeam)
    const teamRole = await message.guild.roles.create({
        name: teamName
    })
    const leaderRole = await message.guild.roles.fetch(jsonData.leaderRoleId)
    const memberRole = await message.guild.roles.fetch(jsonData.memberRoleId)
    const adminRole = await message.guild.roles.fetch(jsonData.adminRoleId)
    message.member?.roles.add(teamRole)
    if (leaderRole === null || memberRole === null || adminRole === null) {
        const embed = new discord.MessageEmbed()
            .setTitle('エントリー成功')
            .setDescription('setupコマンドが実行されていません。運営にお問い合わせください。')
        return message.channel.send({embeds: [embed]})
    }
    message.member?.roles.add(leaderRole)
    message.member?.roles.add(memberRole)

    const teamCategory = await message.guild.channels.create(`${teamName}`, {
        type: 'GUILD_CATEGORY',
        permissionOverwrites: [
            {
                id: message.guild.roles.everyone,
                deny: ['VIEW_CHANNEL']
            },
            {
                id: adminRole,
                allow: ['VIEW_CHANNEL']
            },
            {
                id: teamRole,
                allow: ['VIEW_CHANNEL', 'SEND_MESSAGES']
            }
        ]
    })

    teamCategory.createChannel(`text-${teamName}`, {
        type: 'GUILD_TEXT'
    })
    teamCategory.createChannel(`voice-${teamName}`, {
        type: 'GUILD_VOICE'
    })

    const newData: csvData = {
        id: hashids.encodeHex(teamRole.id).slice(0, 6),
        leaderId: message.author.id,
        teamName: teamName,
        teamRoleId: teamRole.id,
        teamMembers: [message.author.id],
        matchResult: matchTimesPerTeams
    }
    csvData.push(newData)
    const csvDataString = csv.stringify(csvData, { header: true })
    fs.writeFileSync(`./data/${message.guildId}/tournament.csv`, csvDataString)

    const embed = new discord.MessageEmbed()
        .setTitle('エントリー成功')
        .setDescription('エントリーが完了しました。チーム専用チャンネルをご確認ください。')
        .setColor('GREEN')
        .addField('チームID', newData.id)
        .addField('メンバーを招待するには？', `tc/invite @メンション を実行してください。
        inviteコマンド実行後，メンションしたユーザーにチームIDを送信してください。`)
    message.channel.send({embeds: [embed]})
}
