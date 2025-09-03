import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './components/header/header';
import { InteractiveBubbleDirective } from './directives/bubble';
import { Router } from '@angular/router';
import { Footer } from './components/footer/footer';
import { MobileNav } from "./components/mobile-nav/mobile-nav";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, InteractiveBubbleDirective, Footer, MobileNav],
  templateUrl: './app.html',
  standalone: true,
})
export class App {
  constructor(public router: Router) {}

  get isHome(): boolean {
    return this.router.url === '/' || window.location.hash === '#about';
  }
}
