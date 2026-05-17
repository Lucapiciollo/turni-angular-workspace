import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    standalone: false,
    name: 'turniSafeArray',
})
export class SafeArrayPipe implements PipeTransform {
    transform<T>(value: T[] | null | undefined): T[] {
        return value ?? [];
    }
}
