import { Component, OnInit } from '@angular/core';
import { Todo } from './todo.model';
import { DataService } from '../shared/data.service';
import { Subscription } from 'rxjs/Subscription';
import { Response } from '@angular/http';
import { ActivatedRoute, Params } from '@angular/router';
import { AuthServerService } from '../shared/auth-server.service';

@Component({
    selector: 'app-tasks',
    templateUrl: './tasks.component.html',
    styleUrls: ['./tasks.component.css']
})
export class TasksComponent implements OnInit {
    todos: any[] = [];
    recentTodos: any[] = [];
    subscription: Subscription;
    finalTodoList: any[] = [];


    constructor(private serverService: AuthServerService, private route: ActivatedRoute, private dataService: DataService) {

        this.route
            .queryParams
            .subscribe(params => {
                this.dataService.code = params['accessToken'];
                console.log("code: " + this.dataService.code);

            });
        this.setAccessTokenToLocalStorage(this.dataService.code);
        this.todos = this.dataService.getTodos();
        this.onGetTasks();


    }

    ngOnInit() {
        this.subscription = this.dataService.todosUpdated.subscribe(
            (todos: Todo[]) => {
                this.todos = todos;
            }
        )
        this.todos = this.dataService.getTodos();
    }

    setAccessTokenToLocalStorage(token) {
        localStorage.setItem("accessToken", token);
    }

    onGetTasks() {
        var self = this;
        this.serverService.getTasks()
            .subscribe(
                function(response: Response) {
                    self.displayTasks(response);
                    self.onGetRecentData();
                },
                (error) => console.log(error)
            );
    }

    displayTasks(response) {
        if (response) {
            var listIndex, itemIndex,
                self = this,
                responseData = response["_body"] ? JSON.parse(response["_body"]) : null,
                todoItems,
                listItem,
                singleItem,
                name = [],
                createdBy = [],
                assignedTo = [],
                dueDate = [],
                todoItemsObject = {},
                todoItemArray = [];

            //get the list of todos
            if (responseData && responseData["todo-lists"]["todo-list"]) {
                var todoItemsObject = {},
                    todoItemArray = [],
                    object = responseData["todo-lists"]["todo-list"],
                    todoList = Object.keys(object).map(function(e) {
                        return [object[e]];
                    });

                for (listIndex = 0; listIndex < todoList.length; listIndex++) {

                    //get the list of todo items inside todos
                    if (todoList[0][0]['todo-items']['todo-item']) {
                        todoItems = [];
                        todoItemsObject = todoList[listIndex][0]['todo-items']['todo-item'];
                        if (todoItemsObject.hasOwnProperty('0')) {
                            todoItemArray = Object.keys(todoItemsObject).map(function(e) {
                                return [todoItemsObject[e]];
                            });
                            for (itemIndex = 0; itemIndex < todoItemArray.length; itemIndex++) {
                                listItem = {};
                                singleItem = todoItemArray[itemIndex][0];

                                if (singleItem) {
                                    listItem = {
                                        "id": singleItem['id'],
                                        "name": singleItem['content'],
                                        "createdBy": singleItem['creator-name'],
                                        "assignedTo": singleItem['responsible-party-name'],
                                        "dueDate": singleItem['due-at'] || ""
                                    };
                                    todoItems.push(listItem);

                                }

                            }
                        } else {
                            singleItem = todoItemsObject;
                            listItem = {
                                "name": singleItem['content'],
                                "createdBy": singleItem['creator-name'],
                                "assignedTo": singleItem['responsible-party-name'],
                                "dueDate": singleItem['due-at'] || ""
                            };
                            todoItems.push(listItem);
                        }

                    }
                    self.todos.push({
                        todoName: todoList[listIndex][0]['name'],
                        todoId: todoList[listIndex][0]['id'],
                        todoItems: todoItems
                    });
                }
            } else {
                self.dataService.todos.push({
                    name: "No tasks assigned"
                });
            }
            self.dataService.addTodos(self.todos);
            this.setAllTodosToLocalStorage();

        }
    }
    setAllTodosToLocalStorage() {
        window.localStorage.setItem("allTodos", JSON.stringify(this.todos));
    }

