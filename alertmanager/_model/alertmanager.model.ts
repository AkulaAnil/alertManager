export interface IAlerts{
    floor:string;
    department:string;
    service:string;
    message:string;
    status:boolean;
}
export interface IupdateColumnData {
    id: number;
    emailId: string;
    mobileNo: string;
    name: string;
  }
  export interface IRole {
    roleId: number;
    roleName: string;
}

export interface IDoctor {
    contactNo: string;
    drSegmentId: string;
    firstname: string;
    isactive: number;
    lastname: string;
    login: string;
    roles: IRole[];
    userId: number;
}

export interface IService {
    buildArbName: string;
    buildEngName: string;
    buildId: number;
    deptId: number;
    deptName: string;
    endToken: number;
    floorId: number;
    floorName: string;
    npEarlyCheckin: number;
    npLateCheckin: number;
    orgId: number;
    serviceArName: string;
    serviceColor: string;
    serviceEngName: string;
    serviceId: number;
    servicePrefix: string;
    serviceType: number;
    startToken: number;
    status: number;
}

export interface IDepartment {
    deptArbName: string;
    deptId: number;
    deptName: string;
    deptType: number;
    dept_Multiple_Token: number;
    doctors: IDoctor[];
    floorId: number;
    orgId: number;
    services: IService[];
    status: number;
}

export interface Floor {
    buildArbName: string;
    buildId: number;
    buildName: string;
    departments: IDepartment[];
    floorArbName: string;
    floorId: number;
    floorName: string;
    orgId: number;
}

export interface IFloor {
    floors: Floor[];
}

export interface IBuildingData{
    buildId:number;
    buildName:string;
    floordata:Floor[];
}


export interface IServiceAlertsLnk {
    alertLnkId: number;
    serviceId: number;
}

export interface IServiceAlertsDetail {
    emailId: string;
    id?: number;
    mobileNo: string;
    name: string;
}

export interface IEscalationData {
    alertTypeId?: number;
    escalationType?: number;
    gtValue: number;
    ltValue: number;
    serviceAlertsDetails: IServiceAlertsDetail[];
    status?: number;
    level?:string;
}

export interface IServiceAlertsInfo {
    alertInfoId?: number;
    alertName: string;
    alertType: number;
    buildId: number;
    deptId: number;
    floorId: number;
    interval?: string;
    maxAlerts?: number;
    message: string;
    orgId: number;
    serviceAlertsLnk: IServiceAlertsLnk[];
    serviceAlertsTypes: IEscalationData[];
    status?: boolean;
}

export interface ServiceAlerts {
    serviceAlertsInfo: IServiceAlertsInfo[];
}
export interface ICreateAlertResponse {
    id: number;
    messages: string;
    status: boolean;
}

export interface IParametersNames {
    parameters: string[];
}