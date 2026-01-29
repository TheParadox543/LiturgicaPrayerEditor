import type { Block } from "./Block";

export interface Prayer {
    schemaVersion: number;
    id: string;
    title: string;
    language?: string;
    blocks: Block[];
}
