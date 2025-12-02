export class ClienteModel{
    id: number;
    nombre:string;
    apellido_pa:string;
    apellido_ma:string;
    dni:string;
    telefono:string;
    estado:boolean ;


    constructor(){
        this.id=0;
        this.nombre='';
        this.apellido_pa='';
        this.apellido_ma='';
        this.dni='';
        this.telefono='';
        this.estado=false;
    }
}