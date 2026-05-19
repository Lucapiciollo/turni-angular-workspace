import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { CONTENT_TYPE, PlCoreModule, PlCoreUtils, PlHttpRequest, PlHttpRequestConfig, PlHttpService, RESPONSE_TYPE } from 'pl-core-utils-library';
import {
    ShiftDefinition,
    Worker,
    WorkerAbsence,
} from '../models/turni.models';




export interface TurniBootstrapData {
    workers: Worker[];
    shifts: ShiftDefinition[];
    absences: WorkerAbsence[];
}

@Injectable({
    providedIn: 'root',
})
export class TurniApiService {
    private readonly baseUrl = 'http://localhost:3001/api';

    constructor(
        private http: HttpClient,
        private plHttpService: PlHttpService,
    ) { }

    loadBootstrap(): Observable<TurniBootstrapData> {
        const request = new PlHttpRequest({
            url: `${this.baseUrl}/turni/bootstrap`,
            method: 'GET',
        });


        return this.plHttpService.GET<TurniBootstrapData>(request, RESPONSE_TYPE.JSON, PlCoreModule.Routing().getIinterrupt(), CONTENT_TYPE.JSON, (response) => console.log(response)).pipe(map(response => JSON.parse(response?.body as any) as TurniBootstrapData));
    }

    saveBootstrap(data: TurniBootstrapData): Observable<TurniBootstrapData> {
        const request = new PlHttpRequest({
            url: `${this.baseUrl}/turni/bootstrap`,
            body: data,
        });

        return this.plHttpService.PUT<TurniBootstrapData>(request, RESPONSE_TYPE.JSON, PlCoreModule.Routing().getIinterrupt(), CONTENT_TYPE.JSON, (response) => console.log(response)).pipe(map(response => JSON.parse(response?.body as any) as TurniBootstrapData));

    }

    getWorkers(): Observable<Worker[]> {
        const request = new PlHttpRequest({
            url: `${this.baseUrl}/workers`
        });

        return this.plHttpService.GET<Worker[]>(request, RESPONSE_TYPE.JSON, PlCoreModule.Routing().getIinterrupt(), CONTENT_TYPE.JSON, (response) => console.log(response)).pipe(map(response => JSON.parse(response?.body as any) as Worker[]));

    }

    createWorker(worker: Worker): Observable<Worker> {
        const request = new PlHttpRequest({
            url: `${this.baseUrl}/workers`,
            body: worker,
        });
        return this.plHttpService.POST<Worker>(request, RESPONSE_TYPE.JSON, PlCoreModule.Routing().getIinterrupt(), CONTENT_TYPE.JSON, (response) => console.log(response)).pipe(map(response => JSON.parse(response?.body as any) as Worker));

    }

    updateWorker(worker: Worker): Observable<Worker> {
        const request = new PlHttpRequest({
            url: `${this.baseUrl}/workers/${worker.id}`,
            body: worker,
        });
        return this.plHttpService.PUT<Worker>(request, RESPONSE_TYPE.JSON, PlCoreModule.Routing().getIinterrupt(), CONTENT_TYPE.JSON, (response) => console.log(response)).pipe(map(response => JSON.parse(response?.body as any) as Worker));

    }

    deleteWorker(workerId: string): Observable<void> {
        const request = new PlHttpRequest({
            url: `${this.baseUrl}/workers/${workerId}`
        });

        return this.plHttpService.DELETE<void>(request, RESPONSE_TYPE.JSON, PlCoreModule.Routing().getIinterrupt(), CONTENT_TYPE.JSON, (response) => console.log(response)).pipe(map(() => void 0));

    }

    getShifts(): Observable<ShiftDefinition[]> {
        return this.http.get<ShiftDefinition[]>(`${this.baseUrl}/shifts`);
    }

    saveShifts(shifts: ShiftDefinition[]): Observable<ShiftDefinition[]> {
        return this.http.put<ShiftDefinition[]>(`${this.baseUrl}/shifts`, shifts);
    }

    getAbsences(): Observable<WorkerAbsence[]> {
        return this.http.get<WorkerAbsence[]>(`${this.baseUrl}/absences`);
    }

    createAbsence(absence: WorkerAbsence): Observable<WorkerAbsence> {
        return this.http.post<WorkerAbsence>(`${this.baseUrl}/absences`, absence);
    }

    updateAbsence(absence: WorkerAbsence): Observable<WorkerAbsence> {
        return this.http.put<WorkerAbsence>(`${this.baseUrl}/absences/${absence.id}`, absence);
    }

    deleteAbsence(absenceId: string): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/absences/${absenceId}`);
    }
}
