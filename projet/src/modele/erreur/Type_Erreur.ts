export class TypeErreur {
    id_type_erreur!: string;
    libelle!: string;
    coef!: number;
    est_majeur!: boolean;
    raccourci!: string;
    id_projet!: number;

    control!: string[];

    constructor(init?: Partial<TypeErreur>) {
        Object.assign(this, init);
    }

    static castInsert(data: {id_type_erreur: string,libelle_erreur: string,coef: number, est_majeur: boolean,raccourci: string,id_projet: number}): { libelle: string; coef: number; est_majeur: boolean; raccourci: string; id_projet: number } {
        const instance = {
            libelle: data.libelle_erreur,
            coef: data.coef,
            est_majeur: data.est_majeur,
            raccourci: data.raccourci,
            id_projet: data.id_projet
        }

        return instance;
    }
}