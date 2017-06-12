import { Component, OnInit } from '@angular/core';
import { Response } from '@angular/http';
import { ActivatedRoute, Params } from '@angular/router';
import { AuthServerService } from '../shared/auth-server.service';
import { DataService } from '../shared/data.service';


@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
    todos = [];
    recentActivities = [];
    recentTodos = [];
    recentComments = [];


    constructor(private serverService: AuthServerService, private route: ActivatedRoute, private dataService: DataService) {
        
    }

    ngOnInit() {


    }

    onGetUser() {
        var self = this;
        this.serverService.getUser()
            .subscribe(
                function(response) {
                    self.displayUser(response);

                },
                (error) => console.log(error)
            );

    }

    displayUser(response) {

        var self = this,
            parseString = require('xml2js').parseString,
            xml = response["_body"];

        parseString(xml, function(err, responseData) {
            //self.dataService.nameOfUser = responseData['person']['first-name'][0] + " " + responseData['person']['last-name'][0]
            self.dataService.addUserName(responseData['person']['first-name'][0] + " " + responseData['person']['last-name'][0]);
        });
    }

    onGetRecentData() {
        var self = this;
        this.serverService.getRecentActivities()
            .subscribe(
                function(response: Response) {
                    console.log(response);
                    self.displayRecentData(response);
                },
                (error) => console.log(error)
            )
    }

    displayRecentData(response) {
        var itemObject = JSON.parse(response["_body"]).rss.channel.item,
            itemObjectLength = Object.keys(itemObject).length,
            index, title, singleItem;

        for (index = 0; index < itemObjectLength; index++) {
            debugger
            if (itemObject[index].title) {
                title = itemObject[index].title;
                if (title.charAt(0) === "T" && title.indexOf("Todo") === 0) {
                   debugger; this.recentTodos

                } else if (title.charAt(0) === "C" && title.indexOf("Comment") === 0) {

                }
            }
        }


    }

    onGetTasks() {
        var self = this;
        this.serverService.getTasks()
            .subscribe(
                function(response: Response) {
                    self.displayTasks(response);
                },
                (error) => console.log(error)
            );
    }

    convertObjectToArray(object) {
        Object.keys(object).map(function(e) {
            return [object[e]];
        });
    }

    displayTasks(response) {
        var listIndex, itemIndex,
            self = this,
            responseData = JSON.parse(response["_body"]),
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
        if (responseData["todo-lists"]["todo-list"]) {
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



    }

}