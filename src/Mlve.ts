


export type Costume = {
    name: string;
    path: string;
}

export type MlveTable = {
    name: string;
    version: string;
    list: {
        character: string;
        costume: Costume[];
    }[];
}