import { IDataService, IHistory, IConceptMap, IActor } from '../types';

export class LocalDataService implements IDataService {
    private histories: {
        [actor: string]: IHistory;
    } = {};
    private conceptMaps: {
        actor: string;
        time: Date;
        map: IConceptMap;
    }[] = [];
    constructor() {
        this.histories = require("../data/histories.json");
        for (const actor in this.histories) {
            if (this.histories.hasOwnProperty(actor)) {
                const history = this.histories[actor];
                history.dates = history.dates.map(d => new Date(d));
            }
        }
        this.conceptMaps = require("../data/conceptMaps.json");
        this.conceptMaps.forEach(cm => cm.time = new Date(cm.time));
    }
    async getHistory(actor: string): Promise<IHistory> {
        return this.histories[actor];
    }
    async getNetwork(actor: string, time?: Date): Promise<IConceptMap> {
        if (time) {
            let cm = this.conceptMaps.find(cm => cm.actor == actor && time.getTime() == cm.time.getTime());
            return cm ? cm.map : undefined;
        }
        let cms = this.conceptMaps.filter(cm => cm.actor == actor);
        let latest = cms[0];
        if (!latest)
            return undefined;
        for (const cm of cms)
            if (cm.time > latest.time)
                latest = cm;
        return latest.map;
    }
    async getActors(): Promise<IActor[]> {
        return Object.keys(this.histories).map(actor => { return { actor: actor }; });
    }
}
