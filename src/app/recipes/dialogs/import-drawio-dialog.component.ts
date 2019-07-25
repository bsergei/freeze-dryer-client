import { Component, Inject, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { WorkflowItem, WfCondition, WfAction, WfStart, WfEnd } from '@fd-model';
import { NgxFileDropEntry, FileSystemFileEntry } from 'ngx-file-drop';

import { DrawIoDecoder } from '../model/draw-io-decoder';
import { MxGraphHelper } from '../model/mx-graph-helper';
import { FdWorkflowReader } from '../model/fd-workflow-reader';

export interface ImportDrawioDialogData {
  items: WorkflowItem[];
}

@Component({
  selector: 'display-recipe-code-dialog',
  template: `<h2 mat-dialog-title>Import from Draw.IO diagram</h2>
<mat-dialog-content>
    <div style="height:130px;" [hidden]="isImported">
      <ngx-file-drop
          dropZoneLabel="Drop file here"
          (onFileDrop)="dropped($event)"
          (onFileOver)="fileOver($event)"
          (onFileLeave)="fileLeave($event)">
          <ng-template ngx-file-drop-content-tmp let-openFileSelector="openFileSelector">
              Drop file here or
              <button type="button" (click)="openFileSelector()" style="margin-left: 10px;">browse...</button>
          </ng-template>
      </ngx-file-drop>
    </div>
    <mat-accordion [hidden]="!isImported" style="padding: 0 10px;">
      <mat-expansion-panel [expanded]="true">
        <mat-expansion-panel-header>
          <mat-panel-title>
            Preview
          </mat-panel-title>
        </mat-expansion-panel-header>
        <div #graphContainer id="graphContainer" style="height: 300px; overflow: auto;"></div>
      </mat-expansion-panel>
      <mat-expansion-panel>
        <mat-expansion-panel-header>
          <mat-panel-title>
            Source Code
          </mat-panel-title>
        </mat-expansion-panel-header>
        <textarea style="height: 300px; resize: none; white-space: pre; overflow: auto; width: 100%;" readonly>{{ importedText }}</textarea>
      </mat-expansion-panel>
    </mat-accordion>
</mat-dialog-content>
<mat-dialog-actions align="end">
  <button mat-button mat-dialog-close>Cancel</button>
  <button mat-button [mat-dialog-close]="true">OK</button>
</mat-dialog-actions>`
})
export class ImportDrawioDialog {

  @ViewChild('graphContainer', { static: true }) graphContainer: ElementRef;

  public isImported = false;

  public importedText = 'JSON';

  constructor(
    public dialogRef: MatDialogRef<ImportDrawioDialog>,
    @Inject(MAT_DIALOG_DATA) public data: ImportDrawioDialogData,
    private changeDetectorRef: ChangeDetectorRef) {
  }

  public dropped(files: NgxFileDropEntry[]) {
    if (files && files.length === 1) {
      const droppedFile = files[0];
      if (droppedFile.fileEntry.isFile) {
        const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
        fileEntry.file((file: File) => {
          const reader = new FileReader();
          reader.readAsText(file, "UTF-8");
          reader.onload = (evt) => {
            const fileContents = (evt.target as FileReader).result as string;
            this.import(fileContents);
            this.changeDetectorRef.detectChanges();
          }
        });
      }
    }
  }

  public fileOver(_event) {
  }

  public fileLeave(_event) {
  }

  private import(fileContents: string) {
    const decoder = new DrawIoDecoder();
    const mxGraphHelper = new MxGraphHelper();

    const mxGraphXml = decoder.decodeToMxGraphAsXml(fileContents);

    const pureMxGraphXml = mxGraphHelper.toPureMxGraphXml(mxGraphXml);
    const svg = mxGraphHelper.toSvg(pureMxGraphXml);
    const containerElement = (this.graphContainer.nativeElement as HTMLElement);
    while (containerElement.firstChild) {
      containerElement.removeChild(containerElement.firstChild);
    }
    containerElement.appendChild(svg);

    const simpleMxGraph = mxGraphHelper.convert(mxGraphXml);
    console.log(simpleMxGraph);

    const fdWfReader = new FdWorkflowReader();
    const wf = fdWfReader.convert(simpleMxGraph);
    this.humanizeIds(wf);

    this.data.items = wf;
    this.isImported = true;
    this.importedText = JSON.stringify(wf, null, 2);
  }

  private humanizeIds(wf: WorkflowItem[]) {
    const map = {};
    let actionId = 1;
    let conditionId = 1;
    for (const item of wf) {
      if (!map[item.id]) {
        let newId;
        if (item.comment) {
          newId = item.comment.toLowerCase().replace(' ', '_');
        } else {
          switch (item.type) {
            case 'start':
            case 'end':
              newId = item.type;
              break;
            case 'action':
              newId = `action${actionId}`;
              actionId = actionId + 1;
              break;
            case 'condition':
              newId = `condition${conditionId}`;
              conditionId = conditionId + 1;
              break;
          }
        }

        map[item.id] = newId;
      }
    }

    for (const item of wf) {
      item.id = map[item.id];
      switch (item.type) {
        case 'condition':
          const conditionItem = item as WfCondition;
          conditionItem.next_id_true = map[conditionItem.next_id_true];
          conditionItem.next_id_false = map[conditionItem.next_id_false];
          break;

        case 'action':
          const actionItem = item as WfAction;
          actionItem.next_id = map[actionItem.next_id];
          break;

        case 'start':
          const startItem = item as WfStart;
          startItem.next_id = map[startItem.next_id];
          break;
      }
    }
  }
}
