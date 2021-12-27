export type maxTeams = 4 | 8 | 16 | 32 | 64
export type configJSON = {
    adminRoleId: string
    leaderRoleId: string
    memberRoleId: string
    maxTeamMember: number
    maxTeam: maxTeams
    openEntry: boolean
}

export type csvData = {
    id: string
    leaderId: string
    teamName: string
    teamRoleId: string
    teamMembers: string[]
    matchResult: boolean[]
}
