import { ApplyOptions } from '@sapphire/decorators';
import type { Args } from '@sapphire/framework';
import { SubCommandPluginCommand, SubCommandPluginCommandOptions } from '@sapphire/plugin-subcommands';
import { Message, MessageEmbed } from 'discord.js';
import { Team } from '../lib/team';
import { PrismaClient } from '@prisma/client';
import { customAlphabet } from 'nanoid';

@ApplyOptions<SubCommandPluginCommandOptions>({
	description: 'トーナメントにエントリーします。\n`tc!entry [チーム名]`',
	aliases: ['e'],
	preconditions: ['inGuild']
})
export class UserCommand extends SubCommandPluginCommand {
	public async messageRun(message: Message, args: Args) {
		const waitMessageEmbed = new MessageEmbed().setColor('#0099ff').setTitle('エントリー中').setDescription('しばらくお待ちください。');
		const waitMessage = await message.reply({ embeds: [waitMessageEmbed] });
		const teamName = await args.pick('string').catch(() => undefined);
		if (!teamName) return await waitMessage.edit('チーム名を指定してください。');
		if (message.guild === null) return;

		const createdTeam = await Team.init(teamName, message.guild);
		await message.member?.roles.add(createdTeam.role);
		createdTeam.teamMembersId.push(message.author.id);

		// チームIDの作成
		const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNPQRSTUVWXYZ', 6);
		const teamId = nanoid();

		const prisma = new PrismaClient();
		await prisma.$connect();
		await prisma.team.create({
			data: {
				teamId: teamId,
				guildId: message.guild.id,
				teamName: createdTeam.teamName,
				roleId: createdTeam.role.id,
				categoryChannelId: createdTeam.categoryChannel.id,
				textChannelId: createdTeam.textChannel.id,
				voiceChannelId: createdTeam.voiceChannel.id,
				teamMembersId: createdTeam.teamMembersId.toString()
			}
		});
		await prisma.$disconnect();

		const embed = new MessageEmbed()
			.setTitle('エントリー完了')
			.addField('チーム名', createdTeam.teamName)
			.addField('ID', teamId)
			.addField('チームメンバーを招待するには？', '`tc!invite @メンション`を実行し，チームメンバーにIDを送信してください。')
			.setColor('#00ff00');

		return await waitMessage.edit({ embeds: [embed] });
	}
}
