import { Component, OnInit } from '@angular/core';
import { DetallecompraModel } from '../../model/detalle-compra-model';
import { DetalleCompraService } from '../../service/detalle-compra/detalle-compra.service';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-detalle-compra',
  standalone: true,
  imports: [ReactiveFormsModule,NgFor,FormsModule],
  templateUrl: './detalle-compra.component.html',
  styleUrl: './detalle-compra.component.css'
})
export class DetalleCompraComponent implements OnInit {
  listDetallec:DetallecompraModel[]=[];
  formDetallec:FormGroup=new FormGroup({});
  isUpdate:boolean=false;
  Detalle: DetallecompraModel | null = null;
  DetalleId: number = 0;
  constructor(private servi:DetalleCompraService){}
  ngOnInit(): void {
    this.list();
    this.formDetallec=new FormGroup({
      id: new FormControl(''),
      compra: new FormControl(''),
      producto: new FormControl(''),
      cantidad: new FormControl(''),
      precioCompra: new FormControl(''),
      subtotal: new FormControl(''),
      estado: new FormControl(true)
    })
  }
  
  list(){
   
    this.servi.get().subscribe(resp=>{
        if(resp){
          this.listDetallec=resp;
        }
    });
  }
  save(){
    this.servi.save(this.formDetallec.value).subscribe(resp=>{
      this.list();
      this.formDetallec.reset();
    });
  }
  buscarUsuarioPorId() {
    const id = this.DetalleId; 
    if (!id) {
      alert('Por favor, ingresa un ID válido.');
      return;
    }
    this.servi.getById(id).subscribe({
      next: (Detallec: DetallecompraModel) => {
        this.listDetallec = [Detallec];
      },
      error: (err) => {
        console.error('Error al buscar :', err);
        alert('No se encontró un  con el ID ingresado.');
        this.listDetallec = []; 
      }
    });
  }

}
