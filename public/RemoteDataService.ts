import { IDataService, IHistory, IActor, IConceptMap } from '../types';
import { default as request } from 'request-promise-native';
import { default as url } from 'url';

export class RemoteDataService implements IDataService {
    constructor ( private baseUrl: string ){}
    private fullUrl( path: string ): string {
        return url.resolve( this.baseUrl, path );
    }

    getHistory(actor: string): Promise<IHistory> {
        return request.get( this.fullUrl( "history" ), { qs: { actor } } )
            .then( JSON.parse )
            .then( createDates )
            .catch( console.error );
    }

    getNetwork(actor: string, time?: Date): Promise<IConceptMap> {
        return request.get( this.fullUrl( "conceptmap" ), { qs: { actor, time } } )
            // .then( dump() )
            .then( JSON.parse )
            .catch( console.error );
    }
    getActors(): Promise<IActor[]> {
        return request.get( this.fullUrl( "actors" ) )
            .then( JSON.parse )
            .catch( console.error );
    }
}

function createDates( history: IHistory ): any {
    history.dates = history.dates.map( d => new Date( d ) )
    return history;
}

function dump( key?: string ): ( object: any ) => any {
    return function( object ) {
        if (!!key) object = object[key];
        try {
            console.log( JSON.stringify( object, null, 2 ) );
        } catch {
            console.dir( object )
        } finally {
            return object;
        }
    }
}