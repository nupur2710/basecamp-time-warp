import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { ActivatedRoute, Params } from '@angular/router';
import 'rxjs/Rx';


@Injectable()
export class AuthServerService {
    //baseUrl = "http://192.168.0.175:3001/"

    baseUrl = "http://127.0.0.1:3001/";
    constructor(private http: Http, private route: ActivatedRoute) {

    }

    getUser() {
        var url = this.baseUrl + 'me';
        return this.http.get(url, {
            params: {
                accessToken: localStorage.getItem('accessToken')
            }
        });
    }

    getTasks() {
        var url = this.baseUrl + 'todoLists';
        return this.http.get(url, {
            params: {
                accessToken: localStorage.getItem('accessToken')
            }
        });
    }

    getRecentActivities() {
        var url = this.baseUrl + 'rss';
        return this.http.get(url, {
            params: {
                accessToken: localStorage.getItem('accessToken')
            }
        });
    }

    getTimeEntriesForSingleTodoItem(itemId){
        var url = this.baseUrl+'todoItems/timeEntries';
        return this.http.get(url,{
            params: {
                "accessToken": localStorage.getItem('accessToken'),
                'itemId':itemId
            }
        });
    }

    postTimeEntries(itemId, data) {
        var url = this.baseUrl + 'time_entries/' + itemId;
        return this.http.post(url, {
            params: {
                accessToken: localStorage.getItem('accessToken')
            },
            data:{
                'itemId':itemId,
                'personId':localStorage.getItem('person_id')
            }
        });
    }
}