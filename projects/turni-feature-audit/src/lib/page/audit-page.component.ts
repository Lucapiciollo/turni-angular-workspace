import { Component, OnInit, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AuditLog, TurniFacade } from '@turni/data-access';
@Component({ selector:'turni-audit-page', templateUrl:'./audit-page.component.html', styleUrls:['./audit-page.component.scss'] })
export class AuditPageComponent implements OnInit { public facade: TurniFacade = inject(TurniFacade); audits$!: Observable<AuditLog[]>; ngOnInit(): void { this.facade.load(); this.audits$ = this.facade.audits$; } icon(a: string): string { if(a.includes('SAVE')) return '▣'; if(a.includes('LOCK')) return '🔒'; if(a.includes('MOVE')) return '↔'; if(a.includes('OPTIMIZE')) return '✦'; if(a.includes('PUBLISH')) return '▤'; return '✓'; } }
