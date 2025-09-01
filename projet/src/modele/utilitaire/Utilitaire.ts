export class Utilitaire {

    static formateSql(
        operation: 'SELECT' | 'UPDATE' | 'INSERT',
        table: string,
        value: { id: string | number |null, [key: string]: any },
        where?: string,
        returning?: string
    ) {
        if (!value) {
            return { sql: '' };
        }
        const keys = Object.keys(value).filter(key => value[key] !== null);

        if (operation === 'SELECT') {
            return {
                sql: `SELECT ${keys.join(', ')} FROM ${table} WHERE 1=1 ${where ? ' AND ' + where : ''}`
            };
        } else if (operation === 'UPDATE') {
            const setClause = keys.map((key, idx) => `${key} = $${idx + 1}`).join(', ');
            return {
                sql: `UPDATE ${table} SET ${setClause} WHERE 1=1 ${where ? ' AND ' + where : ''} RETURNING ${returning || '*'}`
            };
        } else if (operation === 'INSERT') {
            const columns = keys.filter(key => value[key] !== null).join(', ');
            const values = keys.filter(key => value[key] !== null).map((_, idx) => `$${idx + 1}`).join(', ');
            return {
                sql: `INSERT INTO ${table} (${columns}) VALUES (${values}) RETURNING ${returning || '*'}`
            };
        }
        return { sql: '' };
    }

    static async executeSql(
        operation: 'SELECT' | 'UPDATE' | 'INSERT' = 'SELECT',
        table: string,
        value: { id: string | number | null, [key: string]: any },
        db: { query: (sql: string, params?: any[]) => Promise<any> },
        where?: string,
        returning?: string
    ) {
        const { sql } = Utilitaire.formateSql(operation, table, value, where, returning);
        let params: any[] = [];
        const keys = Object.keys(value).filter(key => value[key] !== null);
        if (operation === 'INSERT' || operation === 'UPDATE') {
            params = keys.map(key => value[key]);
        }
        return db.query(sql, params);
    }


}