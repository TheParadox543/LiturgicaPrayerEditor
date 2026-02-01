import type { BlockType } from "../domain/models/BlockType";
import { usePrayerEditor } from "./usePrayerEditor";
import "./PrayerEditor.css";

const BLOCK_TYPES: BlockType[] = [
    "heading",
    "subheading",
    "stanza",
    "prose",
    "rubric",
    "cue",
    "collapsible-block",
];

export function PrayerEditor() {
    const {
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
        loadJsonFromFile,
        getBlockDefinition,
        addNestedBlock,
        updateNestedBlockContent,
        deleteNestedBlock,
        moveNestedBlockUp,
        moveNestedBlockDown,
    } = usePrayerEditor();

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
                    <button
                        onClick={loadJsonFromFile}
                        className="action-button"
                    >
                        Load JSON
                    </button>
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

                    <div className="input-row">
                        <label className="input-label">Title:</label>
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
                    </div>

                    <div className="input-row">
                        <label className="input-label">ID:</label>
                        <input
                            type="text"
                            value={prayer.id}
                            onChange={(e) =>
                                setPrayer({ ...prayer, id: e.target.value })
                            }
                            className="input-field"
                        />
                    </div>
                </div>

                {errors.length > 0 && (
                    <div className="error-container-top">
                        <h4>Validation Errors</h4>
                        <ul>
                            {errors.map((e, i) => (
                                <li
                                    key={i}
                                    onClick={() => {
                                        if (e.index === -1) {
                                            window.scrollTo({
                                                top: 0,
                                                behavior: "smooth",
                                            });
                                        } else {
                                            blockRefs.current[
                                                e.index
                                            ]?.scrollIntoView({
                                                behavior: "smooth",
                                                block: "center",
                                            });
                                            setSelectedBlockIndex(e.index);
                                        }
                                    }}
                                    style={{ cursor: "pointer" }}
                                >
                                    {e.index === -1
                                        ? "Prayer"
                                        : `Block ${e.index + 1}`}
                                    : {e.message}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {prayer.blocks.map((block, index) => {
                    const blockErrors = getErrorsForBlock(index);
                    const isSelected = selectedBlockIndex === index;
                    const blockDef = getBlockDefinition(block.type);
                    const requiresContent = blockDef?.requiresContent !== false;

                    return (
                        <div
                            key={index}
                            ref={(el) => {
                                blockRefs.current[index] = el;
                            }}
                            className={`block-container ${isSelected ? "selected" : ""}`}
                            onClick={() => setSelectedBlockIndex(index)}
                        >
                            <div>
                                <strong>{block.type.toUpperCase()}</strong>
                            </div>

                            {requiresContent ? (
                                <textarea
                                    ref={(el) => autoResizeTextarea(el)}
                                    value={block.content ?? ""}
                                    onChange={(e) => {
                                        updateBlockContent(
                                            index,
                                            e.target.value,
                                        );
                                        autoResizeTextarea(e.target);
                                    }}
                                    onFocus={() => setSelectedBlockIndex(index)}
                                    onInput={(e) =>
                                        autoResizeTextarea(e.currentTarget)
                                    }
                                />
                            ) : (
                                <div className="nested-blocks-container">
                                    {/* Nested blocks */}
                                    {block.items?.map(
                                        (nestedBlock, nestedIndex) => (
                                            <div
                                                key={nestedIndex}
                                                className="nested-block-container"
                                            >
                                                <div>
                                                    <strong>
                                                        {nestedBlock.type.toUpperCase()}
                                                    </strong>
                                                </div>
                                                <textarea
                                                    ref={(el) =>
                                                        autoResizeTextarea(el)
                                                    }
                                                    value={
                                                        nestedBlock.content ??
                                                        ""
                                                    }
                                                    onChange={(e) => {
                                                        updateNestedBlockContent(
                                                            index,
                                                            nestedIndex,
                                                            e.target.value,
                                                        );
                                                        autoResizeTextarea(
                                                            e.target,
                                                        );
                                                    }}
                                                    onInput={(e) =>
                                                        autoResizeTextarea(
                                                            e.currentTarget,
                                                        )
                                                    }
                                                />
                                                <div className="block-actions">
                                                    <button
                                                        className="block-button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            moveNestedBlockUp(
                                                                index,
                                                                nestedIndex,
                                                            );
                                                        }}
                                                    >
                                                        ↑
                                                    </button>
                                                    <button
                                                        className="block-button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            moveNestedBlockDown(
                                                                index,
                                                                nestedIndex,
                                                            );
                                                        }}
                                                    >
                                                        ↓
                                                    </button>
                                                    <button
                                                        className="block-button delete-button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            deleteNestedBlock(
                                                                index,
                                                                nestedIndex,
                                                            );
                                                        }}
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        ),
                                    )}

                                    {/* Add nested block buttons */}
                                    <div className="nested-block-add-buttons">
                                        {(blockDef as any)?.allowedItems?.map(
                                            (allowedType: string) => (
                                                <button
                                                    key={allowedType}
                                                    className="sidebar-button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        addNestedBlock(
                                                            index,
                                                            allowedType as BlockType,
                                                        );
                                                    }}
                                                >
                                                    + {allowedType}
                                                </button>
                                            ),
                                        )}
                                    </div>
                                </div>
                            )}

                            {blockErrors.length > 0 && (
                                <div className="block-error">
                                    {blockErrors.map((e, i) => (
                                        <div key={i}>{e.message}</div>
                                    ))}
                                </div>
                            )}
                            <div className="block-actions">
                                <button
                                    className="block-button"
                                    onClick={() => moveBlockUp(index)}
                                >
                                    ↑
                                </button>
                                <button
                                    className="block-button"
                                    onClick={() => moveBlockDown(index)}
                                >
                                    ↓
                                </button>
                                <button
                                    className="block-button delete-button"
                                    onClick={() => deleteBlock(index)}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Mobile: Floating Action Button */}
            <div className="fab-container">
                <button
                    className="fab"
                    onClick={() => setShowBlockMenu(!showBlockMenu)}
                    aria-label="Add block"
                >
                    +
                </button>

                {showBlockMenu && (
                    <div className="block-menu">
                        {BLOCK_TYPES.map((type) => (
                            <button
                                key={type}
                                onClick={() => {
                                    addBlock(type);
                                    setShowBlockMenu(false);
                                }}
                            >
                                + {type}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Mobile: Bottom Action Bar */}
            <div className="mobile-actions">
                <div className="bottom-action-bar">
                    <button onClick={runValidation}>Validate</button>
                    <button onClick={saveJsonToFile}>Save JSON</button>
                </div>
            </div>
        </div>
    );
}
