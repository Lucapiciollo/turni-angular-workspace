import { Directive, HostListener } from '@angular/core';

@Directive({
    standalone: false,
    selector: '[turniStopPropagation]',
})
export class StopPropagationDirective {
    @HostListener('click', ['$event'])
    stopPropagation(event: Event): void {
        event.stopPropagation();
    }
}
