import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { FormGroup, AbstractControl } from '@angular/forms/src/model';
import { Validators, FormBuilder, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatRadioChange, MatDialog, MatDialogConfig } from '@angular/material';
import { Inject } from '@angular/core';
import { IAlerts, IupdateColumnData, IEscalationData, Floor, IBuildingData, IService, IDepartment, IParametersNames, ICreateAlertResponse, IServiceAlertsInfo, IServiceAlertsDetail } from '../_model/alertmanager.model';
import { Router } from '@angular/router';
import { ActionType, AlertMessageService, AlertType } from '../../_services/alertMessageService';
import { TranslateService } from '@ngx-translate/core';
import { IUserUpdateDto, ITokenInfo, AppConfig } from '../../_helpers/app.config';
import { AlertManagerService } from '../_service/alertmanager.service';
import * as _ from 'lodash';
import { Observable } from 'rxjs';
import { DestinationDetailsComponent } from '../_model/destinationdetails';
import { ServiceAlertComponent } from '../_model/serviceAlert';
@Component({
  selector: 'app-createalert',
  templateUrl: './createalert.component.html',
  styleUrls: ['./createalert.component.scss']
})
export class CreatealertComponent implements OnInit {
  updateDetails: FormGroup;
  alertForm: FormGroup;
  escalationForm: FormGroup;
  loading: boolean = false;
  addflag: boolean = false;
  alertslist: IupdateColumnData[] = [];
  esclationList: IEscalationData[] = [];
  canAdd: number = 0;
  canAddEsc: number = 0;
  hideDetails: boolean = true;
  hideDestDetails: boolean = true;
  alertNotExist: boolean = false;
  escNotExist: boolean = false;
  updateFlag: boolean = false;
  _arabic = /[\u0621-\u064A]/;
  msgPlaceHolder: string = 'Message';
  _unicode = /[^\u0000-\u007F]+/;
  msgCount: number;
  charcount = 0;
  engLength: number = 1848;
  arbLength: number = 804;
  msglength: number = this.engLength;
  format = /[~^\[\]{}|\\]/g;
  oldmessage: string = '';
  _tokenInfo: IUserUpdateDto;
  orgId: number = 0;
  add: string = "Add";
  time: string = "";
  timeValues = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
  startTimeVal: number = 0;
  editEscIndex: number = 0;
  escName: string = '';
  totalLevels: Floor[];
  buildingData: IBuildingData[] = [];
  totalDepartments: IDepartment[];
  floorId: number;
  totalServices: IService[];
  serviceList: IService[] = [];
  servicename: string = '';
  editFlag: boolean = false;
  parametersNames: IParametersNames[] = [];
  mailpattern = /^(\s?[^\s,]+@[^\s,]+\.[^\s,]+\s?,)*(\s?[^\s,]+@[^\s,]+\.[^\s,]+)$/;

  @ViewChild('message', { read: ElementRef }) type: ElementRef;

  constructor(@Inject(MAT_DIALOG_DATA) public _editData: IServiceAlertsInfo, private dialog: MatDialog, private fb: FormBuilder, private alertSrvc: AlertManagerService, public dialogRef: MatDialogRef<CreatealertComponent>, @Inject(MAT_DIALOG_DATA) public _alertdata: IAlerts,
    private translate: TranslateService, private alertMessage: AlertMessageService, private cdRef: ChangeDetectorRef, private appconfig: AppConfig, private router: Router, private alertService: AlertManagerService) {

    let tokenData = this.appconfig.getTokenInfo() as ITokenInfo;
    if (tokenData)
      this._tokenInfo = tokenData.tokenSub;

    if (this._tokenInfo && tokenData) {
      this.orgId = this._tokenInfo.orgId;
    }
    else
      this.router.navigate(['401']);
  }

