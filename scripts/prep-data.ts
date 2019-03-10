import * as fs from 'mz/fs';
import { IHistory } from '../types';

async function  prep( path ){
    let data = JSON.parse( await fs.readFile( path, "utf8" ) );
    let histories = {};
    let conceptMaps = [];

    for (const actor in data) {
        if (data.hasOwnProperty(actor)) {
            const story = data[actor];
            const history: IHistory = histories[actor] = {
                dates: story.maps.map( ss => ss.time ),
                series: []
            };

            history.series.push({
                name: "scoreStrict",
                values: story.maps.map( ss => ss.criteria.score.strict  ) 
            });
            history.series.push({
                name: "scooreLoose",
                values: story.maps.map( ss => ss.criteria.score.loose )
            });
            history.series.push({
                name: "densityConcepts",
                values: story.maps.map( ss => ss.criteria.density.concepts )
            });
            history.series.push({
                name: "densityLinks",
                values: story.maps.map( ss => ss.criteria.density.links )
            });
            history.series.push({
                name: "structure",
                values: story.maps.map( ss => ss.criteria.structure )
            });
               
            conceptMaps.push( ...story.maps.map( snapshot => {
                let { actor, time, map } = snapshot;
                time = new Date( time );
                return { actor, time, map }
            } ) );
        }
    }

    await fs.writeFile( "../data/histories.json", JSON.stringify( histories ), "utf8" );
    await fs.writeFile( "../data/conceptMaps.json", JSON.stringify( conceptMaps ), "utf8" );
}

prep("../../../data/clean/stories.json")

