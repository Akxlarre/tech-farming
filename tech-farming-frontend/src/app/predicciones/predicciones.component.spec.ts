import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrediccionesComponent } from './predicciones.component';

describe('PrediccionesComponent', () => {
  let component: PrediccionesComponent;
  let fixture: ComponentFixture<PrediccionesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrediccionesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrediccionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
