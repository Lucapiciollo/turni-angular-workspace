import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { OptimizerResult, TurniFacade, ValidationIssue } from '@turni/data-access';
@Component({ selector:'turni-validation-page', templateUrl:'./validation-page.component.html', styleUrls:['./validation-page.component.scss'] })
export class ValidationPageComponent implements OnInit { issues$!: Observable<ValidationIssue[]>; optimizer$!: Observable<OptimizerResult | null>; constructor(public facade: TurniFacade) {} ngOnInit(): void { this.facade.load(); this.issues$ = this.facade.issues$; this.optimizer$ = this.facade.optimizer$; } }
