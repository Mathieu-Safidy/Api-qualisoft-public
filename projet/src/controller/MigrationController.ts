import { Request, Response } from "express";
import { MigrationService } from "../modele/utilitaire/MigrationService";
import Busboy from "busboy";

export class MigrationController {


    static async getColonne(req: any, res: any) {
        try {
            const { schema, tables } = req.body;
            if (!schema || !tables || tables.length === 0) {
                return res.status(400).json({ error: 'Schema et liste de tables valides sont requis' });
            }
            const columnNames = await MigrationService.getAllColumnNames(schema, tables);
            return res.status(200).json({ columnNames });
        } catch (error) {
            console.error('Error during migration:', error);
            return res.status(500).json({ error: 'Une erreur est survenue lors de la migration' });
        }
    }

    static async importData(req: any, res: any) {
        try {
            const { table , columns , data } = req.body;
            
            if (!table || !data || data.length === 0) {
                return res.status(400).json({ error: 'Table et données valides sont requis' });
            }

            const result = await MigrationService.importData(table, columns, data);
            return res.status(200).json({ message: 'Données importées avec succès', result });
        } catch (error) {
            console.error('Error during data import:', error);
            return res.status(500).json({ error: 'Une erreur est survenue lors de l\'importation des données' });
        }
    }


    public static async importFichier(req: Request, res: Response) {
        const busboy = Busboy({ headers: req.headers });
        const MICROSERVICE_URL = process.env.IMPORT_API || '';

        let tablename: string | null = null;
        let columns: string | null = null;
        let fileReceived = false;

        busboy.on('field', (fieldname, val) => {
            if (fieldname === 'tablename') {
                tablename = val;
            } else if (fieldname === 'columns') {
                columns = val;
            }
        });

        busboy.on('file', (fieldname, file, info) => {
            // Check if file has already been received to prevent multiple file uploads
            if (fileReceived) {
                file.resume(); // Discard the stream
                return;
            }
            fileReceived = true;

            // Wait for all fields to be processed before proceeding
            // This is a simple promise-based approach to ensure fields are available
            const checkFields = () => {
                if (!tablename || !columns) {
                    setTimeout(checkFields, 50); // Retry after 50ms
                } else {
                    console.log(`Receiving file '${info.filename}' and streaming to microservice...`);
                    
                    const microserviceUrlParams = `${MICROSERVICE_URL}?tableName=${tablename}&columns=${encodeURIComponent(columns)}`;
                    
                    axios.post(microserviceUrlParams, file, {
                        headers: {
                            'Content-Type': info.mimeType,
                            'Content-Length': req.headers['content-length']
                        }
                    })
                    .then(microserviceResponse => {
                        if (microserviceResponse.status === 202) {
                            res.status(202).send({ message: 'Import started' });
                        } else {
                            res.status(500).send({ message: 'Microservice error' });
                        }
                    })
                    .catch(error => {
                        console.error('Streaming proxy error:', error);
                        res.status(500).send({ message: 'Streaming failed' });
                    });
                }
            };
            checkFields();
        });

        req.pipe(busboy);
    }
}