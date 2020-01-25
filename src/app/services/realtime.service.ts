import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { shareReplay, flatMap, bufferTime, map, filter, share } from 'rxjs/operators';
import { SensorsStatus, UnitWorkerStatus, RecipeRuntimeState } from '@fd-model';
import { ConfigurationService } from './configuration.service';

import * as io from 'socket.io-client';

@Injectable()
export class RealtimeService {

    private socket$: Observable<SocketIOClient.Socket>;

    constructor(
        configurationService: ConfigurationService
    ) {
        this.socket$ = new Observable<SocketIOClient.Socket>(observer => {
            const socket = io(configurationService.host);
            observer.next(socket);
            return () => {
                socket.disconnect();
            };
        }).pipe(shareReplay(1));
    }

    public getSensorsStatus$() {
        return this.socket$.pipe(
            flatMap(socket => this.subscribe<SensorsStatus>(socket, 'sensors-status')),
            bufferTime(1000),
            map(r => r.length > 0 ? r[r.length - 1] : undefined),
            filter(r => r !== undefined && r !== null));
    }

    public getUnitWorkerStatus$() {
        return this.socket$.pipe(
            flatMap(socket => this.subscribe<UnitWorkerStatus>(socket, 'unit-worker-status')),
            bufferTime(500),
            map(r => r.length > 0 ? r[r.length - 1] : undefined),
            filter(r => r !== undefined && r !== null));
    }

    public getRecipeRunnerStatus$() {
        return this.socket$.pipe(
            flatMap(socket => this.subscribe<RecipeRuntimeState>(socket, 'recipe-status')));
    }

    private subscribe<T>(socket: SocketIOClient.Socket, ch: string) {
        const observable = new Observable<T>(observer => {
            const handler = (data: any) => {
                observer.next(data);
            };
            socket.on(ch, handler);
            return () => {
                socket.removeListener(ch, handler);
            };
        });

        return observable;
    }
}