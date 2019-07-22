import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Recipe } from '@fd-model';

export interface DisplayRecipeCodeDialogData {
  recipe: Recipe;
}

@Component({
  selector: 'display-recipe-code-dialog',
  template: `<h2 mat-dialog-title>Recipe Code</h2>
<mat-dialog-content>
  <div style="height:400px; display: flex; flex-direction: column;">
    <textarea style="flex: 1; resize: none; white-space: pre; overflow: auto;" readonly>{{ text }}</textarea>
  </div>
</mat-dialog-content>
<mat-dialog-actions align="end">
  <button mat-button [mat-dialog-close]="true">OK</button>
</mat-dialog-actions>`
})
export class DisplayRecipeCodeDialog {

    public text: string;

    constructor(public dialogRef: MatDialogRef<DisplayRecipeCodeDialog>,
        @Inject(MAT_DIALOG_DATA) public data: DisplayRecipeCodeDialogData) {
        this.text = JSON.stringify(data.recipe, null, 2);
    }
}
