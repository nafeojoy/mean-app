import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { tokenNotExpired } from 'angular2-jwt';

@Injectable()
export class AuthGuard implements CanActivate {
    canActivate() {
        if(tokenNotExpired()) {
            return true;
        }

        return false;
    }
}