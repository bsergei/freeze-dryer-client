import { Component, Input, OnChanges, SimpleChanges, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { Api, RecipeEntry, WorkflowItem } from 'src/app/services/api';
import { BehaviorSubject, Observable, combineLatest, of, Subscription } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { AddRecipeEntryDialogData, AddRecipeEntryDialogComponent } from '../dialogs/add-recipe-entry-dialog.component';
import { MatDialog } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { ConfirmDialogData, ConfirmDialogComponent } from 'src/app/dialogs/confirm-dialog/confirm-dialog.component';
import { JsonEditorOptions, JsonEditorComponent } from 'ang-jsoneditor';

@Component({
    selector: 'recipe-entries',
    templateUrl: './recipe-entries.component.html',
    styleUrls: ['./recipe-entries.component.css']
})
export class RecipeEntriesComponent implements OnChanges, OnInit, OnDestroy {

    private refreshRecipeEntries$ = new BehaviorSubject(undefined);

    private recipeName$ = new BehaviorSubject<string>(undefined);

    private recipeEntriesSubscription: Subscription;

    @ViewChild(JsonEditorComponent, { static: true }) jsonEditor: JsonEditorComponent;

    @Input()
    public recipeName: string;

    public recipeEntries$: Observable<RecipeEntry[]>;

    public recipeEntries: RecipeEntry[];

    public selection: SelectionModel<RecipeEntry>;

    public editorOptions: JsonEditorOptions;

    public data: any;

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
                this.data = selectedItem.workflow;
            } else {
                this.data = [];
            }
            this.workflowModified = false;
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
                const newSelected = this.recipeEntries.find(i => i.id === selectedItem.id);
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
    }

    public ngOnDestroy(): void {
        this.recipeEntriesSubscription.unsubscribe();
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
                recipe.entries.push({
                    id: data.id,
                    name: data.name,
                    workflow: [
                        <WorkflowItem>{
                            id: 'start_wf',
                            type: 'start',
                            next_id: "init"
                        },
                        <WorkflowItem>{
                            id: "init",
                            type: 'action',
                            cmd: '',
                            next_id: 'end_wf'
                        },
                        <WorkflowItem>{
                            id: 'end_wf',
                            type: 'end'
                        }
                    ]
                });

                await this.api.updateRecipe(recipe);
                this.refresh();
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
                    recipe.entries = recipe.entries.filter(re => re.id !== selectedItem.id);
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
            const entry = recipe.entries.find(re => re.id === selectedItem.id);
            entry.workflow = newWorkflow;
            await this.api.updateRecipe(recipe);

            this.refresh();
        }
    }

    public async moveItemUp() {
        const selectedItem = this.selectedRecipeEntry;
        if (selectedItem) {
            let idx = this.recipeEntries.findIndex(r => r.id === selectedItem.id);
            if (idx >= 0) {
                let arr = this.recipeEntries.filter(r => r.id !== selectedItem.id);

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
            let idx = this.recipeEntries.findIndex(r => r.id === selectedItem.id);
            if (idx >= 0) {
                let arr = this.recipeEntries.filter(r => r.id !== selectedItem.id);

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
}