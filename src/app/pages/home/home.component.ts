import { Component, ViewChild, ElementRef, EventEmitter, Output, Input } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Router } from "@angular/router";
import { AppState } from "../../app.service";
import { HomeService } from './home.service';


@Component({
  selector: 'home',
  styleUrls: ['./home.scss'],
  templateUrl: './home.html'
})
export class Home {
  
}


