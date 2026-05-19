  
    /**
     * Estensioni Array<T> aggiuntive per manipolazione avanzata di array.
     */
    export interface Array<T> {
        /**
         * Sposta l'elemento di una posizione verso il basso.
         * @param from Indice di partenza.
         * @example
         * arr.moveDown(2);
         */
        moveDown(from: number): void;

        /**
         * Sposta l'elemento da un indice a un altro.
         * @param from Indice di partenza.
         * @param to Indice di destinazione.
         * @example
         * arr.moveTo(0, 3);
         */
        moveTo(from: number, to: number): void;

        /**
         * Sposta l'elemento di una posizione verso l'alto.
         * @param from Indice di partenza.
         * @example
         * arr.moveUp(4);
         */
        moveUp(from: number): void;

        /**
         * Elimina l'elemento nella posizione indicata.
         * @param position Indice da eliminare.
         * @example
         * arr.delete(1);
         */
        delete(position: number): void;

        /**
         * Inserisce un elemento nella posizione indicata.
         * @param index Indice di inserimento.
         * @param item Elemento da inserire.
         * @example
         * arr.insert(2, 'foo');
         */
        insert(index: number, item: T): void;

        /**
         * Ritorna gli elementi presenti nell'array corrente ma non presenti nell'array passato.
         * @param items Array di confronto.
         * @returns Array differenze.
         * @example
         * arr.differences([1,2]);
         */
        differences(items: T[]): T[];

        /**
         * Ritorna l'indice dell'elemento se presente, altrimenti -1.
         * @param item Elemento da cercare.
         * @returns Indice o -1.
         * @example
         * arr.inArray('foo');
         */
        inArray(item: T): number;

        /**
         * Disposizioni semplici di classe k. Ordine importante, senza ripetizione.
         * @param k Classe della disposizione.
         * @returns Generatore di disposizioni.
         * @example
         * for (const d of arr.simpleDisposition(2)) { ... }
         */
        simpleDisposition(k: number): Generator<T[], void, unknown>;

        /**
         * Combinazioni semplici di classe k. Ordine non importante, senza ripetizione.
         * @param k Classe della combinazione.
         * @returns Generatore di combinazioni.
         * @example
         * for (const c of arr.simpleCombine(2)) { ... }
         */
        simpleCombine(k: number): Generator<T[], void, unknown>;
    }

    /**
     * Estensioni String aggiuntive per manipolazione avanzata di stringhe.
     */
    export interface String {
        /**
         * Format stile C#: "Ciao {0} {1}".format("Luca", "Piciollo")
         * @param params Parametri da interpolare.
         * @returns Stringa formattata.
         * @example
         * 'Ciao {0}'.format('Luca');
         */
       format(...params: (string | number | boolean | null | undefined)[]): string;

        /**
         * Controlla se il valore passato è null, undefined o stringa vuota.
         * @param val Valore da controllare.
         * @returns True se nullo o vuoto.
         * @example
         * ''.isNullOrEmpty('');
         */
        isNullOrEmpty(val: string | null | undefined): boolean;

        /**
         * Tronca la URL prima del punto interrogativo se val non è valorizzato.
         * @param val Valore opzionale.
         * @returns Stringa troncata.
         * @example
         * '/foo/bar?x=1'.truncateUrlIfNoParams();
         */
        truncateUrlIfNoParams(val?: unknown): string;

        /**
         * Rimuove dalla stringa il tag cache passato.
         * @param cachableTag Tag cache da rimuovere.
         * @returns Stringa senza tag cache.
         * @example
         * '/foo@cachable@'.truncateUrlCache('@cachable@');
         */
        truncateUrlCache(cachableTag: string): string;

        /**
         * includes e repeat sono già nativi in TypeScript moderno.
         * Non serve dichiararli se il tuo tsconfig usa lib moderne.
         */
    }

    /**
     * Estensioni Object aggiuntive per manipolazione avanzata di oggetti.
     */
    export interface Object {
        /**
         * Clona profondamente l'oggetto tramite structuredClone.
         * @returns Copia profonda dell'oggetto.
         * @example
         * const copy = obj.clone();
         */
        clone<T>(): T;

        /**
         * Cambia ricorsivamente i valori dell'oggetto che corrispondono a uno dei valori passati.
         * @param currentValues Array di valori da sostituire.
         * @param newValue Nuovo valore da assegnare.
         * @param ignore Chiavi da ignorare.
         * @returns Oggetto modificato.
         * @example
         * obj.changeValues([null, ''], 0);
         */
        changeValues<T = any>(
            currentValues: any[],
            newValue: any,
            ignore?: Array<keyof T | string>
        ): T;

        /**
         * Crea un proxy ricorsivo dell'oggetto.
         * @param replaceWith Valore di sostituzione.
         * @param proxy Funzione custom proxy.
         * @param ignore Chiavi da ignorare.
         * @returns Proxy ricorsivo.
         * @example
         * obj.PROXY();
         */
        PROXY<T = any>(
            replaceWith?: any,
            proxy?: (object: any, emptyChar?: any) => any,
            ignore?: string[]
        ): T;
    }

    /**
     * Estensioni JSON custom per manipolazione avanzata di strutture dati.
     */
    export interface JSON {
        /**
         * Cambia ricorsivamente tutti i valori uguali a previousValue.
         * @param json Oggetto/array di partenza.
         * @param previousValue Valore da sostituire.
         * @param nextValue Nuovo valore.
         * @param ignore Chiavi da ignorare.
         * @returns Oggetto modificato.
         * @example
         * JSON.changeValues(obj, null, 0);
         */
        changeValues<T = any>(
            json: T,
            previousValue: any,
            nextValue: any,
            ignore?: string[]
        ): T;

        /**
         * Cambia ricorsivamente il valore delle proprietà con chiave uguale a key.
         * @param json Oggetto/array di partenza.
         * @param key Chiave da cercare.
         * @param nextValue Nuovo valore.
         * @param ignore Chiavi da ignorare.
         * @returns Oggetto modificato.
         * @example
         * JSON.changeValuesByKey(obj, 'id', 0);
         */
        changeValuesByKey<T = any>(
            json: T,
            key: string,
            nextValue: any,
            ignore?: string[]
        ): T;

        /**
         * Cerca ricorsivamente una chiave.
         * @param json Oggetto/array di partenza.
         * @param keyFind Chiave da cercare.
         * @param ignore Chiavi da ignorare.
         * @param stopOnFirst Se true si ferma al primo match.
         * @returns Array di oggetti { key, value } trovati.
         * @example
         * JSON.findKey(obj, 'id');
         */
        findKey<T = any>(
            json: T,
            keyFind: string,
            ignore?: string[],
            stopOnFirst?: boolean
        ): Array<{
            key: string;
            value: any;
        }>;

        /**
         * Cerca ricorsivamente un valore.
         * @param json Oggetto/array di partenza.
         * @param value Valore da cercare.
         * @param ignore Chiavi da ignorare.
         * @param stopOnFirst Se true si ferma al primo match.
         * @returns Array di oggetti { key, value, object } trovati.
         * @example
         * JSON.findByValue(obj, null);
         */
        findByValue<T = any>(
            json: T,
            value: any,
            ignore?: string[],
            stopOnFirst?: boolean
        ): Array<{
            key: string;
            value: any;
            object: any;
        }>;

        /**
         * Cerca ricorsivamente una coppia chiave/valore.
         * @param json Oggetto/array di partenza.
         * @param keyFind Chiave da cercare.
         * @param valueFind Valore da cercare.
         * @param ignore Chiavi da ignorare.
         * @param stopOnFirst Se true si ferma al primo match.
         * @returns Array di oggetti { key, value, object } trovati.
         * @example
         * JSON.findByKeyAndValue(obj, 'id', 1);
         */
        findByKeyAndValue<T = any>(
            json: T,
            keyFind: string,
            valueFind: any,
            ignore?: string[],
            stopOnFirst?: boolean
        ): Array<{
            key: string;
            value: any;
            object: any;
        }>;

        /**
         * Converte un JSON in lista flat: [{ key: "a.b.c", value: 1 }]
         * @param json Oggetto/array di partenza.
         * @param ignore Chiavi da ignorare.
         * @returns Array flat key/value.
         * @example
         * JSON.json2flat(obj);
         */
        json2flat<T = any>(
            json: T,
            ignore?: string[]
        ): Array<{
            key: string;
            value: any;
        }>;

        /**
         * Converte un JSON in array key/value senza path completo.
         * @param json Oggetto/array di partenza.
         * @param ignore Chiavi da ignorare.
         * @returns Array key/value.
         * @example
         * JSON.json2array(obj);
         */
        json2array<T = any>(
            json: T,
            ignore?: string[]
        ): Array<{
            key: string;
            value: any;
        }>;

        /**
         * Converte un oggetto in oggetto flat: { "a.b.c": 1 }
         * @param data Oggetto di partenza.
         * @param ignore Chiavi da ignorare.
         * @returns Oggetto flat key/value.
         * @example
         * JSON.json2flatObj(obj);
         */
        json2flatObj<T = any>(
            data: T,
            ignore?: string[]
        ): Record<string, any>;

        /**
         * Cancella chiavi per nome.
         * @param source Oggetto/array di partenza.
         * @param keys Chiave o array di chiavi da eliminare.
         * @returns Oggetto modificato.
         * @example
         * JSON.deleteKey(obj, 'id');
         * JSON.deleteKey(obj, ['id', 'uuid']);
         */
        deleteKey<T = any>(
            source: T,
            keys: string | string[]
        ): T;

        /**
         * Cancella chiavi per nome solo se hanno uno specifico valore.
         * @param source Oggetto/array di partenza.
         * @param keys Chiave o array di chiavi da eliminare.
         * @param valueToMatch Valore o array di valori da matchare.
         * @returns Oggetto modificato.
         * @example
         * JSON.deleteKey(obj, 'name', null);
         * JSON.deleteKey(obj, ['name', 'surname'], ['', null]);
         */
        deleteKey<T = any>(
            source: T,
            keys: string | string[],
            valueToMatch: any | any[]
        ): T;

        /**
         * Se keys è null, cancella tutte le chiavi che hanno quel valore.
         * @param source Oggetto/array di partenza.
         * @param keys Deve essere null.
         * @param valueToMatch Valore o array di valori da matchare.
         * @returns Oggetto modificato.
         * @example
         * JSON.deleteKey(obj, null, null);
         * JSON.deleteKey(obj, null, ['', null, undefined]);
         */
        deleteKey<T = any>(
            source: T,
            keys: null,
            valueToMatch: any | any[]
        ): T;
    }
 
export declare function alert(message?: any, body?: any): void;