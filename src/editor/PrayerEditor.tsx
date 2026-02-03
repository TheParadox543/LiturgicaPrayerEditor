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
        selectedNestedIndex,
        setSelectedNestedIndex,
        blockRefs,
        nestedBlockRefs,
        addBlock,
        updateBlockContent,
        autoResizeTextarea,
        deleteBlock,
        moveBlockUp,
        moveBlockDown,
        getErrorsForBlock,
        getErrorsForNestedBlock,
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

    // Determine which block types to show based on selection
    const getAvailableBlockTypes = (): BlockType[] => {
        // Only show nested block types if a nested item is actually selected
        if (selectedNestedIndex !== null && selectedBlockIndex !== null) {
            const parentBlock = prayer.blocks[selectedBlockIndex];
            const parentDef = getBlockDefinition(parentBlock.type);
            return ((parentDef as any)?.allowedItems ||
                BLOCK_TYPES) as BlockType[];
        }
        // Otherwise show all block types (for adding to main stack)
        return BLOCK_TYPES;
    };

    const availableBlockTypes = getAvailableBlockTypes();
    const isAddingToNested = selectedNestedIndex !== null;

    const handleAddBlock = (type: BlockType) => {
        if (isAddingToNested && selectedBlockIndex !== null) {
            addNestedBlock(selectedBlockIndex, type);
        } else {
            addBlock(type);
        }
    };

    // Handler for inline add in empty collapsible blocks
    const handleInlineAddNested = (parentIndex: number, type: BlockType) => {
        addNestedBlock(parentIndex, type);
    };

    return (
        <div className="prayer-editor-container">
            {/* Left Sidebar - Fixed position */}
            <div className="sidebar">
                <div>
                    <h3>Add Block</h3>
                    {isAddingToNested && selectedBlockIndex !== null && (
                        <p
                            style={{
                                fontSize: "0.85rem",
                                opacity: 0.7,
                                marginTop: "0.25rem",
                                marginBottom: "0.5rem",
                            }}
                        >
                            Adding to Block {selectedBlockIndex + 1}
                        </p>
                    )}
                    <div className="sidebar-buttons-container">
                        {availableBlockTypes.map((type) => (
                            <button
                                key={type}
                                onClick={() => handleAddBlock(type)}
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
                                        } else if (
                                            e.nestedIndex !== undefined
                                        ) {
                                            // Navigate to nested block
                                            blockRefs.current[
                                                e.index
                                            ]?.scrollIntoView({
                                                behavior: "smooth",
                                                block: "center",
                                            });
                                            setSelectedBlockIndex(e.index);
                                            setSelectedNestedIndex(
                                                e.nestedIndex,
                                            );
                                        } else {
                                            // Navigate to parent block
                                            blockRefs.current[
                                                e.index
                                            ]?.scrollIntoView({
                                                behavior: "smooth",
                                                block: "center",
                                            });
                                            setSelectedBlockIndex(e.index);
                                            setSelectedNestedIndex(null);
                                        }
                                    }}
                                    style={{ cursor: "pointer" }}
                                >
                                    {e.index === -1
                                        ? "Prayer"
                                        : e.nestedIndex !== undefined
                                          ? `Block ${e.index + 1} > Item ${e.nestedIndex + 1}`
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
                            onClick={() => {
                                setSelectedBlockIndex(index);
                                setSelectedNestedIndex(null);
                            }}
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
                                    {/* Show inline add UI if empty */}
                                    {(!block.items ||
                                        block.items.length === 0) && (
                                        <div className="nested-block-add-container">
                                            <p
                                                style={{
                                                    fontSize: "0.9rem",
                                                    opacity: 0.7,
                                                    marginBottom: "0.75rem",
                                                }}
                                            >
                                                Add items to this container:
                                            </p>
                                            <div className="nested-block-add-buttons">
                                                {(
                                                    blockDef as any
                                                )?.allowedItems?.map(
                                                    (allowedType: string) => (
                                                        <button
                                                            key={allowedType}
                                                            className="sidebar-button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleInlineAddNested(
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

                                    {/* Nested blocks */}
                                    {block.items?.map(
                                        (nestedBlock, nestedIndex) => (
                                            <div
                                                key={nestedIndex}
                                                ref={(el) => {
                                                    const key = `${index}-${nestedIndex}`;
                                                    if (el) {
                                                        nestedBlockRefs.current.set(
                                                            key,
                                                            el,
                                                        );
                                                    } else {
                                                        nestedBlockRefs.current.delete(
                                                            key,
                                                        );
                                                    }
                                                }}
                                                className={`nested-block-container ${
                                                    selectedBlockIndex ===
                                                        index &&
                                                    selectedNestedIndex ===
                                                        nestedIndex
                                                        ? "selected"
                                                        : ""
                                                }`}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedBlockIndex(
                                                        index,
                                                    );
                                                    setSelectedNestedIndex(
                                                        nestedIndex,
                                                    );
                                                }}
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
                                                {getErrorsForNestedBlock(
                                                    index,
                                                    nestedIndex,
                                                ).length > 0 && (
                                                    <div className="block-error">
                                                        {getErrorsForNestedBlock(
                                                            index,
                                                            nestedIndex,
                                                        ).map((e, i) => (
                                                            <div key={i}>
                                                                {e.message}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
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
