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
            description: 'Turni, avvisi e statistiche del periodo',
            icon: 'calendar_month',
            route: '/piano-turni',
            exact: true,
        },
        {
            label: 'Operatori',
            description: 'Anagrafica e regole operatori',
            icon: 'manage_accounts',
            route: '/piano-turni/operatori',
        },
        {
            label: 'Regole turni',
            description: 'Operatori richiesti per turno',
            icon: 'tune',
            route: '/piano-turni/regole-turni',
        },
    ];
}
