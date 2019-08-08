import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { Observable, BehaviorSubject, Subscription } from 'rxjs';
import { Api } from '../services/api';
import { MatSelectChange } from '@angular/material';
import { RecipeRuntimeState } from '@fd-model';
import { RealtimeService } from '../services/realtime.service';
import { map } from 'rxjs/operators';

@Component({
    selector: 'recipes-controller',
    templateUrl: './recipes-controller.component.html',
    styleUrls: ['./recipes-controller.component.css']
})
export class RecipesControllerComponent implements OnInit, OnDestroy {

    @Output() recipeChanged: EventEmitter<string> = new EventEmitter();

    public recipeNames$: Observable<string[]>;

    public lastStatus: RecipeRuntimeState;

    public startDisabled: boolean;

    public stopDisabled: boolean;

    public selectedRecipeName: string;

    private rtStatusSubscription: Subscription;

    constructor(
        private api: Api,
        private realtimeService: RealtimeService) {
        this.recipeNames$ = this.api.getRecipeNames().pipe(map(data => {
            data.sort();
            return data;
        }));
    }

    public async ngOnInit() {
        const status = await this.api.getRecipeRunnerStatus().toPromise();
        this.setLastStatus(status);
        this.recipeChanged.emit(this.selectedRecipeName);

        this.rtStatusSubscription = this.realtimeService.getRecipeRunnerStatus$()
            .subscribe(s => {
                this.setLastStatus(s);
            });
    }

    public ngOnDestroy(): void {
        if (this.rtStatusSubscription) {
            this.rtStatusSubscription.unsubscribe();
        }
    }

    public async onRecipeNameSelectionChange(evt: MatSelectChange) {
        this.selectedRecipeName = evt.value;
        this.recipeChanged.emit(this.selectedRecipeName);
        this.setLastStatus(undefined);
    }

    public async startRecipe() {
        if (this.selectedRecipeName) {
            this.api.startRecipe(this.selectedRecipeName);
        }
    }

    public async stopRecipe() {
        await this.api.stopRecipe();
    }

    private setLastStatus(status: RecipeRuntimeState) {
        this.lastStatus = status;
        if (!status) {
            this.stopDisabled = true;
        } else {
            this.selectedRecipeName = status.recipeName;
            this.stopDisabled = status.isFinished;
        }

        this.startDisabled = (status && !status.isFinished) || !this.selectedRecipeName;
    }
}