  ngOnInit() {

    this.alertForm = this.fb.group({
      selectTime: ['0', [Validators.required]],
      AlertName: [null, [Validators.required]],
      floor: [null, [Validators.required]],
      department: [null, [Validators.required]],
      service: [null, [Validators.required]],
      cmessage: [null],
      msgtxt: ['', [Validators.required]],
      validateServiceAlertName: [this._editData != null ? this._editData.alertName : null, [Validators.required], [AlertNameValidator(this.alertSrvc, this._editData != null ? this._editData.alertName : '', this._editData != null ? true : false)]],
    });

    this.alertForm.controls.msgtxt.valueChanges.subscribe((smsText) => {
      this.messageCount(smsText);
    });


    this.escalationForm = this.fb.group({
      lTimeValue: [null, [Validators.required]],
      gTimeValue: [null, [Validators.required]],
      name: [null, [Validators.required]],
      email: [null],
      mobile: [null, [Validators.required]],
      maxalerts: [null, [Validators.required]]
    });
    if (this._editData) {
      console.log("editdata=>", this._editData)
      this.editFlag = true;
      this.alertForm.get('AlertName').setValue(this._editData.alertName);
      this.alertForm.get('msgtxt').setValue(this._editData.message);
      this.alertForm.get('selectTime').setValue(this._editData.alertType);

      this._editData.serviceAlertsTypes.forEach(ele => {
        this.esclationList.push({ escalationType: ele.escalationType, gtValue: ele.gtValue, ltValue: ele.ltValue, serviceAlertsDetails: ele.serviceAlertsDetails });
      });
      this.canAddEsc = this.esclationList.length;
      this.startTimeVal = this._editData.serviceAlertsTypes[this._editData.serviceAlertsTypes.length - 1].ltValue;
    }
    this.getLevel();
    this.getParametersNames();
    if (this._alertdata !== null) {
      this.add = "Second Level Escalation";
    }
    console.log("alertform.value.selectTime=>", this.alertForm.value.selectTime);
    this.time = this.translate.instant('alertModule.create.tirggerSmsif');//this.alertForm.value.selectTime
    this.time = this.time.replace('{time}', this.alertForm.value.selectTime);
  }

  getLevel() {
    this.loading = true;
    console.log("getLevel_Request ==>");
    this.alertService.getLevel().subscribe((response: Floor[]) => {
      console.log("getLevel_Response ==>", response);
      if (response) {
        this.totalLevels = response;
        console.log("totalLevels==>", this.totalLevels);
        this.buildingData = _(this.totalLevels)
          .groupBy('buildId')
          .map((objs, key) => ({
            'buildId': objs.length > 0 ? objs[0].buildId : 0,
            'buildName': objs.length > 0 ? objs[0].buildName : '',
            'floordata': objs
          }))
          .value()
        console.log('buildingData=>', this.buildingData);
        if (this._editData != null || this._editData != undefined) {
          console.log("totals==>", this.totalLevels, this._editData);
          let indl = this.totalLevels.findIndex(data => data.floorId == this._editData.floorId);
          let floordata = [];
          console.log("indl=>", indl);
          if (indl != -1) {
            this.alertForm.get('floor').setValue(this.totalLevels[indl]);
            this.totalDepartments = this.totalLevels[indl].departments;
            let indx = this.totalDepartments.findIndex(data => data.deptId == this._editData.deptId);
            if (indx != -1) {
              this.totalServices = this.totalDepartments[indx].services;
              this.alertForm.get('department').setValue(this._editData.deptId);

              console.log("totalServices=>", this.totalServices);

              let serviceedit: IService[] = [];
              this._editData.serviceAlertsLnk.forEach(element => {
                let index = this.totalServices.findIndex(data => data.serviceId == element.serviceId);
                if (index != -1) {
                  serviceedit.push(this.totalServices[index]);
                }
                console.log("index=>", index);
              });
              this.alertForm.get('service').patchValue(serviceedit);
              console.log("serviceedit=>", serviceedit);
              this.servicename = serviceedit[0].serviceEngName;
            } else
              this.alertMessage.showAlert(this.translate.instant('serviceModule.createservice.levelsError'), ActionType.FAILED);
            console.log("totalDepartments==>", this.totalDepartments, this._editData.deptId);
          }
        }
        else {
          this.buildingData = this.buildingData.filter(x => x.buildId ? x.buildId != 0 : false);
        }
      }
      this.loading = false;
    }, error => {
      let message = error.error.messages as string
      let errorMessage = error.status == 404 ? this.translate.instant('ActionNames.errorResponse') : message ? message : error.message;
      console.log("Failed :: ", JSON.stringify(error));
      this.showAlert(errorMessage, ActionType.ERROR, error.status);
      this.loading = false;
    });
  }

