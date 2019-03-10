import { Node, Edge, Options } from 'vis';

declare interface IHistorySeries {
    name: string
    values: number[]
}

declare interface IHistory {
    dates: Date[]
    series: IHistorySeries[]
}

declare interface IConceptMap {
    nodes: Node[];
    edges: Edge[];
    options: Options;
}

declare interface IActor {
    actor: string
    class?: string
    age?: number
    level?: string
    grade?: number
}

declare interface IDataService {
    getHistory( actor: string ): Promise<IHistory>
    getNetwork( actor: string, time?: Date ): Promise<IConceptMap>
    getActors(): Promise<IActor[]>
}

