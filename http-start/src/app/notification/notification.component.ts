import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

// import { PushNotificationComponent } from 'ng2-notifications/ng2-notifications';
import { DataService } from '../shared/data.service';
import * as $ from 'jquery';
import { Subscription } from 'rxjs/Subscription';

// import { NotifyComponent } from "angular2-simple-notify/notifyComponent";
// import { NotifyService } from "angular2-simple-notify/notifyService";
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
        this.createCommentNotification(todos);
    }

    createCommentNotification(todos) {

        if (!("Notification" in window)) {
            alert("This browser does not support desktop notification");
        }

        // Let's check whether notification permissions have already been granted
        else if (Notification.permission === "granted") {
            // If it's okay let's create a notification
            var notification = new Notification("Hi there!");
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