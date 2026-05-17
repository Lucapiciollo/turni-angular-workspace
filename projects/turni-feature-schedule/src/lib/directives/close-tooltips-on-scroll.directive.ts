import { Directive, HostListener } from '@angular/core';
import { MatTooltip } from '@angular/material/tooltip';

@Directive({
    standalone: false,
    selector: '[turniCloseTooltipOnScroll]',
})
export class CloseTooltipsOnScrollDirective {
    constructor(
        private tooltip: MatTooltip
    ) {}

    @HostListener('wheel')
    @HostListener('touchmove')
    @HostListener('click')
    closeTooltip(): void {
        this.tooltip.hide(0);
    }
}
