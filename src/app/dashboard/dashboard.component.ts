import { Component, OnDestroy } from '@angular/core';
import { SensorTemp, Api, SensorTempConnected, SensorsStatus, GpioStatus } from '../services/api';
import { Observable, timer, BehaviorSubject, Subscription } from 'rxjs';
import { map, switchMap, share } from 'rxjs/operators';
import { MatSlideToggleChange } from '@angular/material';

@Component({
  selector: 'dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnDestroy {

  public sensorStatuses$: Observable<SensorsStatus>;
  public temperatures$: Observable<SensorTempConnected[]>;
  public timestamp$: Observable<Date>;

  public relays$: Observable<GpioStatus[]>;
  public timestampRelays$: Observable<Date>;
  public gpioValues$ = new BehaviorSubject<{ [id: string]: boolean }>({});

  private gpioValuesSubscription: Subscription;

  public get gpioValues() {
    return this.gpioValues$.value;
  }

  constructor(private api: Api) {
    this.sensorStatuses$ = timer(0, 10000)
      .pipe(switchMap(r => api.getSensorsStatus()),
        share());
    
    this.temperatures$ = this.sensorStatuses$.pipe(map(r => r.temp_sensors));
    this.timestamp$ = this.temperatures$.pipe(map(r => new Date()));

    this.relays$ = api.getGpios();
    const s = timer(0, 5000)
      .pipe(switchMap(r => api.getGpios()), map(pinConfigs => {
        const result: { [id: string]: boolean } = {};
        for (const pinConfig of pinConfigs) {
          result[pinConfig.id] = pinConfig.value;
        }
        return result;
      }),
        share());
    
    this.gpioValuesSubscription = s.subscribe(v => {
      this.gpioValues$.next(v);
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
