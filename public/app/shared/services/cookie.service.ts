import { Injector, Injectable } from '@angular/core';

@Injectable()
export class CustomCookieService {
    
    setCookie(name, value, days) {
        return new Promise((resolve, reject) => {
            if (days) {
                var date = new Date();
                date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
                var expires = "; expires=" + date.toUTCString();
            }
            else {
                var expires = "";
            }
            document.cookie = name + "=" + value + expires + "; path=/";
            resolve(true)
        })
    }
    
}