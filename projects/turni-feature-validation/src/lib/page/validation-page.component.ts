import { Component, OnInit, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { OptimizerResult, TurniFacade, ValidationIssue } from '@turni/data-access';
@Component({ selector:'turni-validation-page', templateUrl:'./validation-page.component.html', styleUrls:['./validation-page.component.scss'] })
export class ValidationPageComponent implements OnInit { public facade: TurniFacade = inject(TurniFacade); issues$!: Observable<ValidationIssue[]>; optimizer$!: Observable<OptimizerResult | null>; ngOnInit(): void { this.facade.load(); this.issues$ = this.facade.issues$; this.optimizer$ = this.facade.optimizer$; } }
