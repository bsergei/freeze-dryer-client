import { Component, Input, OnInit, OnDestroy, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { Api } from 'src/app/services/api';
import { RealtimeService } from 'src/app/services/realtime.service';
import { Subscription } from 'rxjs';
import { RecipeRuntimeState, WorkflowItem, Recipe } from '@fd-model';
import { WorkflowGraph } from '../model/workflow-graph';

@Component({
    selector: 'recipe-animator',
    templateUrl: './recipe-animator.component.html',
    styleUrls: ['./recipe-animator.component.css']
})
export class RecipeAnimatorComponent implements OnInit, OnDestroy {

    @ViewChild('graphViewer', { static: true }) graphViewer: ElementRef;

    public isFinished: boolean;

    public cursor: string;

    public error: string;

    public recipeTime: Date;

    public progress: number;

    public currentStep: string;

    private statesSubscription: Subscription;

    private status: RecipeRuntimeState;

    private lastRecipeEntryName: string;

    private lastRecipeName: string;

    private recipe: Recipe;

    private wfGraph: WorkflowGraph;

    constructor(
        private api: Api,
        private realtimeService: RealtimeService,
        private changeDetectorRef: ChangeDetectorRef) {
    }

    public async ngOnInit() {
    }

    public ngOnDestroy(): void {
        if (this.statesSubscription) {
            this.statesSubscription.unsubscribe();
        }

        if (this.wfGraph) {
            this.wfGraph.destroy();
            this.wfGraph = undefined;
        }
    }

    public async onRecipeChanged(recipeName: string) {
        const status = await this.api.getRecipeRunnerStatus().toPromise();

        if (status && status.recipeName === recipeName) {
            await this.updateStatus(status);
        } else {
            await this.updateStatus({
                recipeName: recipeName,
                cursorStr: '',
                isFinished: true,
                isAborted: false,
                startDate: new Date(),
                steps: [],
                currentStep: undefined,
                endDate: new Date(),
                error: undefined
            });
        }

        if (this.statesSubscription) {
            this.statesSubscription.unsubscribe();
        }

        this.statesSubscription = this.realtimeService.getRecipeRunnerStatus$()
            .subscribe(async status => {
                this.updateStatus(status);
                // this.changeDetectorRef.detectChanges();
            });
    }

    private async updateStatus(status: RecipeRuntimeState) {
        this.status = status;
        this.cursor = status.cursorStr;
        this.isFinished = status.isFinished;
        this.error = status.error;

        if (status.isFinished) {
            this.recipeTime = new Date(+new Date(<any>status.endDate) - +new Date(<any>status.startDate));
        } else {
            this.recipeTime = new Date(+new Date() - +new Date(<any>status.startDate));
        }
        // Compensate timezone.
        this.recipeTime = new Date(this.recipeTime.getTime() + this.recipeTime.getTimezoneOffset()*60000);

        await this.updateRecipeIfNeed(status.recipeName);

        if (!this.recipe || this.recipe.name !== status.recipeName) {
            return;
        }

        const currentStep = status.currentStep;
        if (currentStep) {
            const recipeEntryName = currentStep.recipeEntryName;
            if (recipeEntryName !== this.lastRecipeEntryName) {
                this.lastRecipeEntryName = recipeEntryName;
                const recipeEntry = this.recipe.entries.find(r => r.name === recipeEntryName);
                this.initGraph(recipeEntry.workflow);
            }

            this.currentStep = currentStep.recipeEntryName;

            const currentWorkflowItem = currentStep.currentWorkflowItem;
            if (currentWorkflowItem) {
                const id = currentWorkflowItem.id;
                this.highlightWorkflow(id);

                this.progress = 100 * status.steps.length / this.recipe.entries.length;
            }
        }
    }

    private async updateRecipeIfNeed(recipeName: string) {
        if (this.lastRecipeName !== recipeName) {
            this.lastRecipeName = recipeName;
            if (recipeName) {
                this.recipe = await this.api.getRecipe(this.lastRecipeName).toPromise();
            } else {
                this.recipe = undefined;
            }

            if (this.recipe && this.recipe.entries && this.recipe.entries.length) {
                this.initGraph(this.recipe.entries[0].workflow);
                this.currentStep = this.recipe.entries[0].name;
            } else {
                this.initGraph([]);
            }
        }
    }

    private initGraph(workflowItems: WorkflowItem[]) {
        if (this.wfGraph) {
            this.wfGraph.destroy();
            this.wfGraph = undefined;
        }
        const containerElement = (this.graphViewer.nativeElement as HTMLElement);
        this.wfGraph = new WorkflowGraph(workflowItems, containerElement);
    }

    private highlightWorkflow(workflowItemId: string) {
        if (!this.wfGraph) {
            return;
        }
        this.wfGraph.highlight(workflowItemId, 'green', true);
    }
}