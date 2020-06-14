import d3 = require( "d3" );
import vis, { Node, Edge, DataSet } from 'vis';
// import { LocalDataService as DataService } from "./LocalDataService";
import { GraaspDataService as DataService } from "./GraaspDataService";
import visOptions from "./vis-options";
import $ from "jquery";
import { IDataService, IActor, IHistory, IConceptMap, IFeedback } from "../types";

let dataService: IDataService;
let actors: IActor[];
let selectedActor: string;
const margin = {top: 20, right: 20, bottom: 30, left: 30};

async function initialize(){
    dataService = new DataService( "5c628f988e853c853297b428", "http://localhost:3000/graasp/" );
    actors = await dataService.getActors();

    $("#actor-picker")
        .append( actors.map( ( a, i ) => $(`<option${ i == 0 ? " selected" : ""}>${a.actor}</option>`) ) )
        .change( event => selectActor( (<HTMLOptionElement>event.target).value ) )
    selectActor( actors[0].actor );
}

async function selectActor( actor: string ) {
    selectedActor = actor;
    let history = await dataService.getHistory( actor );
    createTimeline( history );
    let network = await dataService.getNetwork( actor );
    createNetwork( network );
}

function colour( i: number, n: number ): string {
    return d3.hcl( i/n * 360, 75, 50 ).hex();
}


let width: number;
let height: number;

function createTimeline( history: IHistory ){
    const timelineElement = document.getElementById("timeline");
    width = width || timelineElement.clientWidth;
    height = height || timelineElement.clientHeight;
    const series = history.series.filter( h => h.name !== "structure" );
    const feedback = history.feedback;
    
    let xScale = d3.scaleTime()
        .domain( d3.extent( history.dates ) )
        .range([margin.left, width - margin.right]);
    
    let yScale = d3.scaleLinear()
        .domain([1.25,0])
        .range([ margin.top, height - margin.bottom ]);

    let line = d3.line<Number>()
        .defined( d => !!d )
        .x( ( d, i ) => xScale( history.dates[i] ) )
        .y( d => yScale( d ) )

    d3.select( "#timeline > svg" ).remove();
    const svg = d3.select("#timeline")
        .append("svg")
        .attr("width", width )
        .attr("height", height )
    
    svg.append("g")
        .attr('class', "axis" )
        .attr('transform', `translate(0, ${ height - margin.bottom })`)
        .call(d3.axisBottom(xScale));
    
    svg.append("g")
        .attr('class', "axis" )
        .attr('transform', `translate(${ margin.left}, 0)`)
        .call(d3.axisLeft(yScale).tickArguments([4, "s"]))
    
    // criteria
    const path = svg.append("g")
        .attr("class", "criteria")
        .selectAll(".line")
        .data( series )
      .enter().append("path")
        .attr("class", "line")
        .attr("d", d => line( d.values ) )
        .attr( "series", d => d.name )
        .style("stroke", (d, i, a) => colour( i, a.length ) )   

    // feedback
    const events = svg.append("g")
        .attr("class", "events")
        .selectAll(".event")
        .data( feedback )
      .enter().append("line")
        .attr("class", "event" )
        .attr("transform", (d) => `translate( ${xScale(d.time)}, 0 )`)
        .attr("y1", yScale( 0 ) )
        .attr("y2", yScale( 1.25 ) );

    // tooltip
    const tooltip = d3.select("#timeline").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0 );

    svg.style("position", "relative");
    svg.on("mousemove", moved );

    let current = svg.append( "g" )
        .attr( "class", "selected" )
        .attr( "transform", `translate( ${width - margin.right }, 0 )`);
    current.append( "line" )
        .attr( "y1", yScale( 0 ) )
        .attr( "y2", yScale( 1.25 ) );

    let markers = current.selectAll( "circle" )
        .data( getSelectedPoints( history.dates[0]) )
      .enter().append( "circle" )
        .style( "fill", (d, i, a) => colour( i, a.length ) )
        .attr( "r", 3 );
    updateMarkers();    

    let legend = svg.append( "g" )
        .attr( "class", "legend" )
        .attr( "transform", `translate( ${margin.left}, ${margin.top + 16 } )` )
        .selectAll( "text" )
        .data( getSelectedPoints( history.dates[0] ) )
      .enter().append( "text" )
        .attr( "x", 10 )
        .attr( "y", ( d, i ) => i * 16 )
        .attr( "font-family", "Roboto, Sans-Serif" )
        .attr( "font-size", 12 )
        .attr( "fill", (d, i, a) => colour( i, a.length ) )
    updateLegend();

    function updateMarkers(){
        markers.attr( "cy", (d) => d.value ? yScale( d.value ) : yScale( -5 ) );
    }

    function updateLegend(){        
        legend.text( d => `${d.name}: ${Math.round( d.value * 100 ) / 100 || 'NaN'}` );
    }

    let currentDate = 0;
    let currentEvent: IFeedback;
    async function moved() {
        d3.event.preventDefault();      
        let pos = getPosition();

        // handle event tooltips
        let event = getEvent( pos.x );
        if (event != currentEvent){
            currentEvent = event;
            feedback.forEach( fb => fb.hover = false );
            if ( event ){
                // console.log( "mouseover", {event, d3Event: d3.event });
                event.hover = true;
                tooltip.transition()
                    .duration( 100 )
                    .style( "opacity", 0.8 );
                tooltip.html( getEventHtml( event ) )
                    .style( "left", `${d3.event.pageX}px` )
                    .style( "top", `${d3.event.pageY}px` );
            } else {
                // console.log( "mouseout", {event});
                tooltip.transition()
                    .duration( 500 )
                    .style( "opacity", 0 );
            }
            updateEvents();
        }

        // handle criteria highlights
        let date = getDate( pos.x );
        if ( currentDate == date.getTime() )
            return;
        currentDate = date.getTime();
        current.attr( "transform", `translate( ${xScale(date)}, 0 )`);
        let points = getSelectedPoints( date );
        markers.data( points );
        updateMarkers();
        legend.data( points );
        updateLegend();
        updateNetwork( await dataService.getNetwork( selectedActor, date ) );

    }

    // async function clicked(){
    //     let pos = getPosition();
    //     let date = getDate( pos.x );
    //     current.attr("transform", `translate( ${xScale(date)}, 0 )`);
    //     createNetwork( await dataService.getNetwork( selected.value, date ) );
    // }

    function getPosition(){
        return {
            x: xScale.invert( d3.event.layerX ),
            y: yScale.invert( d3.event.layerY )
        }; 
    }

    function getDate( time: Date ): Date {
        // return closest date in date history set.
        let closest = history.dates[0];
        for (const _time of history.dates ) {
            if ( Math.abs( time.getTime() - _time.getTime() ) < Math.abs( time.getTime() - closest.getTime() ) )
                closest = _time;
        }
        return closest;
    }

    function getEvent( time: Date, threshold: number = 30 ): IFeedback {
        // console.log( "looking for event", {time, threshold})
        let events = history.feedback.filter( fb => Math.abs( fb.time.getTime() - time.getTime() ) <= threshold * 1000 );
        if ( !events || events.length == 0 )
            return null;
        // console.log( {events});
        let closest = events[0];
        for (const event of events ) {
            if ( Math.abs( event.time.getTime() - time.getTime() )
               < Math.abs( closest.time.getTime() - time.getTime() ) )
                closest = event;
        }

        return closest;            
    }

    function updateEvents(): void {
        events.data( feedback ).classed("hover", d => d.hover );
    }

    function getEventHtml( event: IFeedback ): string {
        return `
        <span class="question">${event.message}</span>
        <span class="response">${event.response}</span>
        <span class="action">${event.action}</span>
        <span class="criterium">${event.criteria}</span>`
    }

    function getSelectedPoints( time: Date ){
        let index = history.dates.indexOf( time );
        return series.map( s => {
            return {
                time: time,
                value: s.values[index],
                name: s.name
            }
        })
    }
}

