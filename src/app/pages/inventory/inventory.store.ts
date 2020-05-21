
export class InventoryStore {
    public units: any = [
        { id: "001", name: "KG" },
        { id: "002", name: "Pcs" },
        { id: "003", name: "gm" },
        { id: "001", name: "liter" },
        { id: "001", name: "KG" }
    ]

    public item_types: any = [
        { id: "001", name: "FG" },
        { id: "002", name: "RW" },
        { id: "003", name: "PSG" }
    ]

    public purcahse_modes: any = [
        { id: "001", name: "Cash" },
        { id: "002", name: "Credit" }
    ]


    public store_types: any = [
        { id: "001", name: "Main", val: "main" },
        { id: "002", name: "Substore", val: "sub" },
        { id: "003", name: "Distributor Store", val: "dealer" },
        { id: "004", name: "Agent Store", val: "agent" },
        { id: "004", name: "Subagent Store", val: "subagent" },
    ]
}