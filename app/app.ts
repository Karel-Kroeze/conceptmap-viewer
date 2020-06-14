import express = require( "express" );
import {  } from "express";
import path from "path";
import { API } from "./router";
import request from "request";

export const app = express();
const staticPath = path.resolve( __dirname, '../dist' );
console.log( { staticPath } );

app.use( express.urlencoded( { extended: false } ) );
app.use( '/', express.static( staticPath ) );
app.use( '/api', API );

// pass on requests meant for graasp
// https://gist.github.com/mrded/540aa79a42f74a4911e8
app.use( '/graasp', (req, res) => {
    console.log( `Forwarding request for ${req.originalUrl} to http://graasp.eu/api/ils${req.url}` );
    req.pipe(request("http://graasp.eu/api/ils" + req.url ) ).pipe( res);
});

const port = 3000
app.listen(port, () => console.log(`CM Viewer listening on ${port}!`))