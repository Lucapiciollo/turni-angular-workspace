import { Component } from '@angular/core';

@Component({
  selector: 'app-shell',
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss']
})
export class ShellComponent {
  readonly menu = [
    { label: 'Dashboard', icon: '⌂', route: '/dashboard' },
    { label: 'Piano turni', icon: '▣', route: '/piano-turni' },
    { label: 'Operatori', icon: '♙', route: '/dashboard' },
    { label: 'Richieste', icon: '▤', route: '/dashboard', badge: 12 },
    { label: 'Presenze', icon: '◷', route: '/dashboard' },
    { label: 'Validazioni', icon: '✓', route: '/validazioni' },
    { label: 'Audit log', icon: '≡', route: '/audit' },
    { label: 'Report', icon: '▥', route: '/dashboard' },
    { label: 'Impostazioni', icon: '⚙', route: '/dashboard' }
  ];
}
