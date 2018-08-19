import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as model from '@fd-model';

export * from '@fd-model';

const host = 'http://194.158.218.58';

@Injectable()
export class Api {
    constructor(private httpClient: HttpClient) {
    }

    public getTempSensorTypes() {
        return this.httpClient
            .get<model.SensorType[]>(host + '/api/sensor/type');
    }

    public getTempSensorOpts() {
        return this.httpClient
            .get<model.SensorOpt[]>(host + '/api/sensor/opt');
    }

    public updateTempSensorOpt(sensorOpt: model.SensorOpt) {
        return this.httpClient
            .post<model.SensorOpt>(host + '/api/sensor/opt', sensorOpt);
    }

    public resetBindings() {
        return this.httpClient
            .delete(host + '/api/storage/all')
            .toPromise();
    }

    public getTempSensorIds() {
        return this.httpClient
            .get<model.SensorTemp[]>(host + '/api/sensor/temp?sensor_id');
    }

    public getTempSensorValue(sensorId: string) {
        return this.httpClient
            .get<model.SensorTemp>(host + '/api/sensor/temp/' + sensorId);
    }

    public getTempSensorValues() {
        return this.httpClient
            .get<model.SensorTemp[]>(host + '/api/sensor/temp');
    }

    public getSensorsStatus() {
        return this.httpClient
            .get<model.SensorsStatus>(host + '/api/sensors-status');
    }

    public gpioSet(port: number, state: boolean) {
        return this.httpClient
            .get<model.SensorsStatus>(`${host}/api/gpio/port/${port}/${state ? '1' : '0' }`);
    }

    public getGpios() {
        return this.httpClient
            .get<model.GpioStatus[]>(host + '/api/gpio/all');
    }

    public getUnitWorkerStatus() {
        return this.httpClient
            .get<model.UnitWorkerStatus>(host + '/api/unit-worker/status');
    }

    public startUnitWorker(
        unitWorkerId: 'compressor' | 'vacuum' | 'heater',
        params: model.CompressorWorkerParams | model.VacuumWorkerParams | model.HeaterWorkerParams) {
        return this.httpClient
            .post<model.UnitWorkerStatus>(host + '/api/unit-worker/start/' + unitWorkerId,
                params)
            .toPromise();
    }

    public stopUnitWorker(unitWorkerId: 'compressor' | 'vacuum' | 'heater') {
        return this.httpClient
            .post<model.UnitWorkerStatus>(host + '/api/unit-worker/stop/' + unitWorkerId,
                {})
            .toPromise();
    }
}
