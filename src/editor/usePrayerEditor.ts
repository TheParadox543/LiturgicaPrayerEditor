import { useState, useEffect, useRef } from "react";
import type { Prayer } from "../domain/models/Prayer";
import type { Block } from "../domain/models/Block";
import type { BlockType } from "../domain/models/BlockType";
import { validatePrayer } from "../domain/validation/validatePrayer";
import blockDefinitions from "../../schema/block-definitions.json";

const DRAFT_KEY = "liturgica-prayer-editor-draft";

// Helper function to get block definition
function getBlockDefinition(type: BlockType) {
    return blockDefinitions.blocks[
        type as keyof typeof blockDefinitions.blocks
    ];
}

const getInitialPrayer = (): Prayer => {
    try {
        const savedDraft = localStorage.getItem(DRAFT_KEY);
        if (savedDraft) {
            const parsed = JSON.parse(savedDraft);
            // Validate that it has the required structure
            if (
                parsed.schemaVersion &&
                parsed.id &&
                parsed.title &&
                Array.isArray(parsed.blocks)
            ) {
                return parsed;
            }
        }
    } catch (error) {
        console.error("Failed to load draft from localStorage:", error);
    }

    // Return default prayer if no valid draft exists
    return {
        schemaVersion: 1,
        id: "testPrayer",
        title: "Test Prayer",
        blocks: [],
    };
};

