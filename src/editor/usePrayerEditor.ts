import { useState, useEffect, useRef } from "react";
import type { Prayer } from "../domain/models/Prayer";
import type { Block } from "../domain/models/Block";
import type { BlockType } from "../domain/models/BlockType";
import { validatePrayer } from "../domain/validation/validatePrayer";

const DRAFT_KEY = "liturgica-prayer-editor-draft";

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

        // Update selected index to the newly added block
        setSelectedBlockIndex(insertIndex);

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

    function saveJsonToFile() {
        // Create a cleaned version of the prayer with trimmed block content
        const cleanedPrayer: Prayer = {
            ...prayer,
            blocks: prayer.blocks.map((block) => ({
                ...block,
                content: block.content?.trim(),
            })),
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

    return {
        prayer,
        setPrayer,
        errors,
        showBlockMenu,
        setShowBlockMenu,
        selectedBlockIndex,
        setSelectedBlockIndex,
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
    };
}
