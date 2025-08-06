export class ObjectifQualite {
    id_etape_qualite: number;
    seuil_qualite: number;
    coef_rejet: number;
    ordre: number;
    type_de_controle: string;
    id_unite_de_controle: string;
    operation_de_controle: string;
    operation_a_controle: string;
    id_projet: number;

    constructor(init: Partial<ObjectifQualite>) {
        this.id_etape_qualite = init.id_etape_qualite || 0;
        this.seuil_qualite = init.seuil_qualite || 0;
        this.coef_rejet = init.coef_rejet || 0;
        this.ordre = init.ordre || 0;
        this.type_de_controle = init.type_de_controle || '';
        this.id_unite_de_controle = init.id_unite_de_controle || '';
        this.operation_de_controle = init.operation_de_controle || '';
        this.operation_a_controle = init.operation_a_controle || '';
        this.id_projet = init.id_projet || 0;
    }
}