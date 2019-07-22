import { Component, OnInit } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { Api } from '../services/api';
import { MatDialog, MatSelectChange } from '@angular/material';
import { AddRecipeDialogComponent, AddRecipeDialogData } from './dialogs/add-recipe-dialog.component';
import { ConfirmDialogComponent, ConfirmDialogData } from '../dialogs/confirm-dialog/confirm-dialog.component';
import { switchMap } from 'rxjs/operators';
import { DisplayRecipeCodeDialog, DisplayRecipeCodeDialogData } from './dialogs/display-recipe-code-dialog.component';
import { Title } from '@angular/platform-browser';

@Component({
    selector: 'recipes',
    templateUrl: './recipes.component.html',
    styleUrls: ['./recipes.component.css']
})
export class RecipesComponent implements OnInit {

    public recipeNames$: Observable<string[]>;

    public get selectedRecipeName() {
        return this.selectedRecipeName$.value;
    }

    private selectedRecipeName$ = new BehaviorSubject<string>(undefined);

    private refreshRecipeNames$ = new BehaviorSubject(undefined);

    constructor(
        private api: Api,
        private dialog: MatDialog) {
        this.recipeNames$ =
            this.refreshRecipeNames$.pipe(
                switchMap(() => this.api.getRecipeNames())
            );
    }

    ngOnInit(): void {
    }

    public onRecipeNameSelectionChange(evt: MatSelectChange) {
        this.selectedRecipeName$.next(evt.value);
    }

    public addRecipe() {
        const data = <AddRecipeDialogData>{ name: 'NewRecipe' };
        const dialogRef = this.dialog.open(AddRecipeDialogComponent, {
            width: '250px',
            data: data
        });

        dialogRef.afterClosed().subscribe(async result => {
            if (result === true) {
                const names = await this.api.getRecipeNames().toPromise();
                if (names.indexOf(data.name) < 0) {
                    await this.api.addRecipe(data.name);
                    this.refreshRecipeNames$.next(undefined);
                    this.selectedRecipeName$.next(data.name);
                }
            }
        });
    }

    public deleteRecipe() {
        if (this.selectedRecipeName) {
            const itemToDelete = this.selectedRecipeName;

            const data = <ConfirmDialogData>{ text: `Delete recipe '${itemToDelete}'?` };
            const dialogRef = this.dialog.open(ConfirmDialogComponent, {
                width: '250px',
                data: data
            });

            dialogRef.afterClosed().subscribe(async result => {
                if (result === true) {
                    this.selectedRecipeName$.next(undefined);
                    await this.api.deleteRecipe(itemToDelete);
                    this.refreshRecipeNames$.next(undefined);
                }
            });
        }
    }

    public async showCode() {
        if (this.selectedRecipeName) {
            const recipeName = this.selectedRecipeName;
            const recipe = await this.api.getRecipe(recipeName).toPromise();
            const data = <DisplayRecipeCodeDialogData>{ recipe: recipe };
            this.dialog.open(DisplayRecipeCodeDialog, {
                width: '450px',
                data: data
            });
        }
    }

    public async cloneRecipe() {
        if (this.selectedRecipeName) {
            const recipeName = this.selectedRecipeName;

            const data = <AddRecipeDialogData>{
                name: recipeName + '_Clone',
                title: 'Clone Recipe'
            };
            const dialogRef = this.dialog.open(AddRecipeDialogComponent, {
                width: '250px',
                data: data
            });

            dialogRef.afterClosed().subscribe(async result => {
                if (result === true) {
                    const names = await this.api.getRecipeNames().toPromise();
                    if (names.indexOf(data.name) < 0) {
                        const recipe = await this.api.getRecipe(recipeName).toPromise();
                        recipe.name = data.name;
                        await this.api.updateRecipe(recipe);
                        this.refreshRecipeNames$.next(undefined);
                        this.selectedRecipeName$.next(data.name);
                    }
                }
            });
        }
    }
}