let network: vis.Network;
let nodes: vis.DataSet<Node>;
let edges: vis.DataSet<Edge>;
function createNetwork( map: IConceptMap ){
    nodes = new DataSet( map.nodes );
    edges = new DataSet( map.edges );
    network = new vis.Network( document.getElementById("network"), { nodes, edges }, <any>visOptions )
}

function updateNetwork( map: IConceptMap, duration = 500 ){
    let anyAnimations = false;
    for ( let newNode of map.nodes ){
        let oldNode = nodes.get( newNode.id );
        if (!oldNode)
            addNode( newNode );
        else 
            anyAnimations = updateNode( oldNode, newNode, duration ) || anyAnimations;
    }
    for ( let oldNode of nodes.get() ){
        let newNode = map.nodes.find( n => n.id == oldNode.id );
        if (!newNode)
            removeNode( oldNode );
    }
    if ( anyAnimations && !animation )
        animation = requestAnimationFrame( networkAnimationFrameCallback );
        
    edges.update( map.edges );
    for ( let edge of edges.get() ){
        if (!map.edges.find( e => e.id == edge.id ) )
            edges.remove( edge.id );
    }
}

function addNode( node: vis.Node ){
    // console.log( `Adding ${node.label} (${node.id})`)
    nodes.add( node );
}

type pos = { x: number, y: number };
let animation: number;
let animations: {
    node: Node,
    start: DOMHighResTimeStamp;
    end: DOMHighResTimeStamp;
    from: pos,
    to: pos
}[] = [];

function updateNode( old: vis.Node, _new: vis.Node, duration: number ): boolean {
    // console.log( `Updating ${old.label} => ${_new.label} (${old.id})`);

    let anyAnimations = false;
    if ( old.x != _new.x || old.y != _new.y ){
        animations = animations.filter( a => a.node !== old );
        animations.push({
            node: old,
            start: Date.now(),
            end: Date.now() + duration,
            from: { x: old.x, y: old.y },
            to: { x: _new.x, y: _new.y }
        });
        anyAnimations = true;
    }

    old.label = _new.label;
    nodes.update( old );

    return anyAnimations;
}

function removeNode( node: vis.Node ){
    // console.log( `Removing ${node.label} (${node.id})`);
    nodes.remove( node.id );
    animations = animations.filter( a => a.node !== node );
}

function networkAnimationFrameCallback( step: number ){
    const now = Date.now();

    // update animations
    for ( let a of animations ) {
        let node = nodes.get( a.node.id );
        if (!node){
            a.end = 0;
            continue;
        }
        a.node = node;

        // how far along are we?
        let progress = ( now - a.start ) / (a.end - a.start );

        // set node position
        a.node.x = ease( progress, a.from.x, a.to.x );
        a.node.y = ease( progress, a.from.y, a.to.y );
        network.moveNode( a.node.id, a.node.x, a.node.y );
    }

    // update viewport
    network.fit();

    // store new positions, no idea why I have to call this
    network.storePositions();

    // remove completed animations
    animations = animations.filter( a => a.end > ( now + 1000/60 ) );

    // stop callbacks if all have completed
    if ( !animations.length ){
        cancelAnimationFrame( animation );
        animation = 0;
        return;
    } 

    // request next callback
    animation = requestAnimationFrame( networkAnimationFrameCallback );
}

function ease( t, a, b ){
    let x = t<.5 ? 2*t*t : -1+(4-2*t)*t;
    return a + x*(b-a);
}

window.onload = initialize;
