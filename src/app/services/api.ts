import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as model from '@fd-model';
import { ConfigurationService } from './configuration.service';

@Injectable()
export class Api {

    private get host(): string {
        return this.configurationService.host;
    }

    constructor(private httpClient: HttpClient,
        private configurationService: ConfigurationService) {
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
            .delete(this.host + '/api/storage/sensor-bindings')
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

    public getRecipeNames() {
        return this.httpClient
            .get<string[]>(this.host + '/api/recipe-storage');
    }

    public addRecipe(name: string): Promise<model.Recipe> {
        const recipe: model.Recipe = {
            name: name,
            entries: []
        }
        return this.httpClient
            .post<model.Recipe>(this.host + '/api/recipe-storage', recipe)
            .toPromise();
    }

    public updateRecipe(recipe: model.Recipe): Promise<model.Recipe> {
        return this.httpClient
            .post<model.Recipe>(this.host + '/api/recipe-storage', recipe)
            .toPromise();
    }

    public deleteRecipe(name: string) {
        return this.httpClient
            .delete(`${this.host}/api/recipe-storage/${name}`)
            .toPromise();
    }

    public getRecipe(recipeName: string) {
        return this.httpClient
            .get<model.Recipe>(`${this.host}/api/recipe-storage/${recipeName}`);
    }

    public startRecipe(recipeName: string, recipeEntryName: string) {
        return this.httpClient
            .post(`${this.host}/api/recipe-runner`, <model.RecipeStartRequest>{
                name: recipeName,
                recipeEntryName: recipeEntryName
            })
            .toPromise();
    }

    public stopRecipe() {
        return this.httpClient
            .delete(`${this.host}/api/recipe-runner`)
            .toPromise();
    }

    public getRecipeRunnerStatus() {
        return this.httpClient
            .get<model.RecipeRuntimeState>(`${this.host}/api/recipe-runner`);
    }
}
