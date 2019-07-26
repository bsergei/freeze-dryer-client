import { Component, Input, OnChanges, SimpleChanges, ViewChild, OnInit, OnDestroy, ElementRef } from '@angular/core';
import { Api } from 'src/app/services/api';
import { BehaviorSubject, Observable, combineLatest, of, Subscription } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { AddRecipeEntryDialogData, AddRecipeEntryDialogComponent } from '../dialogs/add-recipe-entry-dialog.component';
import { MatDialog } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { ConfirmDialogData, ConfirmDialogComponent } from 'src/app/dialogs/confirm-dialog/confirm-dialog.component';
import { JsonEditorOptions, JsonEditorComponent } from 'ang-jsoneditor';
import { ImportDrawioDialogData, ImportDrawioDialog } from '../dialogs/import-drawio-dialog.component';
import { WorkflowGraph } from '../model/workflow-graph';
import { RecipeEntry, WfStart, WfAction, WfEnd } from '@fd-model';

@Component({
    selector: 'recipe-entries',
    templateUrl: './recipe-entries.component.html',
    styleUrls: ['./recipe-entries.component.css']
})
export class RecipeEntriesComponent implements OnChanges, OnInit, OnDestroy {

    private refreshRecipeEntries$ = new BehaviorSubject(undefined);

    private recipeName$ = new BehaviorSubject<string>(undefined);

    private recipeEntriesSubscription: Subscription;

    private workflowGraph: WorkflowGraph;

    @ViewChild(JsonEditorComponent, { static: true }) jsonEditor: JsonEditorComponent;

    @ViewChild('graphViewer', { static: true }) graphViewer: ElementRef;

    @Input()
    public recipeName: string;

    public recipeEntries$: Observable<RecipeEntry[]>;

    public recipeEntries: RecipeEntry[];

    public selection: SelectionModel<RecipeEntry>;

    public editorOptions: JsonEditorOptions;

    public recipeEntryWorkflow: any;

    public workflowModified: boolean;

    public get selectedRecipeEntry() {
        if (this.selection && this.selection.selected && this.selection.selected.length) {
            return this.selection.selected[0];
        }
        return undefined;
    }

    constructor(
        private api: Api,
        private dialog: MatDialog) {

        this.editorOptions = new JsonEditorOptions()
        this.editorOptions.modes = ['code']; // set all allowed modes
        this.editorOptions.mode = 'code';
        this.editorOptions.onChange = () => {
            this.workflowModified = true;
        }

        this.selection = new SelectionModel<RecipeEntry>(false, []);
        this.selection.changed.subscribe(r => {
            const selectedItem = this.selectedRecipeEntry;
            if (selectedItem) {
                this.recipeEntryWorkflow = selectedItem.workflow;
                if (this.jsonEditor) {
                    this.jsonEditor.disabled = false;
                }
            } else {
                this.recipeEntryWorkflow = [];
                if (this.jsonEditor) {
                    this.jsonEditor.disabled = true;
                }
            }
            this.workflowModified = false;

            this.updateGraphViewer();
        });

        this.recipeEntries$ = combineLatest(this.refreshRecipeEntries$, this.recipeName$)
            .pipe(
                switchMap(([_, s]) => s
                    ? this.api.getRecipe(s).pipe(
                        map(r => r ? r.entries : []))
                    : of([])));

        this.recipeEntriesSubscription = this.recipeEntries$.subscribe(r => {
            this.recipeEntries = r;
            const selectedItem = this.selectedRecipeEntry;
            if (selectedItem) {
                this.selection.clear();
                const newSelected = this.recipeEntries.find(i => i.name === selectedItem.name);
                this.selection.select(newSelected);
            }
        });
    }

    public ngOnChanges(changes: SimpleChanges) {
        const recipeNameProp: keyof RecipeEntriesComponent = 'recipeName';
        if (changes[recipeNameProp]) {
            this.recipeName$.next(this.recipeName);
        }
    }

    public ngOnInit(): void {
        this.jsonEditor.disabled = !this.selectedRecipeEntry;
    }

    public ngOnDestroy(): void {
        this.recipeEntriesSubscription.unsubscribe();
        if (this.workflowGraph) {
            this.workflowGraph.destroy();
        }
    }

    private refresh() {
        this.refreshRecipeEntries$.next(undefined);
    }

    public addRecipeEntry() {
        const data = <AddRecipeEntryDialogData>{};
        const dialogRef = this.dialog.open(AddRecipeEntryDialogComponent, {
            width: '250px',
            data: data
        });

        dialogRef.afterClosed().subscribe(async result => {
            if (result === true) {
                const recipe = await this.api.getRecipe(this.recipeName).toPromise();
                if (recipe.entries.findIndex(r => r.name === data.name) < 0) {
                    recipe.entries.push({
                        name: data.name,
                        workflow: this.createDefaultWorkflow()
                    });

                    await this.api.updateRecipe(recipe);
                    this.refresh();
                }
            }
        });
    }

