import { Directive, HostListener } from '@angular/core';

@Directive({
    standalone: false,
    selector: '[turniPreventDefault]',
})
export class PreventDefaultDirective {
    @HostListener('click', ['$event'])
    preventDefault(event: Event): void {
        event.preventDefault();
    }
}
