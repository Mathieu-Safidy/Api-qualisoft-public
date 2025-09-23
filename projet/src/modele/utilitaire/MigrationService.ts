import { MigrationRepository } from "./MigrationRepository";

export class MigrationService {
    public static async getAllColumnNames(schema: string, tables: string[]): Promise<{table_name: string, colonnes: string}[]> {
        const result = await MigrationRepository.getAllColumnNames(schema, tables);
        return result;
    }

    public static async importData(table: string, columns: string[], data: any[]): Promise<any> {
        const result = await MigrationRepository.importData(table, columns, data);
        return result;
    }
}