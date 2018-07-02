import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { query } from "@angular/animations";

export interface SensorType {
    id: string;
}

export interface SensorOpt {
    sensor_type: string;
    sensor_id: string;
}

export interface SensorTemp {
    sensor_id: string,
    temperature?: number
}

@Injectable()
export class Api {
    constructor(private httpClient: HttpClient) {
    }

    public getTempSensorTypes() {
        return this.httpClient
            .get<SensorType[]>('http://192.168.0.147:3000/api/sensor/type');
    }

    public getTempSensorOpts() {
        return this.httpClient
            .get<SensorOpt[]>('http://192.168.0.147:3000/api/sensor/opt');
    }

    public updateTempSensorOpt(sensorOpt: SensorOpt) {
        return this.httpClient
            .post<SensorOpt>('http://192.168.0.147:3000/api/sensor/opt', sensorOpt);
    }

    public getTempSensorIds() {
        return this.httpClient
            .get<SensorTemp[]>('http://192.168.0.147:3000/api/sensor/temp?sensor_id');
    }

    public getTempSensorValue(sensorId: string) {
        return this.httpClient
            .get<SensorTemp>('http://192.168.0.147:3000/api/sensor/temp/' + sensorId);
    }

    public getTempSensorValues() {
        return this.httpClient
            .get<SensorTemp[]>('http://192.168.0.147:3000/api/sensor/temp');
    }
}