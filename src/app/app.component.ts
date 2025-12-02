import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter, Subscription } from 'rxjs';

import { LoginService } from './service/login/login.service';
import { MenuComponent } from './components/menu/menu.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, // ✅ Para *ngIf, *ngFor, etc.
    RouterModule, // ✅ Para <router-outlet>
    MenuComponent, // ✅ Importar MenuComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit, OnDestroy {
  isAuthenticated = false;
  private authSubscription?: Subscription;
  private routesWithoutMenu = ['/login', '/registro', '/forgot-password'];

  constructor(private router: Router, private loginService: LoginService) {}

  ngOnInit() {
    this.authSubscription = this.loginService.isAuthenticated$.subscribe(
      (isAuth) => {
        this.isAuthenticated = isAuth;
      }
    );

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.checkRouteForMenu(event.url);
      });
  }

  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  checkRouteForMenu(url: string) {
    const shouldHideMenu = this.routesWithoutMenu.some((route) =>
      url.includes(route)
    );
    if (shouldHideMenu) {
      this.isAuthenticated = false;
    } else {
      this.isAuthenticated = this.loginService.isAuthenticated();
    }
  }
}
