
export class ProveedorModel{
    id: number;
    razon_social:string;
    ruc:string;
    direccion:string;
    telefono:string;
    estado:boolean ;


    constructor(){
        this.id=0;
        this.razon_social='';
        this.ruc='';
        this.direccion='';
        this.telefono='';
        this.estado=false;
    }
}