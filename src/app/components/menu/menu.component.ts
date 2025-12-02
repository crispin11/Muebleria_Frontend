import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { LoginService } from '../../service/login/login.service';


@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [
    CommonModule,    // ✅ Para *ngIf, *ngFor, etc.
    RouterModule     // ✅ Para routerLink, routerLinkActive
  ],
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent {
  sidebarActive = false;
  activeMenus: { [key: string]: boolean } = {};

  constructor(
    private router: Router,
    private loginService: LoginService
  ) {}

  toggleSidebar() {
    this.sidebarActive = !this.sidebarActive;
  }

  toggleSubmenu(menuName: string) {
    this.activeMenus[menuName] = !this.activeMenus[menuName];
  }

  closeSidebarOnMobile() {
    if (window.innerWidth <= 768) {
      this.sidebarActive = false;
    }
  }

  logout() {
    this.loginService.logout();
  }
}