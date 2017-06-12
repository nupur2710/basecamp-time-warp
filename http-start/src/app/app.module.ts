import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { Routes, RouterModule } from '@angular/router';
import { SimpleNotificationsModule } from 'angular2-notifications';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';


import { AppComponent } from './app.component';
import { AuthServerService } from './shared/auth-server.service';
import { DataService } from './shared/data.service';
import { NotificationComponent } from './notification/notification.component';
import { HomeComponent } from './home/home.component';
import { TasksComponent } from './tasks/tasks.component';
import { EnterTimeComponent } from './enter-time/enter-time.component';
import { LoginComponent } from './login/login.component';
import { UserDetailsComponent } from './user-details/user-details.component';

@NgModule({
    declarations: [
        AppComponent,
        NotificationComponent,
        
        HomeComponent,
        TasksComponent,
        EnterTimeComponent,
        LoginComponent,
        UserDetailsComponent
    ],
    imports: [
        BrowserModule,
        FormsModule,
        HttpModule,
        BrowserAnimationsModule,
        AppRoutingModule
    ],
    providers: [AuthServerService, DataService],
    bootstrap: [AppComponent]
})
export class AppModule {}