import type { Prayer } from "../models/Prayer";
import blockDefinitions from "../../../schema/block-definitions.json";

export interface ValidationError {
    index: number;
    message: string;
}

export function validatePrayer(prayer: Prayer): ValidationError[] {
    const errors: ValidationError[] = [];

    if (!/^[a-z][a-zA-Z0-9]*$/.test(prayer.id)) {
        errors.push({
            index: -1,
            message: "Prayer ID must be camelCase and start with a letter",
        });
    }

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
            if (
                "maxLines" in def &&
                def.maxLines !== undefined &&
                block.content
            ) {
                const lines = block.content.split("\n");

                if (lines.length > def.maxLines) {
                    errors.push({
                        index,
                        message: `${def.label} must not exceed ${def.maxLines} line(s)`,
                    });
                }
            }
        }
    });

    return errors;
}
