import { Component, OnInit } from '@angular/core';
import { DetalleVentaModel } from '../../model/detalle-venta-model';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DetalleVentaService } from '../../service/detalle-venta/detalle-venta.service';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-detalle-venta',
  standalone: true,
  imports: [ReactiveFormsModule,NgFor,FormsModule],
  templateUrl: './detalle-venta.component.html',
  styleUrl: './detalle-venta.component.css'
})
export class DetalleVentaComponent implements OnInit {
  listDetallev:DetalleVentaModel[]=[];
  formDetallev:FormGroup=new FormGroup({});
  isUpdate:boolean=false;
  Detalle: DetalleVentaModel | null = null;
  DetalleId: number = 0;
  constructor(private servi:DetalleVentaService){}
  ngOnInit(): void {
    this.list();
    this.formDetallev=new FormGroup({
      id: new FormControl(''),
      venta: new FormControl(''),
      producto: new FormControl(''),
      cantidad: new FormControl(''),
      precioUnitario: new FormControl(''),
      subtotal: new FormControl(''),
      estado: new FormControl(true)
    })
  }
  
  list(){
   
    this.servi.get().subscribe(resp=>{
        if(resp){
          this.listDetallev=resp;
        }
    });
  }
  save(){
    this.servi.save(this.formDetallev.value).subscribe(resp=>{
      this.list();
      this.formDetallev.reset();
    });
  }
  buscarUsuarioPorId() {
    const id = this.DetalleId; 
    if (!id) {
      alert('Por favor, ingresa un ID válido.');
      return;
    }
    this.servi.getById(id).subscribe({
      next: (Detallev: DetalleVentaModel) => {
        this.listDetallev = [Detallev];
      },
      error: (err) => {
        console.error('Error al buscar :', err);
        alert('No se encontró un  con el ID ingresado.');
        this.listDetallev = []; 
      }
    });
  }

}
