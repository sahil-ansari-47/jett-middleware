import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewDialog } from './new-dialog';

describe('NewDialog', () => {
  let component: NewDialog;
  let fixture: ComponentFixture<NewDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
