import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    standalone: false,
    name: 'turniShiftLabel',
})
export class ShiftLabelPipe implements PipeTransform {
    transform(value: string | null | undefined): string {
        if (value === 'MATTINA') {
            return 'Mattina';
        }

        if (value === 'POMERIGGIO') {
            return 'Pomeriggio';
        }

        if (value === 'NOTTE') {
            return 'Notte';
        }

        return value ?? '-';
    }
}
