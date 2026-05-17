import { Component } from '@angular/core';

interface MenuItem {
    label: string;
    description: string;
    icon: string;
    route: string;
    exact?: boolean;
}

@Component({
    standalone: false,
    selector: 'app-shell',
    templateUrl: './app-shell.component.html',
    styleUrls: ['./app-shell.component.scss'],
})
export class AppShellComponent {
    readonly menuItems: MenuItem[] = [
        {
            label: 'Piano turni',
            description: 'Lista periodo e generazione turni',
            icon: 'calendar_month',
            route: '/piano-turni',
            exact: true,
        },
        {
            label: 'Statistiche',
            description: 'Indicatori operatori e ore',
            icon: 'query_stats',
            route: '/piano-turni/statistiche',
        },
        {
            label: 'Warning',
            description: 'Anomalie, forzature e scoperti',
            icon: 'warning',
            route: '/piano-turni/warning',
        },
    ];
}