  emailValidation() {
    if (this.escalationForm.value.email != null && this.escalationForm.value.value != '') {
      this.escalationForm.get('email').setValidators([Validators.required, Validators.pattern(this.mailpattern)]);
      this.escalationForm.get('email').updateValueAndValidity();
     
    }
    else if (this.escalationForm.value.email == '') {
      this.escalationForm.get('email').clearValidators();
      this.escalationForm.get('email').updateValueAndValidity();
    
    }
  }
  floorSelection() {

    // if (this._editData == null || !this._editData)
    this.floorId = this.alertForm.value.floor.floorId;
    console.log("fllorId==>", this.totalLevels, this.floorId);
    this.totalDepartments = this.totalLevels.filter(data => data.floorId == this.floorId)[0].departments.filter(x => x.status == 1);
    console.log("totalDepartments==>", this.totalDepartments);
    this.totalDepartments = this.totalDepartments.filter(data => data.deptType !== 0);
    this.alertForm.get('department').setValue(null);
    this.alertForm.get('service').setValue(null);
  }

  deptSelection(value, action: boolean) {
    let deptId = this.alertForm.value.department;
    console.log('this.totalDepartments::', this.totalDepartments)
    this.totalServices = this.totalDepartments.find(data => data.deptId == deptId).services.filter(x => x.status == 1);
    console.log('this.totalServices::', this.totalServices)
    this.totalServices = this.totalServices.filter(data => data.serviceType !== 0);
    this.alertForm.get('service').setValue(null);
  }

  getParametersNames() {
    this.loading = true;
    this.alertService.getParametersNames().subscribe((response: IParametersNames[]) => {
      console.log("getParametersNames response ==>", response);
      this.parametersNames = response;
      this.loading = false;
    },
      err => {
        let message = err.error.messages as string
        let errorMessage = err.status == 404 ? this.translate.instant('ActionNames.errorResponse') : message ? message : err.message;
        console.log("Failed :: ", JSON.stringify(err));
        this.showAlert(errorMessage, ActionType.ERROR, err.status);
        this.loading = false;
      })
  }
  selectedService(services) {
    this.servicename = '';
    if (services) {
      if (services[0].serviceId != 0) {// all not selected 
        this.serviceList = services;
        console.log("serviceList=>", this.serviceList)
        let serviceSelected: IService[] = [];
        serviceSelected = this.alertForm.value.service;
        if (serviceSelected.length > 0) {
          console.log("servicename=>", serviceSelected)
          this.servicename = serviceSelected[0].serviceEngName;
        }
        console.log('this.servicename=>', this.servicename);
      }
    }
    else {
      this.serviceList = [];
    }
  }
  showAlert(error: any, action: ActionType, status: number = 0) {
    if (status == 401)
      this.router.navigate(['401']);
    else setTimeout(() => this.alertMessage.showAlert(error, action));
  }
  addDetails(action?: boolean) {
    if (action) {
      let id = this.alertslist.length > 0 ? this.alertslist[this.alertslist.length - 1].id : 0
      console.log("id=>", id)
      if (this.alertslist.length > 0) {
        console.log("canAdd before =>", this.canAdd);
        this.alertslist.forEach(obj => {
          if (obj.name != this.escalationForm.value.name && obj.mobileNo != this.escalationForm.value.mobile) {

            this.alertNotExist = true;
            return false;
          }

        });

        if (this.alertNotExist) {
          this.canAdd++;
          console.log("canAdd++=>", this.canAdd)
          if (this.canAdd == 5) {
            console.log("canAdd=>")
            this.hideDetails = true;
          }
        } else {
          // this.canAdd = false;
          this.showAlert(this.translate.instant('CreditManagementModule.setNotification.create.duplicateData'), ActionType.ERROR)
        }

      } else {
        console.log('this.canAdd else', this.canAdd);

        this.canAdd++;
        // if(this.canAdd!=0)
        // this.canAdd = 0;

      }
      console.log("this.canAdd", this.canAdd, this.alertslist.length);

      if (this.alertslist.length < this.canAdd) {
        console.log("id1=>", id);
        this.alertslist.push({ id: id + 1, name: this.escalationForm.value.name, emailId: this.escalationForm.value.email, mobileNo: this.escalationForm.value.mobile });
        this.escalationForm.get('name').setValue(null);
        this.escalationForm.get('email').setValue(null);
        this.escalationForm.get('mobile').setValue(null);

      }
    }
    else {
      console.log("this.alertslist==>", this.alertslist);
      this.escalationForm.get('name').setValue(null);
      this.escalationForm.get('email').setValue(null);

    }
    console.log("this.alertslist==>", this.alertslist);


  }

