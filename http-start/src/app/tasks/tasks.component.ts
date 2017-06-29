import { Component, OnInit, ViewChild } from '@angular/core';
import { Todo } from './todo.model';
import { DataService } from '../shared/data.service';
import { Subscription } from 'rxjs/Subscription';
import { Response } from '@angular/http';
import { ActivatedRoute, Params } from '@angular/router';
import { AuthServerService } from '../shared/auth-server.service';
import { NgForm } from '@angular/forms';
import { Observable } from 'rxjs/Observable';

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
    seenNotification: any[] = [];
    @ViewChild('f') signupForm: NgForm;
    descriptionSource: any[] = [];
    allTodoIds: any[] = [];

    // subscribe to the accessToken being sent through the url on first login
    // Get the list of tasks - All todos, Recent Todos
    // Send the data to the shared service
    constructor(private serverService: AuthServerService, private route: ActivatedRoute, private dataService: DataService) {
        var self = this;
        this.currentItem.name = "";
        this.route
            .queryParams
            .subscribe(params => {
                self.dataService.code = params['accessToken'] || self.getAccessTokenToLocalStorage();
                console.log("code: " + self.dataService.code);
                if (self.dataService.code) {
                    self.setAccessTokenToLocalStorage(self.dataService.code);
                }
            });
        self.onGetTasks();
        self.getTimeEntriesDecription();
        self.todos = self.dataService.getTodos();
        self.finalTodoList = self.dataService.getRecentTodos();

        //Keep reading the new todos 
        window.setInterval(function() {
            this.onGetTasks();

        }.bind(this), 10000);

        //Keep reading the time entries for all todos
        window.setInterval(function() {
            this.getTimeEntriesDecription();
        }.bind(this), 600000);
    }


    ngOnInit() {
        //get the list of all todos
        this.subscription = this.dataService.todosUpdated.subscribe(
            (todos: Todo[]) => {
                this.todos = todos;
            }
        )

        //get the list of recent todos
        this.subscription = this.dataService.recentTodosUpdated.subscribe(
            (todos: Todo[]) => {
                this.finalTodoList = todos;
            }
        )

        //get the event when Enter time form is to be displayed
        this.subscription = this.dataService.notificationClicked.subscribe(
                (todos) => {
                    this.onEnterTime(todos);
                }
            )
            //get a list of all the todos assigned to the user
        this.todos = this.dataService.getTodos();
        //get a list of the recently active todos assigned to the user
        this.finalTodoList = this.dataService.getRecentTodos();
    }

    getTimeEntriesDecription() {
        var index, self = this;
        console.log("get time entries description");
        let itemIdArray = this.getAllTodoIdsToLocalStorage(),
            timeEntryRequestArray = [];
        if (itemIdArray.length) {
            for (index = 0; index < itemIdArray.length; index++) {
                timeEntryRequestArray.push(this.serverService.getTimeEntriesForSingleTodoItem(itemIdArray[index]));
            }
            Observable.forkJoin(timeEntryRequestArray).subscribe(
                (results) => {
                    self.populateDescriptionSourceOfTimeEntry(results);
                }
            );
        }
    }

    populateDescriptionSourceOfTimeEntry(results) {
        this.descriptionSource = [];
        var timeEntry, timeEntryArray;
        for (var index = 0; index < results.length; index++) {
            if (JSON.parse(results[index]['_body'])['time-entries']['time-entry']) {
                timeEntry = JSON.parse(results[index]['_body'])['time-entries']['time-entry'];
                if (timeEntry.hasOwnProperty('0')) {
                    timeEntryArray = Object.keys(timeEntry).map(function(e) {
                        return [timeEntry[e]];
                    });
                    for (var itemIndex = 0; itemIndex < timeEntryArray.length; itemIndex++) {
                        this.descriptionSource.push(timeEntryArray[itemIndex][0]['description']);
                    }
                } else {
                    this.descriptionSource.push(timeEntry['description']);
                }
            }
        }
        this.remmoveDuplicateTimeDescription();
        this.setDescriptionSourceToLocalStorage();
    }

    //removes the multiple entries of the same description
    remmoveDuplicateTimeDescription() {
        this.descriptionSource = Array.from(new Set(this.descriptionSource));
    }

    setDescriptionSourceToLocalStorage() {
        window.localStorage.setItem("descriptionSource", JSON.stringify(this.descriptionSource));
    }

    getDescriptionSourceFromLocalStorage() {
        return JSON.parse(window.localStorage.getItem("descriptionSource"));
    }
    //Click event for enter time button
    onEnterTime(item) {
        $('.modal-content').toggleClass('popup-show');
        $('.close').toggleClass('close-show');

        //hide the above task added successfully button
        this.hideSuccessMessage();

        //set the item corresponding to which, the time entry is to be made
        this.currentItem = item;
    }

    //Event when Enter time form is closed
    onCloseClick() {
        $('.modal-content').removeClass('popup-show');
        $('.close').toggleClass('close-show');

        //set the current item - To be displayed in the form empty
        this.currentItem = {
            "name": ""
        };
    }

    //Hide success message initiallly while entering the time log
    hideSuccessMessage() {
        $("#normalform").css("display", "block");
        $(".block-msg.sucess").css("display", "none");
    }

    // show success messsage after the time entry has been posted corresponding to the todo item
    showSuccessMessage() {
        $(".block-msg.sucess").css("display", "block");
        $("#normalform").css("display", "none");
    }

    //On cancel button click
    onCancelClick() {
        this.onCloseClick();
    }

    // Submit the enter time form entry
    onSubmit(f) {
        var data = {
            "time-entry": {
                "person-id": JSON.parse(localStorage.getItem('userDetails'))['person_id'],
                "date": $("#datepicker").val(),
                "hours": f.value['task-time'],
                "description": f.value['task-description']
            }
        };
        var self = this;

        //Post the time entry to server
        this.serverService.postTimeEntries(this.currentItem, data).subscribe(
            function(response: Response) {
                console.log(response);
                self.getTimeLogs();
                self.showSuccessMessage();

            },
            (error) => console.log(error)
        );
    }


    //set the accessToken received inside the local storage
    setAccessTokenToLocalStorage(token) {
        localStorage.setItem("accessToken", token);
    }

    //return the stored local storage  - accessToken
    getAccessTokenToLocalStorage() {
        return localStorage.getItem("accessToken");
    }

    //makes the request to get the all the todos
    onGetTasks() {
        var self = this;
        this.serverService.getTasks()
            .subscribe(
                function(response: Response) {
                    //display the received time logs in the template
                    self.displayTasks(response);

                    // get the time logs corresponding to the recent todo items
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
                recentTodoItems = [],
                todoItemsId;
            this.allTodoIds = [];

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
                        todoItemsId = [];
                        todoItemsObject = todoList[listIndex][0]['todo-items']['todo-item'];
                        if (todoItemsObject.hasOwnProperty('0')) {
                            todoItemArray = Object.keys(todoItemsObject).map(function(e) {
                                return [todoItemsObject[e]];
                            });
                            for (itemIndex = 0; itemIndex < todoItemArray.length; itemIndex++) {
                                listItem = {};
                                singleItem = todoItemArray[itemIndex][0];
                                this.generateTodoAndFinalTodoArray(singleItem, todoItems, recentTodoItems, todoItemsId);

                            }
                        } else {
                            singleItem = todoItemsObject;
                            this.generateTodoAndFinalTodoArray(singleItem, todoItems, recentTodoItems, todoItemsId);
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

            self.setAllTodoIdsToLocalStorage();
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

        this.updateSeenNotificationArray();
    }

    updateSeenNotificationArray() {
        var newTodoList = this.finalTodoList,
            seenIndex,
            index,
            seen = JSON.parse(window.localStorage.getItem("seenNotification")),
            inRecent;
        this.seenNotification = [];
        for (index = 0; index < newTodoList.length; index++) {
            inRecent = false;
            if (seen) {
                for (seenIndex = 0; seenIndex < seen.length; seenIndex++) {
                    if (seen[seenIndex] === newTodoList[index]['id']) {
                        inRecent = true;
                    }
                }
            }
            if (!inRecent) {
                this.seenNotification.push(newTodoList[index]['id']);
            }
        }
    }

    // get the new todos being added to the recent todos
    triggerEventsForNewlyActiveTodos(newTodoList, oldTodoList) {

        var diff = [],
            isInArray;
        if (oldTodoList.length) {
            for (var i = 0; i < newTodoList.length; i++) {
                isInArray = false;
                for (var j = 0; j < oldTodoList.length; j++) {
                    if (newTodoList[i]['id'] === oldTodoList[j]['id']) {
                        isInArray = true;
                    }
                }
                if (!isInArray) {
                    diff.push(newTodoList[i]);
                }
            }
        } else {
            diff = this.checkIfNotificationSeen(newTodoList);
        }

        diff = this.checkForMultipleComments(diff);

        for (i = 0; i < diff.length; i++) {

            this.seenNotification.push(diff[i]['id']);
            this.dataService.triggerEventForNotification(diff[i]);
            this.setNotificationSeenFlag(this.seenNotification);
        }
        return diff;
    }

    checkForMultipleComments(diff) {
        var commentReuqestArray = [],
            self = this;
        for (var index = 0; index < diff.length; index++) {
            if (parseInt(diff[index].commentCount) > 1) {
                commentReuqestArray.push(this.serverService.getComments(diff[index]));
            }
        }
        Observable.forkJoin(commentReuqestArray).subscribe(
            (results) => {
                self.populateComments(results);
            }
        );
        return diff;
    }

    populateComments(results){
        debugger
    }


    //set the seenNotification todos array in local storage
    setNotificationSeenFlag(seenNotification) {
        window.localStorage.setItem("seenNotification", JSON.stringify(seenNotification));
    }

    //check if the notification for this active has been shown or not. If not, send that todo to give a notification
    checkIfNotificationSeen(newTodoList) {
        var isSeen, showNotif = [],
            recentTodos = JSON.parse(window.localStorage.getItem('recentTodos')),
            inRecent,
            index, seenIndex, seen;
        if (window.localStorage.getItem("seenNotification")) {
            seen = JSON.parse(window.localStorage.getItem("seenNotification"));

            this.seenNotification = seen;
            for (index = 0; index < recentTodos.length; index++) {
                isSeen = false;

                for (seenIndex = 0; seenIndex < seen.length; seenIndex++) {
                    if (seen[seenIndex] === recentTodos[index]['id']) {
                        isSeen = true;
                    }
                }

                if (!isSeen) {
                    showNotif.push(recentTodos[index]);
                }
            }
        } else {
            showNotif = newTodoList;
        }

        return showNotif;
    }

    //the final array that contains the recently active todos with the latest activity performed (if it was a new todo or commented todo)
    generateTodoAndFinalTodoArray(singleItem, todoItems, recentTodoItems, todoItemsId) {
        if (singleItem) {
            var listItem = {
                "id": singleItem['id'],
                "name": singleItem['content'],
                "createdBy": singleItem['creator-name'],
                "assignedTo": singleItem['responsible-party-name'],
                "dueDate": singleItem['due-at'] || "",
                "commentCount": singleItem['comments-count'],
                "newTodo": null,
                "newComment": null
            };

            todoItems.push(listItem);

            //push the ids of all todos - will further be used to make api request for timeEntries of each of the todos
            this.allTodoIds.push(listItem.id);

            if (this.checkForRecentActivity(singleItem)) {
                listItem.newTodo = singleItem['newTodo'] || null;
                listItem.newComment = singleItem['newComment'] || null;
                recentTodoItems.push(listItem);
            }
        }
    }


    //set allTodos and recentTodos in local storage
    setAllTodosToLocalStorage() {
        window.localStorage.setItem("allTodos", JSON.stringify(this.todos));
        window.localStorage.setItem("recentTodos", JSON.stringify(this.finalTodoList));


    }

    setAllTodoIdsToLocalStorage() {
        window.localStorage.setItem("allTodoIds", JSON.stringify(this.allTodoIds));
    }

    getAllTodoIdsToLocalStorage() {
        return JSON.parse(window.localStorage.getItem("allTodoIds"));
    }

    //check if any recent activity has been performed on the todo-item
    checkForRecentActivity(singleItem) {
        var today = new Date().toDateString();
        //check if a comment has been made on the todo-item today
        if (new Date(singleItem['commented-at']).toDateString() === today) {
            singleItem.newComment = true;
            return true;
        }

        //check if the todo-item has been created today
        else if (new Date(singleItem['created-at']).toDateString() === today) {
            singleItem.newTodo = true;
            return true;
        }
    }

    //the view time logs click event to display the generated logs
    viewTimeLogs($event) {
        if ($event.target.nextElementSibling.style.display === "block") {
            $event.target.nextElementSibling.style.display = "none";
            return;
        } else {
            $event.target.nextElementSibling.style.display = "block";
        }
    }

    //get the time logs for a single todo-item
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

    //generate the array for time logs for all the todo-items
    displayTimeLogs(response) {
        if (response) {
            var index,
                responseData = response["_body"] ? JSON.parse(response["_body"]) : null,
                timeEntry, listItem, singleItem, timeLogs, finalTimeLogs = [],
                totalHours = 0;
            if (responseData && responseData['time-entries']) {
                timeEntry = responseData['time-entries']['time-entry'];
                if (timeEntry) {

                    //when there are multiple time log objects
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
                                totalHours += Number(singleItem['hours']);
                            }
                        }
                    }
                    //when there is a single time entry
                    else {
                        singleItem = timeEntry;

                        if (singleItem) {
                            listItem = {
                                "date": singleItem['date'],
                                "person": singleItem['person-name'],
                                "hours": singleItem['hours'],
                                "description": singleItem['description']
                            };
                            finalTimeLogs.push(listItem);
                            totalHours += Number(singleItem['hours']);
                        }
                    }

                    for (index = 0; index < this.finalTodoList.length; index++) {
                        if (this.finalTodoList[index].id === singleItem['todo-item-id']) {
                            this.finalTodoList[index].finalTimeLogs = finalTimeLogs;
                            this.finalTodoList[index].totalHours = totalHours;
                        }
                    }
                    totalHours = 0;
                }
            }
        }
    }



}