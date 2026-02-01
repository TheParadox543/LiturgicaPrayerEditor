import type { Prayer } from "../models/Prayer";
import type { Block } from "../models/Block";
import blockDefinitions from "../../../schema/block-definitions.json";

export interface ValidationError {
    index: number;
    nestedIndex?: number;
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
        validateBlock(block, index, errors, prayer.blocks.length);
    });

    return errors;
}

function validateBlock(
    block: Block,
    index: number,
    errors: ValidationError[],
    totalBlocks: number,
    nestedIndex?: number,
    isFirstInContainer?: boolean,
    isLastInContainer?: boolean,
) {
    const def = blockDefinitions.blocks[block.type];

    if (!def) {
        errors.push({
            index,
            nestedIndex,
            message: `Unknown block type: ${block.type}`,
        });
        return;
    }

    // Validate content requirements
    if (def.requiresContent) {
        if (!block.content || block.content.trim() === "") {
            errors.push({
                index,
                nestedIndex,
                message: `${def.label} block requires content`,
            });
        }
        if ("maxLines" in def && def.maxLines !== undefined && block.content) {
            const lines = block.content.split("\n");

            if (lines.length > def.maxLines) {
                errors.push({
                    index,
                    nestedIndex,
                    message: `${def.label} must not exceed ${def.maxLines} line(s)`,
                });
            }
        }
    }

    // Position validation
    // For top-level blocks, check position in prayer
    // For nested blocks, check position within parent container
    const checkFirst =
        nestedIndex === undefined ? index === 0 : isFirstInContainer;
    const checkLast =
        nestedIndex === undefined
            ? index === totalBlocks - 1
            : isLastInContainer;

    if (checkFirst && def.position?.allowAsFirst === false) {
        const context =
            nestedIndex === undefined ? "a prayer" : "this container";
        errors.push({
            index,
            nestedIndex,
            message: `${def.label} cannot be the first block of ${context}`,
        });
    }

    if (checkLast && def.position?.allowAsLast === false) {
        const context =
            nestedIndex === undefined ? "a prayer" : "this container";
        errors.push({
            index,
            nestedIndex,
            message: `${def.label} cannot be the last block of ${context}`,
        });
    }

    // Validate nested items for blocks that support them
    if ("allowedItems" in def && def.allowedItems) {
        const allowedItems = def.allowedItems as string[];
        const minItems = (def as any).minItems || 0;

        if (!block.items || block.items.length === 0) {
            if (minItems > 0) {
                errors.push({
                    index,
                    nestedIndex,
                    message: `${def.label} requires at least ${minItems} nested item(s)`,
                });
            }
        } else {
            // Validate each nested item
            block.items.forEach((nestedBlock, nestedIdx) => {
                // Check if nested block type is allowed
                if (!allowedItems.includes(nestedBlock.type)) {
                    errors.push({
                        index,
                        nestedIndex: nestedIdx,
                        message: `${nestedBlock.type} is not allowed in ${def.label}. Allowed types: ${allowedItems.join(", ")}`,
                    });
                }

                // Recursively validate the nested block
                const isFirst = nestedIdx === 0;
                const isLast = nestedIdx === block.items!.length - 1;
                validateBlock(
                    nestedBlock,
                    index,
                    errors,
                    totalBlocks,
                    nestedIdx,
                    isFirst,
                    isLast,
                );
            });
        }
    }
}
