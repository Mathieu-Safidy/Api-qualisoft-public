export class Erreur {
    id_erreur_suggestion: number;
    libelle: string;

    constructor(id_erreur_suggestion: number, libelle: string) {
        this.id_erreur_suggestion = id_erreur_suggestion;
        this.libelle = libelle;
    }

    toJSON() {
        return {
            id_erreur: this.id_erreur_suggestion,
            type_erreur: this.libelle
        };
    }

}