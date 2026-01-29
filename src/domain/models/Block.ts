import type { BlockType } from "./BlockType";

export interface Block {
    type: BlockType;
    content?: string;
}
