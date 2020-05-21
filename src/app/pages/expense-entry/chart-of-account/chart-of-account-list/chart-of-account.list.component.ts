import { Component} from "@angular/core";
import { TreeNode, TREE_ACTIONS, KEYS, IActionMapping } from 'angular-tree-component';
import { ChartOfAccountService } from '../chart-of-account.service';

const actionMapping: IActionMapping = {
  mouse: {
      click: TREE_ACTIONS.FOCUS
  },
  keys: {
      [KEYS.ENTER]: (tree, node, $event) => alert(`This is ${node.data.name}`)
  }
}

@Component({
  selector: 'chart-of-account-list',
  templateUrl:'./chart-of-account.list.html',
  styleUrls:['./chart-of-account.list.scss']
})


export class ChartOfAccountListComponent {
  public nodes: any = [];
  public alerts: any = [];
  public selectedParent: any = {};
  public selectedPermission: {};
  public optionsModel: any[]
  public isShowDetail: boolean;
  public detail: any = {};
  public permissions: any = [];
  public data: any = {};

  constructor(
    private _chartOfAccountService: ChartOfAccountService
  ) {}

  ngOnInit(){
    this.isShowDetail = false;
    this._chartOfAccountService.getRoot().subscribe(result => {
        this.nodes = result;
    })
  }

  options = {
    actionMapping,
    getChildren: (node: TreeNode) => {
        return this.childTree(node.data._id).then(res => {
            return res;
        });
    }
};

  childTree(id: any) {
      return new Promise((resolve, reject) => {
          this._chartOfAccountService.getChild(id).subscribe((res) => {
              resolve(res);
          });
      })
  }

  onEvent(ev: any) {
    this.isShowDetail = true;
    let id = ev.node.data._id;
    this._chartOfAccountService.get(id).subscribe(result => {
        this.data = result;
        this.detail = result;
    })
  }

}