  addCustomField(): void {
    if (this.type) {
      let oldMessage = this.type.nativeElement.value.trim();
      let element = this.type.nativeElement;
      console.log("element==>", element);
      this.type.nativeElement.focus();
      console.log("oldMessage::" + oldMessage);
      let startPos = element.selectionStart;
      let endPos = element.selectionEnd;
      let ddlText = " <$" + this.alertForm.get('cmessage').value + "$> ";
      // let ddlText=this.alertForm.get('cmessage').value;
      let msg = oldMessage.substring(0, startPos) + ddlText + oldMessage.substring(endPos, element.value.length);
      this.alertForm.get('msgtxt').setValue(msg);
      element.setSelectionRange(endPos + ddlText.length, endPos + ddlText.length);
      console.log("Mesage1::::::::" + this.alertForm.get('msgtxt').value);
      this.cdRef.detectChanges();
    }
  }


  messageCount(smsText) {
    if (smsText) {
      this.msgPlaceHolder = this._arabic.test(smsText) ? 'MessageArbic' : (this._unicode.test(smsText) ? 'MessageUnicode' : 'MessageEnglish');

      this.charcount = smsText.length;
      if (this._unicode.test(smsText)) {
        this.msgCount = Math.ceil((this.charcount > 70 ? this.charcount : 67) / 67);
        this.msglength = this.arbLength;
        if (this.charcount > this.arbLength)
          this.alertForm.get('msgtxt').setValue(this.alertForm.value.msgtxt);
      }
      else {
        let formCahr = smsText.match(this.format);
        this.charcount += formCahr == null ? 0 : formCahr.length;
        this.msgCount = Math.ceil((this.charcount > 160 ? this.charcount : 153) / 153);
        this.msglength = this.engLength - (formCahr == null ? 0 : formCahr.length);
        if (this.charcount > this.engLength)
          this.alertForm.get('msgtxt').setValue(this.alertForm.value.msgtxt);
      }
      if (this.msgCount > 12) {
        this.alertForm.get('msgtxt').setValue(this.oldmessage);
      }
      else
        this.oldmessage = smsText;
    }
    else {
      this.oldmessage = '';
      this.msgCount = 0;
      this.charcount = 0;
      this.msgPlaceHolder = 'Message';
    }
    this.cdRef.detectChanges();
  }
  addEsclation(action?: boolean) {
    this.hideDetails = true;
    // this.detailsflag = false;
    // this.escalationflag = true;
    if (action) {

      if (this.esclationList.length > 0) {
        console.log("canAdd before =>", this.canAdd);
        this.esclationList.forEach(obj => {
          if (obj.ltValue != this.escalationForm.value.gTimeValue && obj.gtValue != this.escalationForm.value.lTimeValue && obj.serviceAlertsDetails != this.alertslist) {

            this.escNotExist = true;
            return false;
          }

        });

        if (this.escNotExist) {
          this.canAddEsc++;
          console.log("canAddEsc++=>", this.canAddEsc);
          if (this.canAddEsc == 3) {
            console.log("canAddEsc=>")
            this.hideDestDetails = true;
          }
        } else {
          // this.canAdd = false;
          this.showAlert(this.translate.instant('CreditManagementModule.setNotification.create.duplicateData'), ActionType.ERROR)
        }

      } else {
        this.canAddEsc++;

      }
      console.log("this.canAdd", this.canAdd, this.alertslist.length);

      if (this.esclationList.length < this.canAddEsc) {
        console.log("<>=>", this.escalationForm.value.gTimeValue, this.escalationForm.value.lTimeValue);
        this.esclationList.push({ escalationType: this.canAddEsc, ltValue: this.escalationForm.value.lTimeValue, gtValue: this.escalationForm.value.gTimeValue, serviceAlertsDetails: this.alertslist });
        console.log("this.esclationList=>", this.esclationList)

      }
    }
    else {
      console.log("this.esclationList==>", this.esclationList);

    }

    this.alertslist = [];
    this.startTimeVal = this.escalationForm.value.gTimeValue;
    console.log('this.startTimeVal=>', this.startTimeVal);
    this.escalationForm.get('gTimeValue').setValue(null);
    this.escalationForm.get('lTimeValue').setValue(null);
    console.log("this.esclationList==>", this.esclationList);
  }
  tabledata(data: IServiceAlertsDetail[]) {
    console.log('Destination details=>', data);

    this.dialog.open(DestinationDetailsComponent, this.getConfigData(data));
  }
  getConfigData(data?: IServiceAlertsDetail[]): MatDialogConfig {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '500px';
    dialogConfig.disableClose = true;
    data ? dialogConfig.data = data : undefined;
    dialogConfig.disableClose = true;
    return dialogConfig;
  }

