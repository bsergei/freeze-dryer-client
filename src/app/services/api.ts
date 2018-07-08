import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { query } from "@angular/animations";
import * as model from "@fd-model";

export * from "@fd-model";

@Injectable()
export class Api {
    constructor(private httpClient: HttpClient) {
    }

    public getTempSensorTypes() {
        return this.httpClient
            .get<model.SensorType[]>('http://192.168.0.147:3030/api/sensor/type');
    }

    public getTempSensorOpts() {
        return this.httpClient
            .get<model.SensorOpt[]>('http://192.168.0.147:3030/api/sensor/opt');
    }

    public updateTempSensorOpt(sensorOpt: model.SensorOpt) {
        return this.httpClient
            .post<model.SensorOpt>('http://192.168.0.147:3030/api/sensor/opt', sensorOpt);
    }

    public getTempSensorIds() {
        return this.httpClient
            .get<model.SensorTemp[]>('http://192.168.0.147:3030/api/sensor/temp?sensor_id');
    }

    public getTempSensorValue(sensorId: string) {
        return this.httpClient
            .get<model.SensorTemp>('http://192.168.0.147:3030/api/sensor/temp/' + sensorId);
    }

    public getTempSensorValues() {
        return this.httpClient
            .get<model.SensorTemp[]>('http://192.168.0.147:3030/api/sensor/temp');
    }

    public getSensorsStatus() {
        return this.httpClient
            .get<model.SensorsStatus>('http://192.168.0.147:3030/api/sensors-status');
    }
}