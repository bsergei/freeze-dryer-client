import { Injectable } from '@angular/core';
import { Api, SensorsStatus } from './api';
import { share } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable()
export class SensorsService {

    private sensorStatuses$: Observable<SensorsStatus>;

    constructor(
        private api: Api) {
        this.sensorStatuses$ =
            this.api.getSensorsStatus$().pipe(share());
    }

    public getSensorStatuses() {
        return this.sensorStatuses$;
    }
}