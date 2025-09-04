export class Utilitaire {

    static formateSql(
        operation: 'SELECT' | 'UPDATE' | 'INSERT' | 'DELETE',
        table: string,
        value: { id: string | number |null, [key: string]: any },
        where?: string,
        returning?: string,
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
            const setClause = keys.filter(key => key !== 'id').map((key, idx) => `${key} = $${idx + 1}`).join(', ');
            console.log('SQL query format ', `UPDATE ${table} SET ${setClause} WHERE 1=1 ${where ? ' AND ' + where : ''} RETURNING ${returning || '*'}`)
            return {
                sql: `UPDATE ${table} SET ${setClause} WHERE 1=1 ${where ? ' AND ' + where : ''} RETURNING ${returning || '*'}`
            };
        } else if (operation === 'INSERT') {
            let [schema,name_table] = table.split('.');
            let column_id = `id_${name_table}`;
            const columns = keys.filter(key => (value[key] !== null && key != column_id)).join(', ');
            const values = keys.filter(key => (value[key] !== null && key != column_id)).map((_, idx) => `$${idx + 1}`).join(', ');
            console.log('SQL query format ', `INSERT INTO ${table} (${columns}) VALUES (${values}) RETURNING ${returning || '*'}`)
            return {
                sql: `INSERT INTO ${table} (${columns}) VALUES (${values}) RETURNING ${returning || '*'}`
            };
        } else if (operation === 'DELETE') {
            console.log('table', table)
            let [schema,name_table] = table.split('.');
            let column_id = `id_${name_table}`;
            return {
                sql: `DELETE FROM ${table} WHERE ${column_id} = $1`
            };
        }

        return { sql: '' };
    }

    static async executeSql(
        operation: 'SELECT' | 'UPDATE' | 'INSERT' | 'DELETE' = 'SELECT',
        table: string,
        value: { id: string | number | null, [key: string]: any },
        db: { query: (sql: string, params?: any[]) => Promise<any> },
        where?: string,
        returning?: string,
        ignoring?: string
    ) {
        const { sql } = Utilitaire.formateSql(operation, table, value, where, returning);
        let params: any[] = [];
        const keys = Object.keys(value).filter(key => value[key] !== null);
        if (operation === 'INSERT' || operation === 'UPDATE') {
            params = keys.filter(key => key !== 'id').map(key => { console.log(`Parameter for ${key}:`, value[key]) ; return value[key]});
        } else if (operation === 'DELETE') {
            params = [value.id];
        }
        return db.query(sql, params);
    }


}