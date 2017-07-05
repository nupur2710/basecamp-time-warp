import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { Routes, RouterModule } from '@angular/router';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
 import { Ng2CompleterModule } from "ng2-completer";
import { DatePickerModule } from 'ng2-datepicker';

import { AppComponent } from './app.component';
import { AuthServerService } from './shared/auth-server.service';
import { DataService } from './shared/data.service';
import { NotificationComponent } from './notification/notification.component';
import { TasksComponent } from './tasks/tasks.component';
import { EnterTimeComponent } from './enter-time/enter-time.component';
import { LoginComponent } from './login/login.component';
import { UserDetailsComponent } from './user-details/user-details.component';

import {TimeDescriptionDirective} from './tasks/timeDescription.directive';

@NgModule({
    declarations: [
        AppComponent,
        NotificationComponent,
        TasksComponent,
        EnterTimeComponent,
        LoginComponent,
        UserDetailsComponent,       
        TimeDescriptionDirective
    ],
    imports: [
        BrowserModule,
        FormsModule,
        HttpModule,
        BrowserAnimationsModule,
        AppRoutingModule,
        Ng2CompleterModule,
        DatePickerModule
       
    ],
    providers: [AuthServerService, DataService],
    bootstrap: [AppComponent]
})
export class AppModule {}