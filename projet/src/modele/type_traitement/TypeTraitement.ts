export class TypeTraitement {
    id_type_traitement: number;
    libelle: string;

    constructor(id_type_traitement: number = -1, libelle: string = '') {
        this.id_type_traitement = id_type_traitement;
        this.libelle = libelle;
    }
}