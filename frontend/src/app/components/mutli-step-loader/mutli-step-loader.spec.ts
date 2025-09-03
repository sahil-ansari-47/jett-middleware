import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MutliStepLoader } from './mutli-step-loader';

describe('MutliStepLoader', () => {
  let component: MutliStepLoader;
  let fixture: ComponentFixture<MutliStepLoader>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MutliStepLoader]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MutliStepLoader);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
