
export class ProductoModel{
    id: number;
    nombre: string;
    tipoProducto: number;
    material: number;
    cantidad:number;
    precio: number;
    medidas:string;
    descripcion:string;
    estado: boolean;
    constructor(){
        this.id=0;
        this.nombre='';
        this.tipoProducto=0;
        this.material=0;
        this.cantidad=0;
        this.precio=0;
        this.medidas='';
        this.descripcion='';
        this.estado=false;
    }
}