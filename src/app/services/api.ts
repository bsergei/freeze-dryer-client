import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as model from '@fd-model';
import * as io from 'socket.io-client';
import { Observable } from 'rxjs';
import { flatMap, bufferTime, map, filter, shareReplay } from 'rxjs/operators';

export * from '@fd-model';

@Injectable()
export class Api {

    private socket$: Observable<SocketIOClient.Socket>;
    private host: string;

    constructor(private httpClient: HttpClient) {
        this.host = '/';
        this.socket$ = new Observable<SocketIOClient.Socket>(observer => {
            const socket = io(this.host);
            observer.next(socket);
            return () => {
                socket.disconnect();
            };
        }).pipe(shareReplay(1));
    }

    public getTempSensorTypes() {
        return this.httpClient
            .get<model.SensorType[]>(this.host + '/api/sensor/type');
    }

    public getTempSensorOpts() {
        return this.httpClient
            .get<model.SensorOpt[]>(this.host + '/api/sensor/opt');
    }

    public updateTempSensorOpt(sensorOpt: model.SensorOpt) {
        return this.httpClient
            .post<model.SensorOpt>(this.host + '/api/sensor/opt', sensorOpt);
    }

    public resetBindings() {
        return this.httpClient
            .delete(this.host + '/api/storage/all')
            .toPromise();
    }

    public getTempSensorIds() {
        return this.httpClient
            .get<model.SensorTemp[]>(this.host + '/api/sensor/temp?sensor_id');
    }

    public getTempSensorValue(sensorId: string) {
        return this.httpClient
            .get<model.SensorTemp>(this.host + '/api/sensor/temp/' + sensorId);
    }

    public getTempSensorValues() {
        return this.httpClient
            .get<model.SensorTemp[]>(this.host + '/api/sensor/temp');
    }

    public getSensorsStatus() {
        return this.httpClient
            .get<model.SensorsStatus>(this.host + '/api/sensors-status');
    }

    public getSensorsStatus$() {
        return this.socket$.pipe(
            flatMap(socket => this.subscribe<model.SensorsStatus>(socket, 'sensors-status')));
    }

    public getUnitWorkerStatus$() {
        return this.socket$.pipe(
            flatMap(socket => this.subscribe<model.UnitWorkerStatus>(socket, 'unit-worker-status')));
    }

    private subscribe<T>(socket: SocketIOClient.Socket, ch: string, ) {
        const observable = new Observable<T>(observer => {
            const handler = (data: any) => {
                observer.next(data);
            };
            socket.on(ch, handler);
            return () => {
                socket.removeListener(ch, handler);
            };
        });
        return observable.pipe(
            bufferTime(700),
            map(r => r.length > 0 ? r[r.length - 1] : undefined),
            filter(r => r !== undefined && r !== null));
    }

    public gpioSet(port: number, state: boolean) {
        return this.httpClient
            .get<model.SensorsStatus>(`${this.host}/api/gpio/port/${port}/${state ? '1' : '0' }`);
    }

    public getGpios() {
        return this.httpClient
            .get<model.GpioStatus[]>(this.host + '/api/gpio/all');
    }

    public getUnitWorkerStatus() {
        return this.httpClient
            .get<model.UnitWorkerStatus>(this.host + '/api/unit-worker/status');
    }

    public startUnitWorker(
        unitWorkerId: 'compressor' | 'vacuum' | 'heater',
        params: model.CompressorWorkerParams | model.VacuumWorkerParams | model.HeaterWorkerParams) {
        return this.httpClient
            .post<model.UnitWorkerStatus>(this.host + '/api/unit-worker/start/' + unitWorkerId,
                params)
            .toPromise();
    }

    public getUnitWorkersParams() {
        return this.httpClient
            .get<model.UnitWorkerParams>(this.host + '/api/unit-worker/params')
            .toPromise();
    }

    public stopUnitWorker(unitWorkerId: 'compressor' | 'vacuum' | 'heater') {
        return this.httpClient
            .post<model.UnitWorkerStatus>(this.host + '/api/unit-worker/stop/' + unitWorkerId,
                {})
            .toPromise();
    }

    public systemReboot() {
        return this.httpClient
            .post<{}>(this.host + '/api/system/reboot', {})
            .toPromise();
    }

    public restartCharting() {
        return this.httpClient
            .post<{}>(this.host + '/api/system/restart-charting', {})
            .toPromise();
    }
}
