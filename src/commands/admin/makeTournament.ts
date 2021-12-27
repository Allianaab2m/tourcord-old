import * as discord from 'discord.js'
import * as csv from 'csv/sync'
import * as fs from 'fs'
import { Bot } from 'src/class/bot'
import { configJSON } from 'src/types'

export const aliases = ['mkTournament', 'mkT']

interface csvData {
    id: string
    leaderId: string
    teamName: string
    teamRoleId: string
    teamMembers: string[]
    matchResult: boolean[]
}

export const makeTournament = async (bot: Bot, message: discord.Message, args: string[]) => {
    if (!message.guild) {
        message.channel.send('このコマンドはサーバー内で実行してください。')
        return
    }

    if (fs.existsSync(`./data/${message.guildId}/tournament.csv`)) {
        const embed = new discord.MessageEmbed()
            .setTitle('トーナメント作成失敗')
            .setDescription('トーナメントが既に作成されています。')
        message.channel.send({embeds: [embed]})
    } else {
        const config: configJSON = JSON.parse(fs.readFileSync(`./data/${message.guildId}/config.json`, 'utf8'))
        const matchTimesPerTeams = bot.returnMatchTimesPerTeamsArray(config.maxTeam)

        const data: csvData[] = [{
            id: '',
            leaderId: '',
            teamName: '',
            teamRoleId: '',
            teamMembers: [''],
            matchResult: matchTimesPerTeams
        }]
        const csvData = csv.stringify(data, {header: true})
        fs.writeFileSync(`./data/${message.guildId}/tournament.csv`, csvData)
        const embed = new discord.MessageEmbed()
            .setTitle('トーナメント作成完了')
            .setDescription('トーナメントを作成しました。')
        message.channel.send({ embeds: [embed]})
    }
}
