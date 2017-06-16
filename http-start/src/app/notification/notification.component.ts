import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

import { DataService } from '../shared/data.service';
import * as $ from 'jquery';
import { Subscription } from 'rxjs/Subscription';


declare var Notification: any;

@Component({
    selector: 'app-notification',
    templateUrl: './notification.component.html',
    styleUrls: ['./notification.component.css'],

})
export class NotificationComponent implements OnInit {
    @ViewChild('notification') notif: ElementRef;
    notificationCLicked = true;
    subscription: Subscription;
    currentNotification = {};

    constructor(private dataService: DataService) {

    }

    ngOnInit() {
        var self = this;
        this.subscription = this.dataService.newTodoAdded.subscribe(
            (todos) => {
                self.createTodoNotification(todos);
            },
            (error) => {

                console.log(error);
            }
        )

        this.subscription = this.dataService.newCommentAdded.subscribe(
            (todos) => {
                self.createCommentNotification(todos);
            },
            (error) => {

                console.log(error);
            }
        )

    }
    myShowFunction() {
        //window.alert("i showed alert");
    }

    mycloseFunction() {
        //window.alert("i closed alert");
        debugger
    }



    myClickFunction(event) {
        this.notificationCLicked = false;
        console.log("bla");
        //sets the focus on our application
        window.focus();
        //scroll to our time entering section

        //load jquery for this
        $('html, body').animate({
            'scrollTop': $(".enter-time").position().top
        });


    }

    createTodoNotification(todos) {
        var titleName = todos.name,
            user = todos.assignedTo,
            title = "Hi " + user + ", looks like you just added a new to-do item: " + titleName + ".",
            options = {
                body: "Do you need to add any time?",
                icon: "http://icons.veryicon.com/256/Internet%20%26%20Web/Socialmedia/Basecamp.png"
            };
        this.createNotification(title, options);
    }

    createCommentNotification(todos) {
        var titleName = todos.name,
            user = todos.assignedTo,
            title = "Hi " + user + ", looks like you just added a comment to: " + titleName + ".",
            options = {
                body: "Do you need to add any time?",
                icon: "http://icons.veryicon.com/256/Internet%20%26%20Web/Socialmedia/Basecamp.png"
            };
        this.createNotification(title, options);


    }

    createNotification(title, options) {
        if (!("Notification" in window)) {
            alert("This browser does not support desktop notification");
        }

        // Let's check whether notification permissions have already been granted
        else if (Notification.permission === "granted") {
            // If it's okay let's create a notification
            var notification = new Notification(title, options);
        }

        // Otherwise, we need to ask the user for permission
        else if (Notification.permission !== "denied") {
            Notification.requestPermission(function(permission) {
                // If the user accepts, let's create a notification
                if (permission === "granted") {
                    var notification = new Notification("Hi there!");
                }
            });
        }
    }



}