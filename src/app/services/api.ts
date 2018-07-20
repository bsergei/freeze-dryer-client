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
            .get<model.SensorType[]>('http://194.158.218.58/api/sensor/type');
    }

    public getTempSensorOpts() {
        return this.httpClient
            .get<model.SensorOpt[]>('http://194.158.218.58/api/sensor/opt');
    }

    public updateTempSensorOpt(sensorOpt: model.SensorOpt) {
        return this.httpClient
            .post<model.SensorOpt>('http://194.158.218.58/api/sensor/opt', sensorOpt);
    }

    public resetBindings() {
        return this.httpClient
            .delete('http://194.158.218.58/api/storage/all')
            .toPromise();
    }

    public getTempSensorIds() {
        return this.httpClient
            .get<model.SensorTemp[]>('http://194.158.218.58/api/sensor/temp?sensor_id');
    }

    public getTempSensorValue(sensorId: string) {
        return this.httpClient
            .get<model.SensorTemp>('http://194.158.218.58/api/sensor/temp/' + sensorId);
    }

    public getTempSensorValues() {
        return this.httpClient
            .get<model.SensorTemp[]>('http://194.158.218.58/api/sensor/temp');
    }

    public getSensorsStatus() {
        return this.httpClient
            .get<model.SensorsStatus>('http://194.158.218.58/api/sensors-status');
    }
}