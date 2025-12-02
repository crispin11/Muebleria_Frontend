import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { RoleModel } from '../../model/Role-model';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
import { RoleService } from '../../service/role/role.service';

@Component({
  selector: 'app-role',
  standalone: true,
  imports: [ReactiveFormsModule,NgIf,NgFor,FormsModule],
  templateUrl: './role.component.html',
  styleUrl: './role.component.css' 
})
export class RoleComponent implements OnInit{

  listRole:RoleModel[]=[];
  formRole:FormGroup=new FormGroup({});
  isUpdate:boolean=false;
  role: RoleModel | null = null;
  roleId: number = 0;
  constructor(private roleservice:RoleService){}
  ngOnInit(): void {
    this.list();
    this.formRole=new FormGroup({
      id: new FormControl(),
      nombre: new FormControl(''),
      estado: new FormControl(true)
    });
  }
  
  list(){
    this.roleservice.getUsuario().subscribe(resp=>{
      if (resp) {
        this.listRole = resp;     
      }
    });
  }
  save(){
    this.formRole.controls['estado'].setValue(true);
    this.roleservice.saveUsuario(this.formRole.value).subscribe(resp=>{
      this.list();
      this.formRole.reset();
     
    });
  }
  update(){
    this.roleservice.updateUsuario(this.formRole.value).subscribe(resp=>{
      this.list();
      this.formRole.reset();
      
    });
  }
  delete(id:any){
    this.roleservice.deleteUsuario(id).subscribe(resp=>{
      this.list();
      
    });
  }

  newRol(){
    this.isUpdate=false;
    this.formRole.reset();
    
  }
  selectItem(item:any){
    this.isUpdate=true;
    this.formRole.controls['id'].setValue(item.id);
    this.formRole.controls['nombre'].setValue(item.nombre);
    this.formRole.controls['estado'].setValue(item.estado);

  }

  buscarRolePorId() {
    const id = this.roleId; 
    if (!id) {
      alert('Por favor, ingresa un ID válido.');
      return;
    }
    this.roleservice.getRoleById(id).subscribe({
      next: (role: RoleModel) => {
        this.listRole = [role];
      },
      error: (err) => {
        console.error('Error al buscar el Role:', err);
        alert('No se encontró un Role con el ID ingresado.');
        this.listRole = []; 
      }
    });
  }
  


}
