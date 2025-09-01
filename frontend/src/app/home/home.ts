import { Component } from '@angular/core';
import { LazyLoadDirective } from '../directives/lazyloader';

@Component({
  selector: 'app-home',
  imports: [LazyLoadDirective],
  templateUrl: './home.html',
  styles: ``
})
export class Home {

}