    onGetRecentData() {
        var self = this;
        this.serverService.getRecentActivities()
            .subscribe(
                function(response: Response) {
                    console.log(response);
                    self.displayRecentData(response);
                    self.generateTheFinalTodoDisplayList();
                },
                (error) => console.log(error)
            )
    }

    getFnameFromLocalStorage() {
        return window.localStorage.getItem("user-fname");
    }

    displayRecentData(response) {
        var self = this,
            itemObject = JSON.parse(response["_body"]).rss.channel.item,
            itemObjectLength = Object.keys(itemObject).length,
            index, title, singleItem = {};

        for (index = 0; index < itemObjectLength; index++) {
            if (itemObject[index]) {
                var creator = itemObject[index]["dc:creator"],
                    fname = itemObject[index]["dc:creator"].substring(0, itemObject[index]["dc:creator"].indexOf(" "));
                singleItem = {};
                //check to list data for the logged in user
                if (this.getFnameFromLocalStorage() === fname) {
                    if (itemObject[index].title) {
                        title = itemObject[index].title;
                        if (title.charAt(0) === "T" && title.indexOf("Todo") === 0) {
                            if (itemObject[index].title.indexOf("(")) {
                                singleItem = {
                                    "todoItemName": itemObject[index].title.substring(itemObject[index].title.indexOf(":") + 2, itemObject[index].title.indexOf("(") - 1)
                                }
                                self.recentTodos.push(singleItem);
                            }



                        } else if (title.charAt(0) === "C" && title.indexOf("Comment") === 0) {
                            singleItem = {
                                "todoItemName": itemObject[index].title.substring(itemObject[index].title.lastIndexOf(":") + 2)
                            }
                            self.recentTodos.push(singleItem);
                        }
                    }
                }
            }
        }
        self.setRecentItemsToLocalStorage();

    }

    setRecentItemsToLocalStorage() {

        var updatedRecentTodos = this.removeDuplicateTodoItems();
        window.localStorage.setItem("recentTodos", JSON.stringify(updatedRecentTodos));
    }

    removeDuplicateTodoItems() {
        var recentTodoNames = [],
            index, i,
            len = 0,
            updatedRecentTodos = [],
            obj = {};

        for (index = 0; index < this.recentTodos.length; index++) {
            recentTodoNames.push(this.recentTodos[index]['todoItemName']);
        }
        len = recentTodoNames.length;

        for (i = 0; i < len; i++) {
            obj[recentTodoNames[i]] = 0;
        }
        for (i in obj) {
            updatedRecentTodos.push(i);
        }
        return updatedRecentTodos;

    }


    //comparing the all todos sections with recent todos section
    generateTheFinalTodoDisplayList() {
        var indexTodos, indexRecentTodos, indexTodoItems, recentTodos = JSON.parse(window.localStorage.getItem("recentTodos")),
            allTodos = JSON.parse(window.localStorage.getItem("allTodos")),
            finalTodoList = [];
        //loop through all todos assigned to the user
        for (indexTodos = 0; indexTodos < allTodos.length; indexTodos++) {
            //loop through all todoItems inside the todoList
            for (indexTodoItems = 0; indexTodoItems < allTodos[indexTodos].todoItems.length; indexTodoItems++) {
                //loop through all the recentTodos
                for (indexRecentTodos = 0; indexRecentTodos < recentTodos.length; indexRecentTodos++) {
                    //comparing todoName for recentTodos and single todoItem name
                    if (recentTodos[indexRecentTodos] === allTodos[indexTodos].todoItems[indexTodoItems]['name']) {
                        finalTodoList.push(allTodos[indexTodos].todoItems[indexTodoItems]);
                        console.log(finalTodoList);
                        this.finalTodoList = finalTodoList
                    }
                }
            }
        }
    }



}