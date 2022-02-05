import { ApplyOptions } from '@sapphire/decorators';
import { SubCommandPluginCommand, SubCommandPluginCommandOptions } from '@sapphire/plugin-subcommands';
import { Message, MessageEmbed } from 'discord.js';
import { prismaGuildConfCreate } from '../lib/utils';

@ApplyOptions<SubCommandPluginCommandOptions>({
	description: '初期設定を行うコマンドです。サーバーで管理者権限を持っている必要があります。\n`tc!init`',
	preconditions: ['isGuildAdmin', 'inGuild']
})
export class UserCommand extends SubCommandPluginCommand {
	public async messageRun(message: Message) {
		const guild = message.guild;
		if (!guild) return;
		const memberRole = await guild.roles.create({
			name: 'tc-member',
			position: 1
		});

		const adminRole = await guild.roles.create({
			name: 'tc-admin',
			position: 0,
			permissions: ['ADMINISTRATOR']
		});

		await prismaGuildConfCreate(guild.id, {
			guildId: guild.id,
			init: true,
			maxEntryTeams: 64,
			maxTeamMembers: 5,
			memberRoleId: memberRole.id,
			adminRoleId: adminRole.id
		});
		const embed = new MessageEmbed().setTitle('初期設定が完了しました。').setColor('#00FF00');
		return message.reply({ embeds: [embed] });
	}
}
