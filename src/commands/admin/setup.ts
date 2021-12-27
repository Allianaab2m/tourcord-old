import * as discord from 'discord.js'
import * as fs from 'fs'

import { Bot } from 'src/class/bot'

export const aliases = ['su']

export const configData = {
    adminRoleId: '',
    leaderRoleId: '',
    memberRoleId: '',
    maxTeamMember: 5,
    maxTeam: 64,
    openEntry: false
}

// status表示Embed
const setupStatus = new discord.MessageEmbed()

const setupStatusValue = {
    'inprogress': '🔨実行中',
    'error': '❌エラー',
    'success': '✅完了'
}

const setupStatusFields: discord.EmbedFieldData[] = [
    {
        name: 'セットアップ実行内容',
        value: '状態',
    },
    {
        name: 'データ格納ディレクトリの作成',
        value: setupStatusValue.inprogress
    },
    {
        name: 'Admin役職の作成',
        value: setupStatusValue.inprogress
    },
    {
        name: 'Admin専用チャンネルの作成',
        value: setupStatusValue.inprogress
    },
    {
        name: 'Leader役職の作成',
        value: setupStatusValue.inprogress
    },
    {
        name: 'Leader,Admin専用チャンネルの作成',
        value: setupStatusValue.inprogress
    },
    {
        name: 'Member役職の作成',
        value: setupStatusValue.inprogress
    },
    {
        name: '全体通知用チャンネルの作成',
        value: setupStatusValue.inprogress
    },
    {
        name: 'コンフィグファイルの作成',
        value: setupStatusValue.inprogress
    },
]

setupStatus.setTitle('セットアップを実行しています。')
setupStatus.setDescription('しばらくお待ちください。')
setupStatus.addFields(setupStatusFields)

const setupStatusEmbedEdit = (
    status: keyof typeof setupStatusValue,
    index: number,
    statusMessage: discord.Message) => {
    setupStatusFields[index].value = setupStatusValue[status]
    setupStatus.setFields(setupStatusFields)
    statusMessage.edit({ embeds: [setupStatus] })
}

