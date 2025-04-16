import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SensoresComponent } from './sensores.component';

describe('SensoresComponent', () => {
  let component: SensoresComponent;
  let fixture: ComponentFixture<SensoresComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SensoresComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SensoresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
