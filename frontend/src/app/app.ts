import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './components/header/header';
import { InteractiveBubbleDirective } from './directives/bubble';
import { Router } from '@angular/router';
import { Footer } from './components/footer/footer';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, InteractiveBubbleDirective, Footer],
  templateUrl: './app.html',
  standalone: true,
})
export class App {
  constructor(public router: Router) {}

  get isHome(): boolean {
    return this.router.url === '/';
  }
}
