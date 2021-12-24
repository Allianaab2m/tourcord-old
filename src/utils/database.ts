import * as mysql from 'mysql2/promise'

export const createConnnection = async (config: mysql.ConnectionOptions) => {
    const connection = await mysql.createConnection(config)
    return connection
}