export const setup = async (bot: Bot, message: discord.Message, args: string[]) => {
    if (!message.guild) {
        message.channel.send('このコマンドはサーバー内で実行してください。')
        return
    }

    const statusMessage = await message.channel.send({
        embeds: [setupStatus]
    })

    // データ格納ディレクトリの作成
    if (fs.existsSync(`./data/${message.guildId}`)) {
        setupStatusEmbedEdit('success', 1, statusMessage)
    } else {
        fs.mkdir(`./data/${message.guildId}`, (err) => {
            if (err) {
                setupStatusEmbedEdit('error', 1, statusMessage)
                console.error(err)
            }
        })
        setupStatusEmbedEdit('success', 1, statusMessage)
    }

    // Admin役職の作成
    let adminRole = message.guild.roles.cache.find(role => role.name === 'tc-Admin')
    if (!adminRole) {
        adminRole = await message.guild.roles.create({
            name: 'tc-Admin',
            color: 'YELLOW',
            position: 0,
            mentionable: true
        })
    }
    setupStatusEmbedEdit('success', 2, statusMessage)

    // Admin専用チャンネルの作成
    const adminCategoryName = 'adminonly'
    const adminTextName = 'text-admin'
    const adminVoiceName = 'voice-admin'

    const adminCategory = message.guild.channels.cache
        .find(channel => channel.name === adminCategoryName && channel.type === 'GUILD_CATEGORY')

    if (adminCategory) {
        message.guild.channels.create(adminTextName, {
            type: 'GUILD_TEXT',
            parent: adminCategory.id,
        })
        message.guild.channels.create(adminVoiceName, {
            type: 'GUILD_VOICE',
            parent: adminCategory.id,
        })

        setupStatusEmbedEdit('success', 3, statusMessage)
    } else {
        const adminCategory = await message.guild.channels.create(
            adminCategoryName,
            {
                type: 'GUILD_CATEGORY',
                permissionOverwrites: [
                    {
                        id: message.guild.roles.everyone,
                        deny: ['VIEW_CHANNEL', 'SEND_MESSAGES']
                    },
                    {
                        id: adminRole.id,
                        allow: ['VIEW_CHANNEL', 'SEND_MESSAGES']
                    }
                ]
            }
        )

        message.guild.channels.create(adminTextName, {
            type: 'GUILD_TEXT',
            parent: adminCategory.id,
        })

        message.guild.channels.create(adminVoiceName, {
            type: 'GUILD_VOICE',
            parent: adminCategory.id,
        })

        setupStatusEmbedEdit('success', 3, statusMessage)
    }

    // Leader役職の作成
    let leaderRole = message.guild.roles.cache.find(role => role.name === 'tc-Leader')
    if (!leaderRole) {
        leaderRole = await message.guild.roles.create({
            name: 'tc-Leader',
            color: 'GREEN',
            position: 1,
        })
    }
    setupStatusEmbedEdit('success', 4, statusMessage)

    // Leader, Admin専用チャンネルの作成
    const leaderCategoryName = 'leaderonly'
    const leaderTextName = 'text-leader'
    const leaderVoiceName = 'voice-leader'

    const leaderCategory = message.guild.channels.cache
        .find(channel => channel.name === leaderCategoryName && channel.type === 'GUILD_CATEGORY')

    if (leaderCategory) {
        message.guild.channels.create(leaderTextName, {
            type: 'GUILD_TEXT',
            parent: leaderCategory.id,
        })
        message.guild.channels.create(leaderVoiceName, {
            type: 'GUILD_VOICE',
            parent: leaderCategory.id,
        })

        setupStatusEmbedEdit('success', 5, statusMessage)
    } else {
        const leaderCategory = await message.guild.channels.create(
            leaderCategoryName,
            {
                type: 'GUILD_CATEGORY',
                permissionOverwrites: [
                    {
                        id: message.guild.roles.everyone,
                        deny: ['VIEW_CHANNEL', 'SEND_MESSAGES']
                    },
                    {
                        id: leaderRole.id,
                        allow: ['VIEW_CHANNEL', 'SEND_MESSAGES']
                    },
                    {
                        id: adminRole.id,
                        allow: ['VIEW_CHANNEL', 'SEND_MESSAGES']
                    }
                ]
            }
        )

        message.guild.channels.create(leaderTextName, {
            type: 'GUILD_TEXT',
            parent: leaderCategory.id,
        })

        message.guild.channels.create(leaderVoiceName, {
            type: 'GUILD_VOICE',
            parent: leaderCategory.id,
        })

        setupStatusEmbedEdit('success', 5, statusMessage)
    }

    // Member役職の作成
    let memberRole = message.guild.roles.cache.find(role => role.name === 'tc-Member')
    if (!memberRole) {
        memberRole = await message.guild.roles.create({
            name: 'tc-Member',
            color: 'BLUE',
            position: 2,
        })
    }
    setupStatusEmbedEdit('success', 6, statusMessage)

    // 全体通知用チャンネルの作成
    const announceChannelName = '大会アナウンス'
    let announceChannel = message.guild.channels.cache
        .find(channel => channel.name === announceChannelName && channel.type === 'GUILD_TEXT')
    if (!announceChannel) {
        announceChannel = await message.guild.channels.create(announceChannelName, {
            type: 'GUILD_TEXT',
            permissionOverwrites: [
                {
                    id: message.guild.roles.everyone,
                    deny: ['SEND_MESSAGES']
                },
                {
                    id: adminRole.id,
                    allow: ['SEND_MESSAGES']
                }
            ]
        })
    }
    setupStatusEmbedEdit('success', 7, statusMessage)

    // コンフィグファイルの作成
    configData.adminRoleId = adminRole.id
    configData.leaderRoleId = leaderRole.id
    configData.memberRoleId = memberRole.id

    fs.writeFileSync(`./data/${message.guildId}/config.json`, JSON.stringify(configData))
    setupStatusEmbedEdit('success', 8, statusMessage)
}
