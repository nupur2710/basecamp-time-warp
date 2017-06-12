import { Component, OnInit } from '@angular/core';
import { DataService } from '../shared/data.service';
import { Subscription } from 'rxjs/Subscription';

@Component({
    selector: 'app-user-details',
    templateUrl: './user-details.component.html',
    styleUrls: ['./user-details.component.css']
})
export class UserDetailsComponent implements OnInit {
    nameOfUser = "";


    subscription: Subscription;
    constructor(private dataService: DataService) {
        this.nameOfUser = this.dataService.nameOfUser;
    }

    ngOnInit() {
        this.subscription = this.dataService.userNameUpdated.subscribe(
            (nameOfUser) => {
                this.nameOfUser = nameOfUser;
            }
        )
        this.nameOfUser = this.dataService.nameOfUser;
    }

}