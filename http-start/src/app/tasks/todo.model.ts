export class Todo {
    public name: string;
    public createdBy: string;
    public assignedTo: string;
    public dueDate: string

    constructor(name: string, createdBy: string, assignedTo: string, dueDate: string) {
        this.name = name;
        this.createdBy = createdBy;
        this.assignedTo = assignedTo;
        this.dueDate = dueDate;
    }
}

// export class Todo {

//     public todoName: string;
//     public todoId: string;
//     public todoItems: any[];

//     constructor(todoName: string, todoId: string, todoItems: any[]) {
//         this.todoName = todoName;
//         this.todoId = todoId;
//         this.todoItems = todoItems;
//     }
// }