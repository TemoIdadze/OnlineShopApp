import { Component, HostListener } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './shared/header/header.component';
import { FooterComponent } from './shared/footer/footer.component';
import { routeAnimations } from './route-animations';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, FooterComponent],
  templateUrl: './app.component.html',
  animations: [routeAnimations],
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }
    .main-content {
      flex: 1;
      position: relative;
    }

    /* Scroll to Top Button */
    .scroll-to-top {
      position: fixed;
      bottom: 30px;
      right: 30px;
      width: 52px;
      height: 52px;
      background: linear-gradient(135deg, #1a4a4a, #2d6b6b);
      border: none;
      border-radius: 16px;
      color: #fff;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      visibility: hidden;
      transform: translateY(20px) scale(0.8);
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      z-index: 9000;
      box-shadow: 0 4px 20px rgba(26, 74, 74, 0.3);
    }

    .scroll-to-top.visible {
      opacity: 1;
      visibility: visible;
      transform: translateY(0) scale(1);
    }

    .scroll-to-top:hover {
      background: linear-gradient(135deg, #4ecdc4, #3dbdb5);
      transform: translateY(-4px) scale(1.05);
      box-shadow: 0 8px 30px rgba(78, 205, 196, 0.4);
    }

    .scroll-to-top:active {
      transform: translateY(0) scale(0.95);
    }

    .scroll-to-top svg {
      transition: transform 0.3s ease;
    }

    .scroll-to-top:hover svg {
      transform: translateY(-2px);
    }

    /* Dark mode */
    :host-context([data-theme="dark"]) .scroll-to-top {
      background: linear-gradient(135deg, #3d7a7a, #4d9090);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
    }

    :host-context([data-theme="dark"]) .scroll-to-top:hover {
      background: linear-gradient(135deg, #4ecdc4, #5ed8d0);
      box-shadow: 0 8px 30px rgba(78, 205, 196, 0.3);
    }

    /* Mobile adjustments */
    @media (max-width: 768px) {
      .scroll-to-top {
        bottom: 20px;
        right: 20px;
        width: 48px;
        height: 48px;
        border-radius: 14px;
      }
    }
  `]
})
export class AppComponent {
  title = 'MyShop';
  showScrollTop = false;

  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.showScrollTop = window.scrollY > 400;
  }

  scrollToTop(): void {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  prepareRoute(outlet: RouterOutlet) {
    return outlet?.activatedRouteData?.['animation'];
  }
}