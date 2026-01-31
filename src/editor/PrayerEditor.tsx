import { useState, useEffect } from "react";
import type { Prayer } from "../domain/models/Prayer";
import type { Block } from "../domain/models/Block";
import type { BlockType } from "../domain/models/BlockType";
import { validatePrayer } from "../domain/validation/validatePrayer";
import "./PrayerEditor.css";

const BLOCK_TYPES: BlockType[] = [
    "heading",
    "subheading",
    "stanza",
    "prose",
    "rubric",
    "cue",
];

export function PrayerEditor() {
    const [prayer, setPrayer] = useState<Prayer>({
        schemaVersion: 1,
        id: "testPrayer",
        title: "Test Prayer",
        blocks: [],
    });

    const [errors, setErrors] = useState<{ index: number; message: string }[]>(
        [],
    );
    useEffect(() => {
        setErrors(validatePrayer(prayer));
    }, [prayer]);

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

    function getErrorsForBlock(index: number) {
        return errors.filter((e) => e.index === index);
    }

    function runValidation() {
        setErrors(validatePrayer(prayer));
    }

    function saveJsonToFile() {
        // const validationErrors = validatePrayer(prayer);
        // setErrors(validationErrors);

        // if (validationErrors.length > 0) {
        //     alert("Cannot save JSON: validation errors exist.");
        //     return;
        // }

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

    const globalErrors = errors.filter((e) => e.index === -1);
    return (
        <div className="prayer-editor-container">
            {/* Left Sidebar - Fixed position */}
            <div className="sidebar">
                <div>
                    <h3>Add Block</h3>
                    <div className="sidebar-buttons-container">
                        {BLOCK_TYPES.map((type) => (
                            <button
                                key={type}
                                onClick={() => addBlock(type)}
                                className="sidebar-button"
                            >
                                + {type}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Spacer to push buttons to bottom */}
                <div className="sidebar-spacer" />

                {/* Action buttons at bottom */}
                <div className="sidebar-actions">
                    <button onClick={runValidation} className="action-button">
                        Validate
                    </button>
                    <button onClick={saveJsonToFile} className="action-button">
                        Save JSON
                    </button>
                </div>
            </div>

            {/* Right Content Area - Uses main scroll */}
            <div className="content-area">
                <h2>Prayer Editor</h2>

                <div className="prayer-details">
                    <h3>Prayer Details</h3>

                    <div className="input-group">
                        <label>
                            Title:
                            {/* <br /> */}
                            <input
                                type="text"
                                value={prayer.title}
                                onChange={(e) =>
                                    setPrayer({
                                        ...prayer,
                                        title: e.target.value,
                                    })
                                }
                                className="input-field"
                            />
                        </label>
                    </div>

                    <div>
                        <label>
                            ID:
                            {/* <br /> */}
                            <input
                                type="text"
                                value={prayer.id}
                                onChange={(e) =>
                                    setPrayer({ ...prayer, id: e.target.value })
                                }
                                className="input-field"
                            />
                        </label>
                    </div>
                </div>

                {globalErrors.length > 0 && (
                    <div className="error-container">
                        {globalErrors.map((e, i) => (
                            <div key={i}>{e.message}</div>
                        ))}
                    </div>
                )}

                {prayer.blocks.map((block, index) => {
                    const blockErrors = getErrorsForBlock(index);
                    return (
                        <div key={index} className="block-container">
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
                            {blockErrors.length > 0 && (
                                <div className="block-error">
                                    {blockErrors.map((e, i) => (
                                        <div key={i}>{e.message}</div>
                                    ))}
                                </div>
                            )}
                            <div>
                                <button onClick={() => moveBlockUp(index)}>
                                    ↑
                                </button>
                                <button onClick={() => moveBlockDown(index)}>
                                    ↓
                                </button>
                                <button onClick={() => deleteBlock(index)}>
                                    Delete
                                </button>
                            </div>
                        </div>
                    );
                })}

                {errors.length > 0 && (
                    <div className="error-container-top">
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
        </div>
    );
}
