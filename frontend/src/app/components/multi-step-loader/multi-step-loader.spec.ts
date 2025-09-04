import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MultiStepLoader } from './multi-step-loader';

describe('MultiStepLoader', () => {
  let component: MultiStepLoader;
  let fixture: ComponentFixture<MultiStepLoader>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MultiStepLoader]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MultiStepLoader);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
