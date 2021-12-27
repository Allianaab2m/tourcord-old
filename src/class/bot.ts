import * as discord from 'discord.js'
import * as fs from 'fs/promises'

class Cogs {
    cogsDir
    constructor(cogsDir: string) {
        this.cogsDir = cogsDir
    }

    commands: { [key: string]: Function } = {}
    aliases: { [key: string]: string } = {}

    async init () {
        const commands = await fs.readdir(`src/commands/${this.cogsDir}`)
        commands.forEach(async (command) => {
            const commandName = command.split('.')[0]
            const commandFile = await import(`../commands/${this.cogsDir}/${command}`)
            this.commands[commandName] = commandFile[commandName]
            if (commandFile.aliases) {
                commandFile.aliases.forEach((alias: string) => {
                    this.aliases[alias] = commandName
                })
            }
            console.log(`Cog読み込み完了: ${this.cogsDir}/${commandName}`)
        })
    }
}

export class Bot extends discord.Client {
    public adminCogs
    public memberCogs
    public prefixes: {
        admin: string,
        member: string
    }

    public constructor (prefixes: {admin: string, member: string}, options: discord.ClientOptions) {
        super(options)
        this.prefixes = prefixes
        this.adminCogs = new Cogs('admin')
        this.memberCogs = new Cogs('member')
    }

    public handler(bot: Bot, message: discord.Message) {
        if (message.author.bot) return
        let commandName: string
        let args: string[]
        let cogs

        if (message.content.startsWith(this.prefixes.admin) && message.member?.permissions.has('ADMINISTRATOR')) {
            [commandName, ...args] = message.content.slice(this.prefixes.admin.length).split(' ')
            cogs = this.adminCogs
        } else if (message.content.startsWith(this.prefixes.admin)) {
            if (message.member?.roles.cache.find(role => role.name === 'tc-Admin')) {
                [commandName, ...args] = message.content.slice(this.prefixes.admin.length).split(' ')
                cogs = this.adminCogs
            } else {
                return
            }
        } else if (message.content.startsWith(this.prefixes.member)) {
            [commandName, ...args] = message.content.slice(this.prefixes.member.length).split(' ')
            cogs = this.memberCogs
        } else {
            return
        }

        if (commandName in cogs.commands) {
            return cogs.commands[commandName](bot, message, args)
        } else if (commandName in cogs.aliases) {
            return cogs.commands[cogs.aliases[commandName]](bot, message, args)
        } else {
            message.channel.send(`${commandName}コマンドは存在しません`)
        }
    }
}
