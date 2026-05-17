import { Injectable } from '@angular/core';
import moment from 'moment';
import 'moment/locale/it';

@Injectable({
    providedIn: 'root',
})
export class MomentLocaleService {
    private initialized = false;

    init(): void {
        if (this.initialized) {
            return;
        }

        moment.locale('it');
        this.initialized = true;
    }
}
