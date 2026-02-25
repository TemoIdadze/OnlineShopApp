import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css',
  styles: [`
    :host {
      display: block;
      margin-top: auto;
    }
    html, body {
      height: 100%;
      margin: 0;
    }
    app-root {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }
    .container {
      flex: 1;
    }
  `]
})
export class FooterComponent {
  currentYear = new Date().getFullYear();

  constructor(public authService: AuthService) {}
}
