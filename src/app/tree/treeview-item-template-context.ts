import { TreeviewItem } from './treeview-item';

export interface TreeviewItemTemplateContext {
    item: any;
    toggleCollapseExpand: () => {};
    onCheckedChange: () => {};
}
