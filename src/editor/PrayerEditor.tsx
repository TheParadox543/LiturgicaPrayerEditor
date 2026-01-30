import { useState } from "react";
import type { Prayer } from "../domain/models/Prayer";
import type { Block } from "../domain/models/Block";
import type { BlockType } from "../domain/models/BlockType";
import { validatePrayer } from "../domain/validation/validatePrayer";

const BLOCK_TYPES: BlockType[] = [
    "heading",
    "subheading",
    "song",
    "prose",
    "rubric",
];

export function PrayerEditor() {
    const [prayer, setPrayer] = useState<Prayer>({
        schemaVersion: 1,
        id: "test-prayer",
        title: "Test Prayer",
        blocks: [],
    });

    const [errors, setErrors] = useState<{ index: number; message: string }[]>(
        [],
    );

    function addBlock(type: BlockType) {
        const newBlock: Block = { type };
        setPrayer({
            ...prayer,
            blocks: [...prayer.blocks, newBlock],
        });
    }

    function updateBlockContent(index: number, content: string) {
        const blocks = [...prayer.blocks];
        blocks[index] = { ...blocks[index], content };
        setPrayer({ ...prayer, blocks });
    }

    function deleteBlock(index: number) {
        const blocks = [...prayer.blocks];
        blocks.splice(index, 1);
        setPrayer({ ...prayer, blocks });
    }

    function moveBlockUp(index: number) {
        if (index === 0) return;
        const blocks = [...prayer.blocks];
        [blocks[index - 1], blocks[index]] = [blocks[index], blocks[index - 1]];
        setPrayer({ ...prayer, blocks });
    }

    function moveBlockDown(index: number) {
        if (index === prayer.blocks.length - 1) return;
        const blocks = [...prayer.blocks];
        [blocks[index], blocks[index + 1]] = [blocks[index + 1], blocks[index]];
        setPrayer({ ...prayer, blocks });
    }

    function runValidation() {
        setErrors(validatePrayer(prayer));
    }

    function saveJsonToFile() {
        const validationErrors = validatePrayer(prayer);
        setErrors(validationErrors);

        if (validationErrors.length > 0) {
            alert("Cannot save JSON: validation errors exist.");
            return;
        }

        const json = JSON.stringify(prayer, null, 2);
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

    return (
        <div style={{ padding: "1rem" }}>
            <h2>Prayer Editor</h2>

            <div style={{ marginBottom: "1rem" }}>
                <strong>Add block:</strong>
                <div>
                    {BLOCK_TYPES.map((type) => (
                        <button
                            key={type}
                            onClick={() => addBlock(type)}
                            style={{ marginRight: "0.5rem" }}
                        >
                            + {type}
                        </button>
                    ))}
                </div>
            </div>

            {prayer.blocks.map((block, index) => (
                <div
                    key={index}
                    style={{
                        border: "1px solid #ccc",
                        padding: "0.5rem",
                        marginBottom: "0.5rem",
                    }}
                >
                    <div>
                        <strong>{block.type.toUpperCase()}</strong>
                    </div>

                    <textarea
                        rows={3}
                        value={block.content ?? ""}
                        onChange={(e) =>
                            updateBlockContent(index, e.target.value)
                        }
                    />

                    <div>
                        <button onClick={() => moveBlockUp(index)}>↑</button>
                        <button onClick={() => moveBlockDown(index)}>↓</button>
                        <button onClick={() => deleteBlock(index)}>
                            Delete
                        </button>
                    </div>
                </div>
            ))}

            <div style={{ marginTop: "1rem" }}>
                <button onClick={runValidation}>Validate</button>
                <button
                    onClick={saveJsonToFile}
                    style={{ marginLeft: "0.5rem" }}
                >
                    Save JSON
                </button>
            </div>

            {errors.length > 0 && (
                <div style={{ color: "red", marginTop: "1rem" }}>
                    <h4>Validation Errors</h4>
                    <ul>
                        {errors.map((e, i) => (
                            <li key={i}>
                                Block {e.index + 1}: {e.message}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
