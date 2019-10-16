import { Component, OnInit } from '@angular/core';
import { AlertManagerService } from '../_service/alertmanager.service';
import { MatDialogConfig, MatDialog } from '@angular/material';
import { CreatealertComponent } from '../create/createalert.component';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { ActionType, AlertMessageService, AlertType } from '../../_services/alertMessageService';
import { environment } from '../../../environments/environment';
import { IServiceAlertsInfo } from '../_model/alertmanager.model';
import { ServiceAlertComponent } from '../_model/serviceAlert';
import { IUserUpdateDto, AppConfig, ITokenInfo } from '../../_helpers/app.config';

@Component({
  selector: 'app-alertmanager',
  templateUrl: './alertmanager.component.html',
  styleUrls: ['./alertmanager.component.scss']
})
export class AlertmanagerComponent implements OnInit {
  TotalServiceAlerts: IServiceAlertsInfo[]=[];
  loadTotalServiceAlerts: IServiceAlertsInfo[]=[];
  filterServiceAlert: IServiceAlertsInfo[]=[];
  loading:boolean=false;
  searchdata = '';
  _tokenInfo: IUserUpdateDto;
  orgId: number;
  initPage = 0;
  pageSize = environment.pageSize;
  _filterType = '';

  constructor(private alertService:AlertManagerService,private dialog: MatDialog,private translate: TranslateService,
    private router: Router, private alertMessage: AlertMessageService,  private appconfig: AppConfig) {

    let tokenData = this.appconfig.getTokenInfo() as ITokenInfo;
    if (tokenData)
      this._tokenInfo = tokenData.tokenSub;

    if (!this._tokenInfo && tokenData) {
      this.router.navigate(['401']);
    }

  }

  ngOnInit() {
    this.getServiceAlertInfo();
  }

  getServiceAlertInfo() {
    this.loading = true;
    this.filterServiceAlert = [];
    this.alertService.getServiceAlertInfo().subscribe((response: IServiceAlertsInfo[]) => {
      console.log("getServiceAlertInfo response=>", response);
      if (response) {
        if (response.length > 0) {
          this.TotalServiceAlerts = response;
          console.log('this.TotalAlerts::', this.TotalServiceAlerts)
          this.loadTotalServiceAlerts = response;
             this.getData({ pageIndex: this.initPage, pageSize: this.pageSize });
           
        }
        else {        
          this.TotalServiceAlerts = [];
          this.loadTotalServiceAlerts = [];
        }
        
      }
      this.loading = false;
    }, err => {
      let message = err.error.messages as string
      let errorMessage = err.status == 404 ? this.translate.instant('ActionNames.errorResponse') : message ? message : err.message;
      console.log("Failed :: ", JSON.stringify(err));
      this.showAlert(errorMessage, ActionType.ERROR, err.status);
      this.loading = false;
      this.filterServiceAlert = [];
      this.TotalServiceAlerts = [];
      this.loadTotalServiceAlerts = [];
    });
  }

  searchFilter(value) {
    this.filterServiceAlert = [];
    this.searchdata = '';
    switch (value) {
      case '1':
        this.TotalServiceAlerts = this.loadTotalServiceAlerts.filter(data => data.status == true);
        console.log('TotalServiceAlerts=>', this.TotalServiceAlerts);
        if (this.TotalServiceAlerts.length > 0) {
          this.initPage = 0;
          this.getData({ pageIndex: this.initPage, pageSize: this.pageSize });
        }
        else
          this.filterServiceAlert = [];
        break;
      case '0':
        this.TotalServiceAlerts = this.loadTotalServiceAlerts.filter(data => data.status == false);
        console.log('TotalServiceAlerts=>', this.TotalServiceAlerts);
        if (this.TotalServiceAlerts.length > 0) {
          this.initPage = 0;
          this.getData({ pageIndex: this.initPage, pageSize: this.pageSize });
        }
        else
          this.filterServiceAlert = [];
        break;
      default:
        this.TotalServiceAlerts = this.loadTotalServiceAlerts;
        console.log('TotalAlerts=>', this.TotalServiceAlerts);
        if (this.TotalServiceAlerts.length > 0) {
          this.initPage = 0;
          this.getData({ pageIndex: this.initPage, pageSize: this.pageSize });
        }
        else
          this.filterServiceAlert = [];
        break;
    }
  }

  getData(_pageData) {
    let index = 0;
    let startingIndex = _pageData.pageIndex * _pageData.pageSize;
    let endingIndex = startingIndex + _pageData.pageSize;

    this.filterServiceAlert = this.TotalServiceAlerts.filter(() => {
      index++;
      return (index > startingIndex && index <= endingIndex) ? true : false;
    });
    this.initPage = _pageData.pageIndex;
  }

  getDialogConfig(data?: IServiceAlertsInfo): MatDialogConfig {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '45vw';
    dialogConfig.height = '92.5%';
    dialogConfig.panelClass = 'rightdailog';
    dialogConfig.position = { right: '0px', bottom: '0' };
    data ? dialogConfig.data = data : undefined;
    dialogConfig.disableClose = true;
    return dialogConfig;
  }

  createNewAlert() {
    let data = { data: undefined };
    const dialogRef = this.dialog.open(CreatealertComponent, this.getDialogConfig());
    dialogRef.afterClosed().subscribe((response) => {
      if (response) {
        this.getServiceAlertInfo();
      }
    });
  }

  EditServiceAlert(alertdetails:IServiceAlertsInfo) {
    let data = { data: alertdetails };
    console.log("Edit==>", alertdetails)
    const dialogRef = this.dialog.open(CreatealertComponent, this.getDialogConfig(alertdetails));
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.getServiceAlertInfo();
      }
    });
  }

  userActiveDialog(alert: IServiceAlertsInfo, status: boolean) {
    console.log('alert::', alert, "status::", status)
    let data: any = status ? this.translate.instant('alertModule.activate') : this.translate.instant('alertModule.deActivate');
    data = data.replace('{name}', alert.alertName);
    const dialogRef = this.dialog.open(ServiceAlertComponent, this.getStatusConfig(data));
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        alert.status = status;
        let alertStatus = status ? 1 : 0;
        console.log('updateServiceAlertInfoStatus_Request=>', alertStatus)
        this.alertService.updateServiceAlertInfoStatus(alert.alertInfoId, alertStatus)
          .subscribe(response => {
            console.log('updateServiceAlertInfoStatus_Response=>', response)
            if (response.status) {
              this.alertMessage.showAlert(response.messages, ActionType.SUCCESS, AlertType.SUCCESS);
              if (this._filterType != '') {
                this.getServiceAlertInfo();
                this._filterType = '';
                this.searchdata = '';
              }
            } else {
              this.alertMessage.showAlert(response.messages, ActionType.FAILED, AlertType.ERROR);
            }
          }, error => {
            let message = error.error.messages as string
            let errorMessage = error.status == 404 ? this.translate.instant('ActionNames.errorResponse') : message ? message : error.message;
            console.log("Failed :: ", JSON.stringify(error));
            this.showAlert(errorMessage, ActionType.ERROR, error.status);
          });
      }
    });
  }

  getStatusConfig(data?: any): MatDialogConfig {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '250px';
    dialogConfig.disableClose = true;
    data ? dialogConfig.data = data : undefined;
    dialogConfig.disableClose = true;
    return dialogConfig;
  }

  showAlert(error: any, action: ActionType, status: number = 0) {
    if (status == 401)
      this.router.navigate(['401']);
    else setTimeout(() => this.alertMessage.showAlert(error, action));
  }

}
