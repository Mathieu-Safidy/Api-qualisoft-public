export class Utilitaire {

    static formateSql(
        operation: 'SELECT' | 'UPDATE' | 'INSERT' | 'DELETE',
        tables: string,
        value: { id: string | number |null, [key: string]: any },
        where?: string | { [key: string]: any },
        returning?: string,
    ) {
        if (!value) {
            return { sql: '' };
        }
        const keys = Object.keys(value).filter(key => value[key] !== null);

        if (operation === 'SELECT') {
            return {
                sql: `SELECT ${keys.join(', ')} FROM ${tables} WHERE 1=1 ${where ? ' AND ' + where : ''}`
            };
        } else if (operation === 'UPDATE') {
            const setClause = keys.filter(key => key !== 'id').map((key, idx) => `${key} = $${idx + 1}`).join(', ');
            console.log('SQL query format ', `UPDATE ${tables} SET ${setClause} WHERE 1=1 ${where ? ' AND ' + where : ''} RETURNING ${returning || '*'}`)
            return {
                sql: `UPDATE ${tables} SET ${setClause} WHERE 1=1 ${where ? ' AND ' + where : ''} RETURNING ${returning || '*'}`
            };
        } else if (operation === 'INSERT') {
            let [schema,name_table] = tables.split('.');
            let column_id = `id_${name_table}`;
            const columns = keys.filter(key => (value[key] !== null && key != column_id)).join(', ');
            const values = keys.filter(key => (value[key] !== null && key != column_id)).map((_, idx) => `$${idx + 1}`).join(', ');
            console.log('SQL query format ', `INSERT INTO ${tables} (${columns}) VALUES (${values}) RETURNING ${returning || '*'}`)
            return {
                sql: `INSERT INTO ${tables} (${columns}) VALUES (${values}) RETURNING ${returning || '*'}`
            };
        } else if (operation === 'DELETE') {
            console.log('table', tables)
            let [schema,name_table] = tables.split('.');
            let column_id = `id_${name_table}`;
            let sql = '';
            
            
            console.log('WHERE clause for DELETE:', where);
            if (where && typeof where === 'object') {
                // Build WHERE clause from object keys/values
                const whereClauses = Object.entries(where)
                    .map(([key, val], idx) => `${key} = '${val}'`)
                    .join(' AND ');
                where = whereClauses;
                // Update value.id to array of values for params
                // value.id = Object.values(where);
            }

            if (where === undefined && where === '' && where === null) {
                sql = `DELETE FROM ${tables} WHERE ${column_id} = $1`
            } else {
                sql = `DELETE FROM ${tables} WHERE 1=1 and ${where}`
            }
            console.log('SQL query format ', sql)

            return {
                sql
            };
        }

        return { sql: '' };
    }

    static async executeSql(
        operation: 'SELECT' | 'UPDATE' | 'INSERT' | 'DELETE' = 'SELECT',
        table: string,
        value: { id: string | number | null, [key: string]: any },
        db: { query: (sql: string, params?: any[]) => Promise<any> },
        where?: string | { [key: string]: any },
        returning?: string,
        ignoring?: string
    ) {
        const { sql } = Utilitaire.formateSql(operation, table, value, where, returning);
        let params: any[] = [];
        const keys = Object.keys(value).filter(key => value[key] !== null);
        if (operation === 'INSERT' || operation === 'UPDATE') {
            params = keys.filter(key => key !== 'id').map(key => { console.log(`Parameter for ${key}:`, value[key]) ; return value[key]});
        } else if (operation === 'DELETE') {
            if (where && typeof where === 'object') {
                params = []
            } else {
                params = [value.id];
            }
        }
        return db.query(sql, params);
    }


}