export function usePrayerEditor() {
    const [prayer, setPrayer] = useState<Prayer>(getInitialPrayer);

    const [errors, setErrors] = useState<{ index: number; message: string }[]>(
        [],
    );

    const [showBlockMenu, setShowBlockMenu] = useState(false);
    const [selectedBlockIndex, setSelectedBlockIndex] = useState<number | null>(
        null,
    );
    const [selectedNestedIndex, setSelectedNestedIndex] = useState<
        number | null
    >(null);
    const blockRefs = useRef<(HTMLDivElement | null)[]>([]);

    // Validate prayer whenever it changes
    useEffect(() => {
        setErrors(validatePrayer(prayer));
    }, [prayer]);

    // Save draft to localStorage whenever prayer changes
    useEffect(() => {
        try {
            localStorage.setItem(DRAFT_KEY, JSON.stringify(prayer));
        } catch (error) {
            console.error("Failed to save draft to localStorage:", error);
        }
    }, [prayer]);

    function addBlock(type: BlockType) {
        const newBlock: Block = { type };
        const blocks = [...prayer.blocks];

        // If a block is selected, insert after it; otherwise add at the end
        const insertIndex =
            selectedBlockIndex !== null
                ? selectedBlockIndex + 1
                : blocks.length;
        blocks.splice(insertIndex, 0, newBlock);

        setPrayer({
            ...prayer,
            blocks,
        });

        // Update selected index to the newly added block and clear nested selection
        setSelectedBlockIndex(insertIndex);
        setSelectedNestedIndex(null);

        // Scroll to the newly added block after a short delay to ensure it's rendered
        setTimeout(() => {
            blockRefs.current[insertIndex]?.scrollIntoView({
                behavior: "smooth",
                block: "center",
            });
        }, 100);
    }

    function updateBlockContent(index: number, content: string) {
        const blocks = [...prayer.blocks];
        blocks[index] = { ...blocks[index], content };
        setPrayer({ ...prayer, blocks });
    }

    function autoResizeTextarea(textarea: HTMLTextAreaElement | null) {
        if (textarea) {
            textarea.style.height = "auto";
            textarea.style.height = textarea.scrollHeight + "px";
        }
    }

    function deleteBlock(index: number) {
        const blocks = [...prayer.blocks];
        blocks.splice(index, 1);
        setPrayer({ ...prayer, blocks });

        // Update selected index after deletion
        if (selectedBlockIndex === index) {
            setSelectedBlockIndex(null);
            setSelectedNestedIndex(null);
        } else if (selectedBlockIndex !== null && selectedBlockIndex > index) {
            setSelectedBlockIndex(selectedBlockIndex - 1);
        }
    }

    function moveBlockUp(index: number) {
        if (index === 0) return;
        const blocks = [...prayer.blocks];
        [blocks[index - 1], blocks[index]] = [blocks[index], blocks[index - 1]];
        setPrayer({ ...prayer, blocks });

        // Update selected index if the moved block was selected
        if (selectedBlockIndex === index) {
            setSelectedBlockIndex(index - 1);
        } else if (selectedBlockIndex === index - 1) {
            setSelectedBlockIndex(index);
        }
    }

    function moveBlockDown(index: number) {
        if (index === prayer.blocks.length - 1) return;
        const blocks = [...prayer.blocks];
        [blocks[index], blocks[index + 1]] = [blocks[index + 1], blocks[index]];
        setPrayer({ ...prayer, blocks });

        // Update selected index if the moved block was selected
        if (selectedBlockIndex === index) {
            setSelectedBlockIndex(index + 1);
        } else if (selectedBlockIndex === index + 1) {
            setSelectedBlockIndex(index);
        }
    }

    function getErrorsForBlock(index: number) {
        return errors.filter((e) => e.index === index);
    }

    function runValidation() {
        setErrors(validatePrayer(prayer));
    }

    // Nested block functions
    function addNestedBlock(parentIndex: number, type: BlockType) {
        const blocks = [...prayer.blocks];
        const parentBlock = blocks[parentIndex];

        if (!parentBlock.items) {
            parentBlock.items = [];
        }

        const newBlock: Block = { type };
        parentBlock.items.push(newBlock);

        setPrayer({ ...prayer, blocks });
    }

    function updateNestedBlockContent(
        parentIndex: number,
        childIndex: number,
        content: string,
    ) {
        const blocks = [...prayer.blocks];
        const parentBlock = blocks[parentIndex];

        if (parentBlock.items && parentBlock.items[childIndex]) {
            parentBlock.items[childIndex] = {
                ...parentBlock.items[childIndex],
                content,
            };
            setPrayer({ ...prayer, blocks });
        }
    }

    function deleteNestedBlock(parentIndex: number, childIndex: number) {
        const blocks = [...prayer.blocks];
        const parentBlock = blocks[parentIndex];

        if (parentBlock.items) {
            parentBlock.items.splice(childIndex, 1);
            setPrayer({ ...prayer, blocks });
        }
    }

    function moveNestedBlockUp(parentIndex: number, childIndex: number) {
        if (childIndex === 0) return;

        const blocks = [...prayer.blocks];
        const parentBlock = blocks[parentIndex];

        if (parentBlock.items) {
            [parentBlock.items[childIndex - 1], parentBlock.items[childIndex]] =
                [
                    parentBlock.items[childIndex],
                    parentBlock.items[childIndex - 1],
                ];
            setPrayer({ ...prayer, blocks });
        }
    }

    function moveNestedBlockDown(parentIndex: number, childIndex: number) {
        const blocks = [...prayer.blocks];
        const parentBlock = blocks[parentIndex];

        if (!parentBlock.items || childIndex === parentBlock.items.length - 1)
            return;

        [parentBlock.items[childIndex], parentBlock.items[childIndex + 1]] = [
            parentBlock.items[childIndex + 1],
            parentBlock.items[childIndex],
        ];
        setPrayer({ ...prayer, blocks });
    }

    function saveJsonToFile() {
        // Helper function to recursively trim block content
        const trimBlock = (block: Block): Block => {
            const trimmedBlock: Block = {
                ...block,
                content: block.content?.trim(),
            };

            // Recursively trim nested blocks
            if (block.items && block.items.length > 0) {
                trimmedBlock.items = block.items.map(trimBlock);
            }

            return trimmedBlock;
        };

        // Create a cleaned version of the prayer with trimmed block content
        const cleanedPrayer: Prayer = {
            ...prayer,
            blocks: prayer.blocks.map(trimBlock),
        };

        const json = JSON.stringify(cleanedPrayer, null, 2);
        const blob = new Blob([json], { type: "application/json" });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = `${prayer.id}.json`;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(url);
    }

    function loadJsonFromFile() {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "application/json,.json";

        input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const content = event.target?.result as string;
                    const parsed = JSON.parse(content);

                    let prayerToLoad: Prayer;

                    // Check if it's a legacy array-based file
                    if (Array.isArray(parsed)) {
                        // Legacy file format - convert to new format
                        const fileName = file.name.replace(/\.json$/i, "");
                        const firstItem = parsed[0];
                        const remainingItems = parsed.slice(1);

                        // Map legacy type names to new schema
                        const mapLegacyType = (type: string): BlockType => {
                            const typeMap: Record<string, BlockType> = {
                                song: "stanza",
                                subtext: "cue",
                            };
                            return typeMap[type] || (type as BlockType);
                        };

                        prayerToLoad = {
                            schemaVersion: 1,
                            id: fileName,
                            title: firstItem?.content || "Untitled Prayer",
                            blocks: remainingItems.map((item: any) => ({
                                type: mapLegacyType(item.type || "prose"),
                                content: item.content || "",
                                ...(item.items && { items: item.items }),
                            })),
                        };
                    }
                    // Check if it's a valid new format Prayer object
                    else if (
                        parsed.schemaVersion &&
                        parsed.id &&
                        parsed.title &&
                        Array.isArray(parsed.blocks)
                    ) {
                        prayerToLoad = parsed;
                    } else {
                        alert(
                            "Invalid prayer JSON file. Must be either a Prayer object or a legacy array format.",
                        );
                        return;
                    }

                    setPrayer(prayerToLoad);
                } catch (error) {
                    alert(
                        "Failed to parse JSON file. Please ensure it's a valid JSON file.",
                    );
                    console.error("Failed to load JSON file:", error);
                }
            };

            reader.readAsText(file);
        };

        input.click();
    }

    return {
        prayer,
        setPrayer,
        errors,
        showBlockMenu,
        setShowBlockMenu,
        selectedBlockIndex,
        setSelectedBlockIndex,
        selectedNestedIndex,
        setSelectedNestedIndex,
        blockRefs,
        addBlock,
        updateBlockContent,
        autoResizeTextarea,
        deleteBlock,
        moveBlockUp,
        moveBlockDown,
        getErrorsForBlock,
        runValidation,
        saveJsonToFile,
        loadJsonFromFile,
        getBlockDefinition,
        addNestedBlock,
        updateNestedBlockContent,
        deleteNestedBlock,
        moveNestedBlockUp,
        moveNestedBlockDown,
    };
}
