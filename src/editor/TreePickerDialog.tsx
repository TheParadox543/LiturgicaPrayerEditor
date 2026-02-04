import { useState, useEffect } from "react";
import type { JSX } from "react";
import { buildTreeFromConfig } from "../tree/treeBuilder";
import type { TreeNode } from "../tree/treeBuilder";
import treeConfig from "../tree/tree.config.json";
import "./TreePickerDialog.css";

interface TreePickerDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectRoute: (route: string, filename: string) => void;
}

export function TreePickerDialog({
    isOpen,
    onClose,
    onSelectRoute,
}: TreePickerDialogProps) {
    const [tree, setTree] = useState<TreeNode | null>(null);
    const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

    useEffect(() => {
        // Build tree from config
        const builtTree = buildTreeFromConfig(treeConfig as any);
        setTree(builtTree);
    }, []);

    const toggleNode = (route: string) => {
        setExpandedNodes((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(route)) {
                newSet.delete(route);
            } else {
                newSet.add(route);
            }
            return newSet;
        });
    };

    const handleSelectNode = (node: TreeNode) => {
        // Only allow selection of file nodes (leaf nodes)
        if (node.filename) {
            onSelectRoute(node.route, node.filename);
            onClose();
        }
    };

    const renderNode = (node: TreeNode, depth: number = 0): JSX.Element => {
        const hasChildren = node.children && node.children.length > 0;
        const isExpanded = expandedNodes.has(node.route);
        const isFileNode = node.filename !== null;

        return (
            <div key={node.route} className="tree-picker-node">
                <div
                    className={`tree-picker-node-content ${isFileNode ? "file-node" : "container-node"}`}
                    style={{ paddingLeft: `${depth * 20}px` }}
                >
                    {hasChildren && (
                        <button
                            className="tree-picker-expand-button"
                            onClick={() => toggleNode(node.route)}
                        >
                            {isExpanded ? "▼" : "▶"}
                        </button>
                    )}
                    {!hasChildren && <span className="tree-picker-spacer" />}

                    <button
                        className={`tree-picker-node-button ${isFileNode ? "selectable" : "non-selectable"}`}
                        onClick={() => handleSelectNode(node)}
                        disabled={!isFileNode}
                    >
                        <span className="tree-picker-icon">
                            {hasChildren ? "📁" : "📄"}
                        </span>
                        <span className="tree-picker-label">{node.route}</span>
                    </button>
                </div>

                {hasChildren && isExpanded && (
                    <div className="tree-picker-children">
                        {node.children.map((child) =>
                            renderNode(child, depth + 1),
                        )}
                    </div>
                )}
            </div>
        );
    };

    if (!isOpen) return null;

    return (
        <div className="tree-picker-overlay" onClick={onClose}>
            <div
                className="tree-picker-dialog"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="tree-picker-header">
                    <h3>Select Prayer</h3>
                    <button className="tree-picker-close" onClick={onClose}>
                        ✕
                    </button>
                </div>
                <div className="tree-picker-content">
                    {tree && renderNode(tree)}
                </div>
            </div>
        </div>
    );
}
