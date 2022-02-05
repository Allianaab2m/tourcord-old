import { ApplyOptions } from '@sapphire/decorators';
import type { Args } from '@sapphire/framework';
import { SubCommandPluginCommand, SubCommandPluginCommandOptions } from '@sapphire/plugin-subcommands';
import { Message, MessageEmbed } from 'discord.js';
import { prismaTeamRead, parseUserId } from '../lib/utils';

@ApplyOptions<SubCommandPluginCommandOptions>({
	description: 'チームにメンバーを招待します。',
	preconditions: ['inGuild', 'isInitialized', 'isTeamMember']
})
export class UserCommand extends SubCommandPluginCommand {
	public async messageRun(message: Message, args: Args) {
		const inviteMember = await args.pick('member').catch(() => null);
		if (!message.guildId) {
			return;
		}
		if (!inviteMember) {
			return message.reply('メンバーを指定してください。');
		}

		const inviteTeam = await prismaTeamRead(message.guildId, undefined, message.author.id);
		if (!inviteTeam) return message.reply('チームが存在しません。');
		const inviteTeamUsers = parseUserId(message.client, inviteTeam.teamMembersId);
		const inviteTeamUsersTag = inviteTeamUsers.map((user) => user.tag);

		const inviteEmbed = new MessageEmbed();
		inviteEmbed.setTitle(`トーナメントのチームに招待されました。`);
		inviteEmbed.addFields([
			{
				name: '参加するには？',
				value: 'このメッセージに返信で，`tc!join [チームID]`と入力してください。'
			},
			{
				name: '招待元情報',
				value: `チーム名: ${inviteTeam.teamName}\nチームメンバー: ${inviteTeamUsersTag.join('\n')}`
			}
		]);
		inviteEmbed.setFooter({
			text: `meta:${message.guildId}`
		});

		const succeedEmbed = new MessageEmbed();
		succeedEmbed.setTitle(`${inviteMember.user.tag}さんを招待しました。`);
		succeedEmbed.setColor('#00FF00');
		await message.reply({ embeds: [succeedEmbed] });
		return await inviteMember.send({ embeds: [inviteEmbed] });
	}
}
