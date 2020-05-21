export class UserManagementStore {
    public icons: any = [
        { id: "001", name: "ion-grid" },
        { id: "002", name: "ion-pricetags" },
        { id: "003", name: "ion-person-stalker" },
        { id: "004", name: "ion-person-stalker" },
        { id: "005", name: "ion-ios-settings-strong" },
        { id: "006", name: "ion-android-laptop" },
        { id: "007", name: "ion-document-text" },
        { id: "007", name: "ion-android-home"}
    ]

    public permissions: any = [
        { id: 1, name: "View", value: "view" },
        { id: 2, name: "Add", value: "add" },
        { id: 3, name: "Edit", value: "edit" },
        { id: 4, name: "Delete", value: "delete" },
        { id: 5, name: "Changepass", value: "changepass" },
        { id: 6, name: "Print", value: "print" },
        { id: 7, name: "Print pdf", value: "print-pdf" },
        { id: 8, name: "Pending", value: "pending" },
        { id: 9, name: "Publish", value: "publish" },
        { id: 10, name: "Unpublish", value: "unpublish" },
        { id: 11, name: "Approve", value: "approve" },
        { id: 12, name: "Redirect Publish", value: "redirect-publish" },
        { id: 13, name: "Redirect Unpublish", value: "redirect-unpublish" },
        { id: 14, name: "Redirect Pending", value: "pedirect-pending" },
        { id: 15, name: "Redirect Approve", value: "redirect-approve" }
    ]

    get allPermissionValue() {
        var values = this.permissions.map(obj => {
            return obj.value;
        })

        return values;
    }

    public myTexts = {
        checkAll: 'Check all',
        uncheckAll: 'Uncheck all'
    };
}