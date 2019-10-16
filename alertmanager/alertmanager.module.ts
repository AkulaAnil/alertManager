import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, PreloadAllModules } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AlertRoutes } from './alertmanager.router';
import { AlertmanagerComponent } from './manage/alertmanager.component';
import { AvatarModule } from 'ngx-avatar';
import { InternationalPhoneModule } from 'ng4-intl-phone';
import { TranslateModule } from '@ngx-translate/core';
import { MaterialModule } from '../_shared/material.module';
import { sharedDirectiveModule } from '../_directives/sharedDirectives';
import { CreatealertComponent } from './create/createalert.component';
import { AlertFilterPipe } from './_pipe/AlertFilterPipe';
import { ServiceAlertComponent } from './_model/serviceAlert';
import { DestinationDetailsComponent } from './_model/destinationdetails';
@NgModule({
  imports: [
    CommonModule, 
    RouterModule.forChild(AlertRoutes),
    FlexLayoutModule,
    FormsModule,
    ReactiveFormsModule,
    AvatarModule,
    InternationalPhoneModule,
    TranslateModule,
    MaterialModule,
    sharedDirectiveModule,
  ],
  declarations: [
    AlertmanagerComponent,
    CreatealertComponent,
    AlertFilterPipe,
    ServiceAlertComponent,
    DestinationDetailsComponent
  ],
  entryComponents: [CreatealertComponent,ServiceAlertComponent,DestinationDetailsComponent] 
})
export class AlertsModule { }