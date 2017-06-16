import { Component, OnInit, ViewChild } from '@angular/core';
import { Todo } from './todo.model';
import { DataService } from '../shared/data.service';
import { Subscription } from 'rxjs/Subscription';
import { Response } from '@angular/http';
import { ActivatedRoute, Params } from '@angular/router';
import { AuthServerService } from '../shared/auth-server.service';
import { NgForm } from '@angular/forms';

declare const $: JQueryStatic;


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
    finalTimeLogs: any[] = [];
    currentItem = {
        "name": ""
    };
    currentDate: string;
    @ViewChild('f') signupForm: NgForm;

    constructor(private serverService: AuthServerService, private route: ActivatedRoute, private dataService: DataService) {
        var self = this;
        this.currentItem.name = "";
        this.route
            .queryParams
            .subscribe(params => {
                this.dataService.code = params['accessToken'];
                console.log("code: " + this.dataService.code);

            });
        this.setAccessTokenToLocalStorage(this.dataService.code);
        this.todos = this.dataService.getTodos();
        this.finalTodoList = this.dataService.getRecentTodos();
        this.onGetTasks();
        this.generateCurrentDateForForm();
        window.setInterval(function() {

            this.onGetTasks();
        }.bind(this), 6000);
    }

    ngOnInit() {
        this.subscription = this.dataService.todosUpdated.subscribe(
            (todos: Todo[]) => {
                this.todos = todos;
            }
        )

        this.subscription = this.dataService.recentTodosUpdated.subscribe(
            (todos: Todo[]) => {
                this.finalTodoList = todos;
            }
        )

        this.todos = this.dataService.getTodos();
        this.finalTodoList = this.dataService.getRecentTodos();
    }

    generateCurrentDateForForm() {
        var date = new Date();
        this.currentDate = date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear()
    }

    onEnterTime($event, item) {
        $('.modal-content').toggleClass('popup-show');
        $('.close').toggleClass('close-show');
        this.hideSuccessMessage();
        this.currentItem = item;
    }

    onCloseClick() {
        $('.modal-content').removeClass('popup-show');
        $('.close').toggleClass('close-show');
        this.currentItem = {
            "name": ""
        };
    }

    hideSuccessMessage() {
        $("#normalform").css("display", "block");
        $(".block-msg.sucess").css("display", "none");
    }

    showSuccessMessage() {
        $(".block-msg.sucess").css("display", "block");
        $("#normalform").css("display", "none");
    }

    onCancelClick() {
        this.onCloseClick();
    }

    onSubmit(f) {
        var data = {
            "time-entry": {
                "person-id": JSON.parse(localStorage.getItem('userDetails'))['person_id'],
                "date": f.value['task-date'],
                "hours": f.value['task-time'],
                "description": f.value['task-description']
            }
        };
        var self = this;

        this.serverService.postTimeEntries(this.currentItem, data).subscribe(
            function(response: Response) {
                console.log(response);
                self.getTimeLogs();
                self.showSuccessMessage();

            },
            (error) => console.log(error)
        );
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
                    self.getTimeLogs();
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
                todoItemArray = [],
                recentTodoItems = [];

            //get the list of todos
            if (responseData && responseData["todo-lists"] && responseData["todo-lists"]["todo-list"]) {
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
                                this.generateTodoAndFinalTodoArray(singleItem, todoItems, recentTodoItems);



                            }
                        } else {
                            singleItem = todoItemsObject;
                            this.generateTodoAndFinalTodoArray(singleItem, todoItems, recentTodoItems);
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
            //update the final list only if the newly fetched data has more todos then the currrently stored
            if (recentTodoItems.length != self.finalTodoList.length) {
                if (recentTodoItems.length > self.finalTodoList.length) {
                    var newTodos = this.triggerEventsForNewlyActiveTodos(recentTodoItems, self.finalTodoList);
                }
                self.finalTodoList = recentTodoItems;
                self.dataService.addTodos(self.todos);
                self.dataService.addRecentTodos(self.finalTodoList);
                self.setAllTodosToLocalStorage();
            }


        }
    }

    triggerEventsForNewlyActiveTodos(newTodoList, oldTodoList) {
        var diff = [],
            isInArray;
        for (var i = 0; i < newTodoList.length; i++) {
            isInArray = false
            for (var j = 0; j < oldTodoList.length; j++) {
                if (JSON.stringify(newTodoList[i]) === JSON.stringify(oldTodoList[j])) {
                    isInArray = true;
                }

            }
            if (!isInArray) {
                diff.push(newTodoList[i]);
            }
        }
        for (i = 0; i < diff.length; i++) {
            this.dataService.triggerEventForNotification(diff[i]);
        }
        return diff;
    }

    generateTodoAndFinalTodoArray(singleItem, todoItems, recentTodoItems) {

        if (singleItem) {
            var listItem = {
                "id": singleItem['id'],
                "name": singleItem['content'],
                "createdBy": singleItem['creator-name'],
                "assignedTo": singleItem['responsible-party-name'],
                "dueDate": singleItem['due-at'] || "",
                "newTodo": null,
                "newComment": null,


            };
            todoItems.push(listItem);

            if (this.checkForRecentComments(singleItem)) {
                listItem.newTodo = singleItem['newTodo'] || null;
                listItem.newComment = singleItem['newComment'] || null;
                recentTodoItems.push(listItem);
                // if (singleItem.newTodo) {
                //     console.log("trigger event for new todo being added");
                // } else if (singleItem.newcomment) {
                //     console.log("trigger event for new comment being added");
                // }

            }
        }
    }

    setAllTodosToLocalStorage() {
        window.localStorage.setItem("allTodos", JSON.stringify(this.todos));
        window.localStorage.setItem("recentTodos", JSON.stringify(this.finalTodoList));
    }

    checkForRecentComments(singleItem) {
        var today = new Date().toDateString();
        if (new Date(singleItem['commented-at']).toDateString() === today) {
            singleItem.newComment = true;
            return true;
        } else if (new Date(singleItem['created-at']).toDateString() === today) {
            singleItem.newTodo = true;
            return true;
        }
    }

    getFnameFromLocalStorage() {
        if (window.localStorage.getItem('userDetails')) {
            return JSON.parse(window.localStorage.getItem('userDetails'))['user-fname'];
        }
    }

    viewTimeLogs($event) {
        if ($event.target.nextElementSibling.style.display === "block") {
            $event.target.nextElementSibling.style.display = "none";
            return;
        } else {
            $event.target.nextElementSibling.style.display = "block";
        }
    }

    getTimeLogs() {
        var index, self = this;
        for (index = 0; index < this.finalTodoList.length; index++) {
            this.serverService.getTimeEntriesForSingleTodoItem(this.finalTodoList[index].id).subscribe(
                function(response: Response) {
                    self.displayTimeLogs(response);

                },
                (error) => console.log(error)
            );
        }

    }

    displayTimeLogs(response) {
        if (response) {
            var index,
                responseData = response["_body"] ? JSON.parse(response["_body"]) : null,
                timeEntry, listItem, singleItem, timeLogs, finalTimeLogs = [];

            if (responseData && responseData['time-entries']) {
                timeEntry = responseData['time-entries']['time-entry'];
                if (timeEntry) {
                    if (timeEntry.hasOwnProperty('0')) {
                        timeLogs = Object.keys(timeEntry).map(function(e) {
                            return [timeEntry[e]];
                        });
                        for (index = 0; index < timeLogs.length; index++) {
                            listItem = {};
                            singleItem = timeLogs[index][0];

                            if (singleItem) {
                                listItem = {
                                    "date": singleItem['date'],
                                    "person": singleItem['person-name'],
                                    "hours": singleItem['hours'],
                                    "description": singleItem['description']
                                };
                                finalTimeLogs.push(listItem);
                            }
                        }
                    } else {
                        singleItem = timeEntry;

                        if (singleItem) {
                            listItem = {
                                "date": singleItem['date'],
                                "person": singleItem['person-name'],
                                "hours": singleItem['hours'],
                                "description": singleItem['description']
                            };
                            finalTimeLogs.push(listItem);
                        }
                    }

                    for (index = 0; index < this.finalTodoList.length; index++) {
                        if (this.finalTodoList[index].id === singleItem['todo-item-id']) {
                            this.finalTodoList[index].finalTimeLogs = finalTimeLogs;
                        }
                    }
                }


            }

        }
    }



}