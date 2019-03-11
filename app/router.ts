import { Router } from "express";
import { IDataService, IActor, IHistory, IConceptMap } from "../types";
import fs from "fs";
import path from "path";
import moment from "moment";


const historyPath = path.resolve( __dirname, "../data/histories.json" );
const conceptMapsPath = path.resolve( __dirname, "../data/conceptMaps.json" );

const histories: { [actor: string]: IHistory } = JSON.parse( fs.readFileSync( historyPath, 'utf8' ) );
const conceptMaps: { actor: string, time: string, map: IConceptMap }[] =  JSON.parse( fs.readFileSync( conceptMapsPath, 'utf8' ) );
const actors: IActor[] = Object.keys( histories ).map( actor => { return { actor }; } );

export const API = Router();

API.get( "/actors", (req, res) => {
    res.json( actors );
});

API.get( "/history", (req, res) => {
    const { actor } = req.query;
    res.json( histories[actor] );
});

API.get( "/conceptmap", (req, res) => {
    // console.log( req.query );
    const { actor, time } = req.query;
    const maps = conceptMaps.filter( m => m.actor == actor );
    let map: any;
    if ( time )
        map = maps.find( m => m.time == time );
    maps.sort( (a, b) => moment( b.time ).diff( moment( a.time ) ) );
    map = map || maps[0];
    
    res.json( !!map ? map.map : undefined );
})