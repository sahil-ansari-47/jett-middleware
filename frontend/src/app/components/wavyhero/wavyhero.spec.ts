import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WavyHeroComponent } from './wavyhero';

describe('Wavyhero', () => {
  let component: WavyHeroComponent;
  let fixture: ComponentFixture<WavyHeroComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WavyHeroComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WavyHeroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
// wavy hero spec file