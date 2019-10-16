import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';
import { IEscalationData } from './alertmanager.model';

@Component({
  selector: 'app-tabledata',
  template: `
  <mat-card style="box-shadow: none; position: relative;">
  <mat-card-header style="border-bottom: 1px solid #eee;">
  <h4 class="details-heading wrap-word w80" >{{'alertModule.create.destinationDetails'| translate}}</h4>
      <button  mat-icon-button [mat-dialog-close] style="position: absolute; right: 1%;" ><i
      class="ti-close"></i></button>
  </mat-card-header>

  <table class="table table-bordered full-width">
  <thead>
    <tr>
      <th class="tbl-c">{{'alertModule.create.enterName'| translate}}</th>
      <th class="tbl-c">{{'alertModule.create.email'| translate}}</th>
      <th class="tbl-c">{{'alertModule.create.Mobile'| translate}}</th>
    </tr>
  </thead>
  <tbody>
    <tr *ngFor="let alert of desDetails">
      <td class="tbl-d">
        {{alert.name}}
      </td>
      <td class="tbl-d">
        {{alert.emailId}}
      </td>
      <td class="tbl-d">
        {{alert.mobileNo}} 
      </td>

    </tr>   
  </tbody>
</table>
</mat-card>`,
})
export class DestinationDetailsComponent {
    
  constructor(@Inject(MAT_DIALOG_DATA) public desDetails: IEscalationData) {
   
    console.log("data:::" , desDetails);

  }


}
