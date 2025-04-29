import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvernaderosComponent } from './invernaderos.component';

describe('ZonasComponent', () => {
  let component: InvernaderosComponent;
  let fixture: ComponentFixture<InvernaderosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvernaderosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InvernaderosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
