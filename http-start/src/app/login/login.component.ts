import { Component, OnInit } from '@angular/core';
import { DataService } from '../shared/data.service';
import { Response } from '@angular/http';
import { AuthServerService } from '../shared/auth-server.service';
import { ActivatedRoute, Router } from '@angular/router';

import { Subscription } from 'rxjs/Subscription';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
    user = "";
    verificationCode;
    hasAuthenticationToken;

    subscription: Subscription;

    constructor(private serverService: AuthServerService, private dataService: DataService, private route: ActivatedRoute, private router: Router) {
        var self = this;
        this.subscription = this.dataService.accessTokenAdded.subscribe(
            ({}) => {
                self.setUserDetails();
            },
            (error) => {
                console.log(error);
            }
        )

        this.setUserDetails();
    }

    ngOnInit() {
    }

    setUserDetails() {
        var self = this;
        if (this.isLoggedIn()) {
            if (window.localStorage.getItem("userDetails")) {
                var userDetails = JSON.parse(localStorage.getItem("userDetails"));
                this.user = userDetails['user-fname'] + " " + userDetails['user-lname'];
                this.router.navigate(['/tasks']);

            } else {
                this.serverService.getUser()
                    .subscribe(
                        function(response: Response) {
                            if (response['_body']) {
                                var body = JSON.parse(response['_body']);
                                if (body.person) {
                                    var fname = body.person['first-name'],
                                        lname = body.person['last-name'],
                                        personId = body.person['id'];
                                    self.setNameToLocalStorage(fname, lname, personId);
                                    self.user = fname + " " + lname;
                                }

                            }
                        },
                        (error) => console.log(error)
                    );
            }

        }
    }

    setNameToLocalStorage(fname, lname, personId) {
        var userDetails = {
            "user-fname": fname,
            "user-lname": lname,
            "person_id": personId
        }
        window.localStorage.setItem('userDetails', JSON.stringify(userDetails));
    }

    onLoginClick() {

        // prod link "https://launchpad.37signals.com/authorization/new?client_id=d119a53aed7fabe1407f1e34f7f29053da10b3bd&redirect_uri=http%3A%2F192.168.0.175%3A3001%2Fauth%2Fbasecamp&type=web_server"

        //local link "https://launchpad.37signals.com/authorization/new?client_id=f580e2bd7a470f2bade0a2670696e1c3edb7b7d1&redirect_uri=http%3A%2F%2F127.0.0.1%3A3001%2Fauth%2Fbasecamp&type=web_server"


        window.location.href = "https://launchpad.37signals.com/authorization/new?client_id=f580e2bd7a470f2bade0a2670696e1c3edb7b7d1&redirect_uri=http%3A%2F%2F127.0.0.1%3A3001%2Fauth%2Fbasecamp&type=web_server";
    }

    isLoggedIn() {
        if (window.localStorage.getItem('accessToken')) {
            return true;
        } else {
            return false;
        }
    }



}