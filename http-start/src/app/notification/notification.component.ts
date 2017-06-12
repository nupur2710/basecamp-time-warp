import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

import * as $ from 'jquery';

@Component({
    selector: 'app-notification',
    templateUrl: './notification.component.html',
    styleUrls: ['./notification.component.css'],

})
export class NotificationComponent implements OnInit {
    @ViewChild('notification') notif: ElementRef;
    notificationCLicked = true;

    constructor() {}

    ngOnInit() {}
    myShowFunction() {
        //window.alert("i showed alert");
    }

    mycloseFunction() {
        //window.alert("i closed alert");

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

    createNotification(notification) {
        debugger
        // this._push.create('Test', { body: 'something' }).subscribe(
        //     res => console.log(res),
        //     err => console.log(err)
        // )
    }



}
