import { Prayer } from "../models/Prayer";
import blockDefinitions from "../../schema/block-definitions.json";

export interface ValidationError {
    index: number;
    message: string;
}

export function validatePrayer(prayer: Prayer): ValidationError[] {
    const errors: ValidationError[] = [];

    prayer.blocks.forEach((block, index) => {
        const def = blockDefinitions.blocks[block.type];

        if (!def) {
            errors.push({
                index,
                message: `Unknown block type: ${block.type}`,
            });
            return;
        }

        if (def.requiresContent) {
            if (!block.content || block.content.trim() === "") {
                errors.push({
                    index,
                    message: `${def.label} block requires content`,
                });
            }
        }
    });

    return errors;
}
