import express = require( "express" );
import {  } from "express";
import path from "path";
import { API } from "./router";

export const app = express();
const staticPath = path.resolve( __dirname, '../dist' )
console.log( { staticPath } );

app.use( express.urlencoded( { extended: false } ) );
app.use( '/', express.static( staticPath ) );
app.use( '/api', API );

const port = 3000
app.listen(port, () => console.log(`CM Viewer listening on ${port}!`))