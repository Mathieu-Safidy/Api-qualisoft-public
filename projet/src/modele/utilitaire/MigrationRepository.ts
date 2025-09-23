import axios from "axios";
import { pool } from "../database/db";

export class MigrationRepository {
    public static async getAllColumnNames(schema: string, tables: string[]): Promise<{table_name: string, colonnes: string}[]> {
        try {
            let db = pool!;
            let colonne = tables.map(table => `'${table}'`).join(',');
            let sql = `
                SELECT table_name, string_agg(column_name, ', ' ORDER BY ordinal_position) AS colonnes
                FROM information_schema.columns
                WHERE table_schema = '${schema}'
                AND table_name IN (${colonne})
                GROUP BY table_name
                ORDER BY table_name;
            `
            return (await db.query(sql)).rows;
        } catch (error) {
            throw error;
        }
    }

    public static async importData(table: string, columns: string[], data: any[]): Promise<any> {
        try {
            let db = pool!;
            if (data.length === 0) {
                throw new Error("No data to import");
            }
            let connectionString = process.env.DATABASE_URL;
            let body = {
                connectionString,
                tableName: table,
                columns,
                rows: data
            }
            const value = await axios.post(`${process.env.IMPORT_API}`, body)
            return value.data;
        } catch (error) {
            throw error;
        }
    }
}