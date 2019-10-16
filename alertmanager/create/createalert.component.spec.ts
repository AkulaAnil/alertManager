import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreatealertComponent } from './createalert.component';

describe('CreatealertComponent', () => {
  let component: CreatealertComponent;
  let fixture: ComponentFixture<CreatealertComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreatealertComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreatealertComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
