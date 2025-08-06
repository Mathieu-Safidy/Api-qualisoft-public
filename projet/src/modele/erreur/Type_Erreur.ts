export class TypeErreur {
    id_type_erreur!: string;
    libelle!: string;
    coef!: number;
    est_majeur!: boolean;
    raccourci!: string;
    id_projet!: number;
    
    constructor(init?: Partial<TypeErreur>) {
        Object.assign(this,init);
    }

}