  deleteTableData(alertslist: IupdateColumnData) {
    console.log("alertslist", alertslist);
    this.alertslist.pop();
    if (this.canAdd > 0)
      this.canAdd--;
    console.log('this.canAdd after delete=>', this.canAdd);

    this.hideDetails = false;
    // if (this.canAdd == 0)
    //   this.detailsflag = false;



  }
  TimeSelection() {
    this.escalationForm.get('gTimeValue').setValue(null);
  }
  deleteEscTableData(data: IEscalationData) {
    console.log("data=>", data);
    this.hideDestDetails = true;
    let Escdata: any = this.translate.instant('alertModule.delete');
    Escdata = Escdata.replace('{name}', (data.escalationType == 1 ? this.translate.instant('alertModule.create.level1') : (data.escalationType == 2 ? this.translate.instant('alertModule.create.level2') : this.translate.instant('alertModule.create.level3'))));
    const dialogRef = this.dialog.open(ServiceAlertComponent, this.getConfigData(Escdata));
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log("dataBeforeEsclation=>", data);
        console.log("esclationList_Before=>", this.esclationList.length)
        this.esclationList.pop();
        console.log("esclationList_After=>", this.esclationList.length)
        if (this.esclationList.length != 0)
          this.startTimeVal = this.esclationList[this.esclationList.length - 1].gtValue;
        else
          this.startTimeVal = 0;
        this.escalationForm.get('gTimeValue').setValue(null);
        this.escalationForm.get('lTimeValue').setValue(null);
        this.canAddEsc--;
        console.log("this.startTimeVal=>", this.startTimeVal);
        this.hideDetails = true;
        this.hideDestDetails = false;
        //  this.alertMessage.showAlert(result.messages, ActionType.SUCCESS, AlertType.SUCCESS);
      }
      //   else{
      //  //   this.alertMessage.showAlert(result.messages, ActionType.FAILED, AlertType.ERROR);
      //   }
    })

  }
  expandLegend(legendType: string) {
    if (legendType == '1')
      this.hideDestDetails = !this.hideDestDetails;
    else
      this.hideDetails = !this.hideDetails;

  }
  editEsclation(esclation, index) {
    this.hideDestDetails = false;
    this.editEscIndex = index;
    this.updateFlag = true;
    console.log("editEscIndexlation=>", esclation, esclation.lTimeValue, esclation.gTimeValue)
    this.escalationForm.patchValue({
      lTimeValue: esclation.gtValue + '',
      gTimeValue: esclation.ltValue + ''
    });
    if (this.esclationList.length != 0)
      this.startTimeVal = this.esclationList[this.esclationList.length - 1].gtValue;
    else
      this.startTimeVal = 0;
    this.alertslist = [];
    esclation.serviceAlertsDetails.forEach(element => {
      this.alertslist.push(element);
    });
    this.canAdd = this.alertslist.length;
    //   this.alertslist = esclation.alertData;
    this.escName = (esclation.escalationType == 1 ? this.translate.instant('alertModule.create.level1') : (esclation.escalationType == 2 ? this.translate.instant('alertModule.create.level2') : this.translate.instant('alertModule.create.level3')));
    console.log(this.escalationForm.value);

    // this.detailsflag = true;
    this.hideDetails = !this.hideDetails;
  }
  updateEsclation() {
    this.esclationList[this.editEscIndex].ltValue = this.escalationForm.value.gTimeValue;
    this.esclationList[this.editEscIndex].gtValue = this.escalationForm.value.lTimeValue;
    this.esclationList[this.editEscIndex].serviceAlertsDetails = this.alertslist;

    this.escalationForm.get('gTimeValue').setValue(null);
    this.escalationForm.get('lTimeValue').setValue(null);
    this.escalationForm.get('name').setValue(null);
    this.escalationForm.get('email').setValue(null);
    this.escalationForm.get('mobile').setValue(null);
    this.alertslist = [];
    this.updateFlag = false;
    this.canAdd = 0;
    this.hideDestDetails = true;
  }

  createServiceAlert() {
    let escalationData: IServiceAlertsInfo = {
      alertName: this.alertForm.value.AlertName,
      alertType: this.alertForm.value.selectTime,
      deptId: this.alertForm.value.department,
      floorId: this.alertForm.value.floor.floorId,
      orgId: this.orgId,
      serviceAlertsLnk: this.alertForm.value.service,
      serviceAlertsTypes: this.esclationList,
      buildId: this.alertForm.value.floor.buildId,
      maxAlerts: 0,
      message: this.alertForm.value.msgtxt,
      status: true
    }
    if (!this._editData) {

      console.log('createServiceAlertInfo_Request=>', escalationData);
      this.alertService.createServiceAlertInfo(escalationData).subscribe((response: ICreateAlertResponse) => {
        console.log("createServiceAlertInfo_Response=>", response);
        if (response) {
          if (response.status == true) {
            this.alertMessage.showAlert(response.messages, ActionType.SUCCESS);
            this.dialogRef.close(true);
          }
          else {
            this.alertMessage.showAlert(response.messages, ActionType.FAILED, AlertType.ERROR);
          }
        } else {
          this.alertMessage.showAlert(response.messages, ActionType.FAILED, AlertType.ERROR);
        }
        this.loading = false;
      }, error => {
        let message = error.error.messages as string
        let errorMessage = error.status == 404 ? this.translate.instant('ActionNames.errorResponse') : message ? message : error.message;
        console.log("Failed :: ", JSON.stringify(error));
        this.showAlert(errorMessage, ActionType.ERROR, error.status);
        this.loading = false;
      });
    }
    else {

      escalationData.alertInfoId = this._editData.alertInfoId;

      console.log("updateServiceAlertInfo_Request=>", escalationData);
      this.alertService.updateServiceAlertInfo(escalationData).subscribe((response: ICreateAlertResponse) => {
        console.log("updateServiceAlertInfo_Response=>", response)
        if (response) {
          this.alertMessage.showAlert(response.messages, ActionType.SUCCESS);
          this.dialogRef.close(true);
        } else {
          this.alertMessage.showAlert(response.messages, ActionType.FAILED);
          this.loading = false;
        }
      }, error => {
        let message = error.error.messages as string
        let errorMessage = error.status == 404 ? this.translate.instant('ActionNames.errorResponse') : message ? message : error.message;
        console.log("Failed :: ", JSON.stringify(error));
        this.showAlert(errorMessage, ActionType.ERROR, error.status);
        this.loading = false;
      });
    }
  }

}


export function AlertNameValidator(service: AlertManagerService, name: string, action?: boolean): AsyncValidatorFn {
  return (control: AbstractControl): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> => {
    if (action && name == (control.value as string).trim()) {
      const observable = Observable.create(function subscribe(observer) {
        observer.next({ status: true, message: '' });
        observer.complete();
      });
      return control.value != null ? observable.map(response => {
        console.log(response.status)
        return !response.status ? { invalid: true } : null
      }) : null;
    }
    else
      return control.value != null ? service.validateServiceAlertName((control.value as string).trim())
        .map(response => {
          console.log("validateServiceAlertName =>", response.status)
          return !response.status ? { invalid: true } : null
        }, error => {
          return { invalid: true }
        }) : null;
  };
}
