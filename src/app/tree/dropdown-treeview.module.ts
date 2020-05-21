﻿import { NgModule, ModuleWithProviders } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DropdownTreeviewComponent } from './dropdown-treeview.component';
import { TreeviewComponent } from './treeview.component';
import { TreeviewItemComponent } from './treeview-item.component';
import { TreeviewPipe } from './treeview.pipe';
import { TreeviewI18n, TreeviewI18nDefault } from './treeview-i18n';
import { TreeviewConfig } from './treeview-config';
import { TreeviewEventParser, DefaultTreeviewEventParser } from './treeview-event-parser';

@NgModule({
    imports: [
        FormsModule,
        CommonModule
    ],
    declarations: [
        TreeviewItemComponent,
        DropdownTreeviewComponent,
        TreeviewComponent,
        TreeviewPipe
    ], exports: [
        DropdownTreeviewComponent,
        TreeviewComponent,
        TreeviewPipe
    ]
})
export class DropdownTreeviewModule {
    static forRoot(): ModuleWithProviders {
        return {
            ngModule: DropdownTreeviewModule,
            providers: [
                TreeviewConfig,
                { provide: TreeviewI18n, useClass: TreeviewI18nDefault },
                { provide: TreeviewEventParser, useClass: DefaultTreeviewEventParser }
            ]
        };
    }
}
