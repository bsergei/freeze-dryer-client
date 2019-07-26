import { Injectable } from '@angular/core';
import { share } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { SensorsStatus } from '@fd-model';
import { RealtimeService } from './realtime.service';

@Injectable()
export class SensorsService {

    private sensorStatuses$: Observable<SensorsStatus>;

    constructor(
        private realtimeService: RealtimeService) {
        this.sensorStatuses$ =
            this.realtimeService.getSensorsStatus$().pipe(share());
    }

    public getSensorStatuses() {
        return this.sensorStatuses$;
    }
}