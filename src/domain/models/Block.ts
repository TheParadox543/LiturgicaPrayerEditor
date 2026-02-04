import type { BlockType } from "./BlockType";

export interface Block {
    type: BlockType;
    content?: string;
    items?: Block[];
    route?: string; // For link blocks - prayer route reference
    filename?: string; // For link blocks - prayer file path
}
