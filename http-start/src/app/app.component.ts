import { Component, EventEmitter, Output } from '@angular/core';



@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})


export class AppComponent {
    isLoggedIn: boolean = false;
    
    constructor() {}

    ngOnInit() {
    	
    }
    
    changeLoggedStatus(status: boolean) {
        this.isLoggedIn = status;
    }


}