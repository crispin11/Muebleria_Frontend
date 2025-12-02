import { Component, OnInit } from '@angular/core';
import { KardexModel } from '../../model/kardex-model';
import { KardexService } from '../../service/kardex/kardex.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-kardex',
  standalone: true,
  imports: [ReactiveFormsModule,NgFor,FormsModule],
  templateUrl: './kardex.component.html',
  styleUrl: './kardex.component.css'
})
export class KardexComponent implements OnInit{
  listkardex:KardexModel[]=[];

  constructor(private servi:KardexService){}
  ngOnInit(): void {
    this.list();

  }
  list(){
    this.servi.getAll().subscribe(resp=>{
      if (resp) {
        this.listkardex = resp;     
      }
    });
  }
}
