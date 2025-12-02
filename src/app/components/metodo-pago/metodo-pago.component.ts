import { Component, OnInit } from '@angular/core';
import { MetodoPagoModel } from '../../model/metodo-pago-model';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MetodoPagoService } from '../../service/metodo_pago/metodo-pago.service';
import { NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-metodo-pago',
  standalone: true,
  imports: [ReactiveFormsModule,NgIf,NgFor,FormsModule],
  templateUrl: './metodo-pago.component.html',
  styleUrl: './metodo-pago.component.css'
})
export class MetodoPagoComponent implements OnInit{
  
  listMetodop:MetodoPagoModel[]=[];
  formMetodo:FormGroup=new FormGroup({});
  isUpdate:boolean=false;
  role: MetodoPagoModel | null = null;
  metodoId: number = 0;
  constructor(private metodoservice:MetodoPagoService){}
  ngOnInit(): void {
    this.list();
    this.formMetodo=new FormGroup({
      id: new FormControl(),
      nombre: new FormControl(''),
      estado: new FormControl(true)
    });
  }
  
  list(){
    this.metodoservice.getAll().subscribe(resp=>{
      if (resp) {
        this.listMetodop = resp;     
      }
    });
  }
  save(){
    this.formMetodo.controls['estado'].setValue(true);
    this.metodoservice.save(this.formMetodo.value).subscribe(resp=>{
      this.list();
      this.formMetodo.reset();
     
    });
  }
  update(){
    this.metodoservice.update(this.formMetodo.value).subscribe(resp=>{
      this.list();
      this.formMetodo.reset();
      
    });
  }
  delete(id:any){
    this.metodoservice.delete(id).subscribe(resp=>{
      this.list();
      
    });
  }

  newRol(){
    this.isUpdate=false;
    this.formMetodo.reset();
    
  }
  selectItem(item:any){
    this.isUpdate=true;
    this.formMetodo.controls['id'].setValue(item.id);
    this.formMetodo.controls['nombre'].setValue(item.nombre);
    this.formMetodo.controls['estado'].setValue(item.estado);

  }

  buscarRolePorId() {
    const id = this.metodoId; 
    if (!id) {
      alert('Por favor, ingresa un ID válido.');
      return;
    }
    this.metodoservice.getById(id).subscribe({
      next: (role: MetodoPagoModel) => {
        this.listMetodop = [role];
      },
      error: (err) => {
        console.error('Error al buscar el Role:', err);
        alert('No se encontró un Role con el ID ingresado.');
        this.listMetodop = []; 
      }
    });
  }
}
