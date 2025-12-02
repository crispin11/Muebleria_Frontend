
export class UsuarioModel{
    id: number;
    nombre: string;
    apellido_pa: string;
    apellido_ma: string;
    correo:string;
    password: string;
    role:number;
    estado: boolean;
    constructor(){
        this.id=0;
        this.nombre='';
        this.apellido_pa='';
        this.apellido_ma='';
        this.correo='';
        this.password='';
        this.role=0;
        this.estado=false;
    }
}