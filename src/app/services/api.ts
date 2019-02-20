import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as model from '@fd-model';
import * as io from 'socket.io-client';
import { Observable } from 'rxjs';
import { share, flatMap, debounceTime, bufferTime, map, filter } from 'rxjs/operators';

export * from '@fd-model';

const host = 'http://192.168.2.57';

@Injectable()
export class Api {

    private socket$: Observable<SocketIOClient.Socket>;

    constructor(private httpClient: HttpClient) {
        this.socket$ = new Observable<SocketIOClient.Socket>(observer => {
            const socket = io(host);
            observer.next(socket);
            return () => {
                socket.disconnect();
            };
        }).pipe(share());
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

    public getUnitWorkersParams() {
        return this.httpClient
            .get<model.UnitWorkerParams>(host + '/api/unit-worker/params')
            .toPromise();
    }

    public stopUnitWorker(unitWorkerId: 'compressor' | 'vacuum' | 'heater') {
        return this.httpClient
            .post<model.UnitWorkerStatus>(host + '/api/unit-worker/stop/' + unitWorkerId,
                {})
            .toPromise();
    }

    public systemReboot() {
        return this.httpClient
            .post<{}>(host + '/api/system/reboot', {})
            .toPromise();
    }

    public restartCharting() {
        return this.httpClient
            .post<{}>(host + '/api/system/restart-charting', {})
            .toPromise();
    }
}
