import { Component, Input } from '@angular/core';
import { SensorsService } from '../services/sensors.service';
import { Api } from 'src/app/services/api';
import { MatSlideToggleChange } from '@angular/material';
import { Observable, BehaviorSubject, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { GpioStatus } from '@fd-model';

@Component({
    selector: 'relays',
    templateUrl: './relays.component.html',
    styleUrls: ['./relays.component.css']
})
export class RelaysComponent {

    @Input() disabled: boolean = false;

    public relays: Promise<GpioStatus[]>;
    public timestampRelays$: Observable<Date>;
    public gpioValues$ = new BehaviorSubject<{ [id: string]: boolean }>({});

    private gpioValuesSubscription: Subscription;

    public get gpioValues() {
        return this.gpioValues$.value;
    }

    constructor(
        private api: Api,
        private sensorsService: SensorsService) {
        this.init();
    }

    private async init() {

        this.relays = this.api.getGpios().toPromise();
        await this.relays;

        if (this.gpioValuesSubscription) {
            this.gpioValuesSubscription.unsubscribe();
        }

        this.gpioValuesSubscription = this.sensorsService.getSensorStatuses().subscribe(v => {
            const result: { [id: string]: boolean } = {};
            for (const pinConfig of v.gpios) {
                result[pinConfig.id] = pinConfig.value;
            }
            this.gpioValues$.next(result);
        });

        this.timestampRelays$ = this.gpioValues$.pipe(map(r => new Date()));
    }

    async onRelayClick(state: MatSlideToggleChange, relay: GpioStatus) {
        await this.api.gpioSet(relay.port, state.checked).toPromise();
    }

    public ngOnDestroy() {
        if (this.gpioValuesSubscription) {
            this.gpioValuesSubscription.unsubscribe();
        }
    }
}