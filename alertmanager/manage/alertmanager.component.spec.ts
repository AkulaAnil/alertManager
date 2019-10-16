import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AlertmanagerComponent } from './alertmanager.component';

describe('AlertmanagerComponent', () => {
  let component: AlertmanagerComponent;
  let fixture: ComponentFixture<AlertmanagerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AlertmanagerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AlertmanagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
