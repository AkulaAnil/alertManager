import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { LoadApiUrls } from '../../_helpers/api.urls';
import { ConsumerService } from '../../_helpers/ConsumerService';
import { Observable } from 'rxjs';
import { Floor, IServiceAlertsInfo, ICreateAlertResponse,IParametersNames} from '../_model/alertmanager.model';

@Injectable({
    providedIn: 'root'
})
export class AlertManagerService {
    public component = "ServiceAlerts";
    
    constructor(private apiUrls: LoadApiUrls, private consumer: ConsumerService,private http: HttpClient,) { }

    getLevel(): Observable<Floor[]> {
        let _apiurlsdetials = this.apiUrls.getApiServiceUrlByComponentAndMethod("Service", "getFloorsWithDeptsByFacilitateId")
        console.log("URL Get from config : =====>  ", _apiurlsdetials);
        if (_apiurlsdetials) {
            console.log("URL Get from config : ---->  ", _apiurlsdetials.url);
            return this.consumer.serviceConsumer<Floor[]>(_apiurlsdetials.url, _apiurlsdetials.type, null, 'floors');
        }
        else {
            console.log("URL Get from config : ---->  ", "Url not found..");
            return Observable.throw({ error: { messages: "url not found" } });
        }
    }

    getServiceAlertInfo(): Observable<IServiceAlertsInfo[]> {
        let _apiurlsdetials = this.apiUrls.getApiServiceUrlByComponentAndMethod(this.component, "getServiceAlertInfo")
        console.log("URL Get from config : =====>  ", _apiurlsdetials);
        if (_apiurlsdetials) {
            console.log("URL Get from config : ---->  ", _apiurlsdetials.url);
            return this.consumer.serviceConsumer<IServiceAlertsInfo[]>(_apiurlsdetials.url, _apiurlsdetials.type, null, 'serviceAlertsInfo');
        }
        else {
            console.log("URL Get from config : ---->  ", "Url not found..");
            return Observable.throw({ error: { messages: "url not found" } });
        }
    }
    validateServiceAlertName(alertName) {
        let _apiurlsdetials = this.apiUrls.getApiServiceUrlByComponentAndMethod(this.component, "validateServiceAlertName")
        console.log("URL Get from config : =====>  ", _apiurlsdetials);
        if (_apiurlsdetials) {
          console.log("URL Get from config : ---->  ", _apiurlsdetials.url);
          let _apiUrl = _apiurlsdetials.url.replace("{alertName}", "" + alertName)
          return this.consumer.serviceConsumer<ICreateAlertResponse>(_apiUrl, _apiurlsdetials.type, null, '');
        }
        else {
          console.log("URL Get from config : ---->  ", "Url not found..");
          return Observable.throw({ error: { messages: "url not found" } });
        }
    }
     updateServiceAlertInfoStatus(alertInfoId:number,alertStatus:number): Observable<ICreateAlertResponse> {
        let _apiurlsdetials = this.apiUrls.getApiServiceUrlByComponentAndMethod(this.component, "updateServiceAlertInfoStatus");
        console.log("URL Get from config : =====> ", _apiurlsdetials);
        if (_apiurlsdetials) {
            let url=_apiurlsdetials.url.replace("{alertid}",alertInfoId+'')+"?satus="+alertStatus;
            console.log("URL Get from config : ----> ", url);
            return this.consumer.serviceConsumer<ICreateAlertResponse>(url, _apiurlsdetials.type,null, '');
        }
        else {
            console.log("URL Get from config : ----> ", "Url not found..");
            return Observable.throw({ error: { messages: "url not found" } });
        }
    }

    createServiceAlertInfo(escalationData): Observable<ICreateAlertResponse> {
        let _apiurlsdetials = this.apiUrls.getApiServiceUrlByComponentAndMethod(this.component, "createServiceAlertInfo");
        console.log("URL Get from config : =====> ", _apiurlsdetials);
        if (_apiurlsdetials) {
            console.log("URL Get from config : ----> ", _apiurlsdetials.url);
            return this.consumer.serviceConsumer<ICreateAlertResponse>(_apiurlsdetials.url, _apiurlsdetials.type,escalationData);
        }
        else {
            console.log("URL Get from config : ----> ", "Url not found..");
            return Observable.throw({ error: { messages: "url not found" } });
        }
    }
    getParametersNames(): Observable<IParametersNames[]> {
        let _apiurlsdetials = this.apiUrls.getApiServiceUrlByComponentAndMethod(this.component, "getParametersNames")
        console.log("URL Get from config : =====>  ", _apiurlsdetials);
        if (_apiurlsdetials) {
            console.log("URL Get from config : ---->  ", _apiurlsdetials.url);
            return this.consumer.serviceConsumer<IParametersNames[]>(_apiurlsdetials.url, _apiurlsdetials.type, null, 'parameters');
        }
        else {
            console.log("URL Get from config : ---->  ", "Url not found..");
            return Observable.throw({ error: { messages: "url not found" } });
        }
    }
    updateServiceAlertInfo(escalationData:IServiceAlertsInfo): Observable<ICreateAlertResponse> {
        let _apiurlsdetials = this.apiUrls.getApiServiceUrlByComponentAndMethod(this.component, "updateServiceAlertInfo");
        console.log("URL Get from config : =====> ", _apiurlsdetials);
        if (_apiurlsdetials) {
            console.log("URL Get from config : ----> ", _apiurlsdetials.url);
            return this.consumer.serviceConsumer<ICreateAlertResponse>(_apiurlsdetials.url, _apiurlsdetials.type, escalationData);
        }
        else {
            console.log("URL Get from config : ----> ", "Url not found..");
            return Observable.throw({ error: { messages: "url not found" } });
        }
    }


}
