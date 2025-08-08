export class ObjectifQualite {
    id_etape_qualite: number;
    seuilQualite: number;
    critereRejet: number;
    ordre: number;
    typeControl: string;
    unite: string;
    operation: string;
    operationAControler: string;
    id_projet: number;

    constructor(init: Partial<ObjectifQualite>) {
        this.id_etape_qualite = init.id_etape_qualite || 0;
        this.seuilQualite = init.seuilQualite || 0;
        this.critereRejet = init.critereRejet || 0;
        this.ordre = init.ordre || 0;
        this.typeControl = init.typeControl || '';
        this.unite = init.unite || '';
        this.operation = init.operation || '';
        this.operationAControler = init.operationAControler || '';
        this.id_projet = init.id_projet || 0;
    }
}