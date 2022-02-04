import { PrismaClient } from '@prisma/client';
import { send } from '@sapphire/plugin-editable-commands';
import { Message, MessageEmbed } from 'discord.js';
import { RandomLoadingMessage } from './constants';
import type { Team } from './team';

/**
 * Picks a random item from an array
 * @param array The array to pick a random item from
 * @example
 * const randomEntry = pickRandom([1, 2, 3, 4]) // 1
 */
export function pickRandom<T>(array: readonly T[]): T {
	const { length } = array;
	return array[Math.floor(Math.random() * length)];
}

/**
 * Sends a loading message to the current channel
 * @param message The message data for which to send the loading message
 */
export function sendLoadingMessage(message: Message): Promise<typeof message> {
	return send(message, { embeds: [new MessageEmbed().setDescription(pickRandom(RandomLoadingMessage)).setColor('#FF0000')] });
}

export async function prismaTeamCreate(guildId: string, team: Team): Promise<void> {
	const prisma = new PrismaClient();
	await prisma.$connect();
	await prisma.team.create({
		data: {
			teamId: team.teamId,
			guildId: guildId,
			teamName: team.teamName,
			roleId: team.role.id,
			categoryChannelId: team.categoryChannel.id,
			textChannelId: team.textChannel.id,
			voiceChannelId: team.voiceChannel.id,
			teamMembersId: team.teamMembersId.toString()
		}
	});
	await prisma.$disconnect();
}

export async function prismaGuildConfCreate(
	guildId: string,
	data: {
		guildId: string;
		init: boolean;
		maxEntryTeams: number;
		maxTeamMembers: number;
		memberRoleId: string;
		adminRoleId: string;
	}
): Promise<void> {
	const prisma = new PrismaClient();
	await prisma.$connect();
	await prisma.guildConf.create({
		data: {
			guildId: guildId,
			init: true,
			maxEntryTeams: data.maxEntryTeams,
			maxTeamMembers: data.maxTeamMembers,
			memberRoleId: data.memberRoleId,
			adminRoleId: data.adminRoleId
		}
	});
	await prisma.$disconnect();
}

export async function prismaGuildConfRead(guildId: string) {
	const prisma = new PrismaClient();
	await prisma.$connect();
	const guildConf = await prisma.guildConf.findFirst({
		where: {
			guildId: guildId,
			init: true
		}
	});
	return guildConf;
}
