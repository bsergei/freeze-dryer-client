import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, BehaviorSubject, Subscription } from 'rxjs';
import { Api } from '../services/api';
import { MatSelectChange } from '@angular/material';
import { RecipeRuntimeState } from '@fd-model';
import { RealtimeService } from '../services/realtime.service';

@Component({
    selector: 'recipes-controller',
    templateUrl: './recipes-controller.component.html',
    styleUrls: ['./recipes-controller.component.css']
})
export class RecipesControllerComponent implements OnInit, OnDestroy {

    public recipeNames$: Observable<string[]>;

    public lastStatus: RecipeRuntimeState;

    public startDisabled: boolean;

    public stopDisabled: boolean;

    public selectedRecipeName: string;

    private rtStatusSubscription: Subscription;

    constructor(
        private api: Api,
        private realtimeService: RealtimeService) {
        this.recipeNames$ = this.api.getRecipeNames();
    }

    public async ngOnInit() {
        const status = await this.api.getRecipeRunnerStatus().toPromise();
        this.setLastStatus(status);

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
        this.setLastStatus(this.lastStatus);
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