    public editRecipeEntry() {
        if (!this.selectedRecipeEntry) {
            return;
        }
        const data = <AddRecipeEntryDialogData>{
            title: 'Edit Recipe Entry',
            name: this.selectedRecipeEntry.name
        };
        const dialogRef = this.dialog.open(AddRecipeEntryDialogComponent, {
            width: '250px',
            data: data
        });

        dialogRef.afterClosed().subscribe(async result => {
            if (result === true) {
                const recipe = await this.api.getRecipe(this.recipeName).toPromise();
                if (recipe.entries.findIndex(r => r.name === data.name) < 0) {
                    const entry = recipe.entries.find(r => r.name === this.selectedRecipeEntry.name);

                    entry.name = data.name;

                    await this.api.updateRecipe(recipe);
                    this.refresh();
                }
            }
        });
    }

    public deleteRecipeEntry() {
        const selectedItem = this.selectedRecipeEntry;
        if (selectedItem) {
            const data = <ConfirmDialogData>{ text: `Delete recipe entry '${selectedItem.name}'?` };
            const dialogRef = this.dialog.open(ConfirmDialogComponent, {
                width: '250px',
                data: data
            });

            dialogRef.afterClosed().subscribe(async result => {
                if (result === true) {
                    this.selection.toggle(selectedItem);
                    const recipe = await this.api.getRecipe(this.recipeName).toPromise();
                    recipe.entries = recipe.entries.filter(re => re.name !== selectedItem.name);
                    await this.api.updateRecipe(recipe);
                    this.refresh();
                }
            });
        }
    }

    public async saveWorkflow() {
        const selectedItem = this.selectedRecipeEntry;
        if (selectedItem) {
            const newWorkflow = <any>this.jsonEditor.get();

            const recipe = await this.api.getRecipe(this.recipeName).toPromise();
            const entry = recipe.entries.find(re => re.name === selectedItem.name);
            entry.workflow = newWorkflow;
            await this.api.updateRecipe(recipe);

            this.refresh();
        }
    }

    public async moveItemUp() {
        const selectedItem = this.selectedRecipeEntry;
        if (selectedItem) {
            let idx = this.recipeEntries.findIndex(r => r.name === selectedItem.name);
            if (idx >= 0) {
                let arr = this.recipeEntries.filter(r => r.name !== selectedItem.name);

                idx = idx - 1;
                if (idx < 0) {
                    idx = 0;
                }

                arr.splice(idx, 0, selectedItem);
                this.recipeEntries = arr;

                const recipe = await this.api.getRecipe(this.recipeName).toPromise();
                recipe.entries = this.recipeEntries;
                await this.api.updateRecipe(recipe);
                this.refresh();
            }
        }
    }

    public async moveItemDown() {
        const selectedItem = this.selectedRecipeEntry;
        if (selectedItem) {
            let idx = this.recipeEntries.findIndex(r => r.name === selectedItem.name);
            if (idx >= 0) {
                let arr = this.recipeEntries.filter(r => r.name !== selectedItem.name);

                idx = idx + 1;
                if (idx >= arr.length) {
                    arr.push(selectedItem);
                } else {
                    arr.splice(idx, 0, selectedItem);
                }

                this.recipeEntries = arr;

                const recipe = await this.api.getRecipe(this.recipeName).toPromise();
                recipe.entries = this.recipeEntries;
                await this.api.updateRecipe(recipe);
                this.refresh();
            }
        }
    }

    public importGraph() {
        const selectedItem = this.selectedRecipeEntry;
        if (selectedItem) {
            const data = <ImportDrawioDialogData>{};
            const dialogRef = this.dialog.open(ImportDrawioDialog, {
                width: '550px',
                data: data
            });

            dialogRef.afterClosed().subscribe(async result => {
                if (result === true) {
                    this.recipeEntryWorkflow = data.items;
                    this.workflowModified = true;
                }
            });
        }
    }

    public updateGraphViewer() {

        if (this.workflowGraph) {
            this.workflowGraph.destroy();
        }

        const containerElement = (this.graphViewer.nativeElement as HTMLElement);
        while (containerElement.firstChild) {
            containerElement.removeChild(containerElement.firstChild);
        }

        if (this.selectedRecipeEntry) {
            this.workflowGraph = new WorkflowGraph(this.selectedRecipeEntry.workflow, containerElement);
        }
    }

    private createDefaultWorkflow() {
        return [
            <WfStart>{
                id: 'start_wf',
                type: 'start',
                next_id: "init"
            },
            <WfAction>{
                id: "init",
                type: 'action',
                cmd: '',
                next_id: 'end_wf'
            },
            <WfEnd>{
                id: 'end_wf',
                type: 'end'
            }
        ];
    }
}