import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { buildTreeFromConfig, type TreeNode } from "../tree/treeBuilder";
import treeConfig from "../tree/tree.config.json";
import "./TreeNavigator.css";

export function TreeNavigator() {
    const navigate = useNavigate();
    const [tree, setTree] = useState<TreeNode | null>(null);
    const [expandedNodes, setExpandedNodes] = useState<Set<string>>(
        new Set(["malankara"]),
    );
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedFileNode, setSelectedFileNode] = useState<string | null>(
        null,
    );

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

    const handleCreateFile = (
        node: TreeNode,
        language: "en" | "ml" | "mn" | "indic",
    ) => {
        // Clear local storage
        localStorage.clear();

        // Navigate to prayer editor with route state
        console.log(`Creating file for ${node.route} in language: ${language}`);
        console.log(`Filename: ${node.filename}`);
        navigate("/editor", {
            state: {
                route: node.route,
                filename: node.filename,
                language,
            },
        });
    };

    const expandAll = () => {
        if (!tree) return;
        const allRoutes = new Set<string>();
        const collectRoutes = (node: TreeNode) => {
            allRoutes.add(node.route);
            node.children.forEach(collectRoutes);
        };
        collectRoutes(tree);
        setExpandedNodes(allRoutes);
    };

    const collapseAll = () => {
        setExpandedNodes(new Set(["malankara"]));
    };

    const matchesSearch = (node: TreeNode, query: string): boolean => {
        if (!query) return true;
        const lowerQuery = query.toLowerCase();
        return (
            node.route.toLowerCase().includes(lowerQuery) ||
            (node.filename?.toLowerCase().includes(lowerQuery) ?? false)
        );
    };

    const renderTreeNode = (node: TreeNode, depth: number = 0) => {
        const isExpanded = expandedNodes.has(node.route);
        const hasChildren = node.children.length > 0;
        const isContainer = node.filename === null;
        const matches = matchesSearch(node, searchQuery);
        const isSelected = selectedFileNode === node.route;

        // Filter children based on search
        const visibleChildren = searchQuery
            ? node.children.filter((child) => matchesSearch(child, searchQuery))
            : node.children;

        if (!matches && visibleChildren.length === 0 && searchQuery) {
            return null;
        }

        return (
            <div key={node.route} className="tree-node-container">
                <div
                    className={`tree-node ${isContainer ? "container" : "file"} ${isSelected ? "selected" : ""}`}
                    style={{ paddingLeft: `${depth * 1.5}rem` }}
                    onClick={() => {
                        if (hasChildren) {
                            toggleNode(node.route);
                        } else {
                            setSelectedFileNode(isSelected ? null : node.route);
                        }
                    }}
                >
                    {hasChildren && (
                        <span
                            className={`expand-icon ${isExpanded ? "expanded" : ""}`}
                        >
                            ▶
                        </span>
                    )}
                    {!hasChildren && (
                        <span className="expand-icon-spacer"></span>
                    )}

                    <span className="node-icon">
                        {isContainer ? "📁" : "📄"}
                    </span>

                    <div className="node-content">
                        <span className="node-route">{node.route}</span>
                        {node.filename && (
                            <span className="node-filename">
                                {node.filename}
                            </span>
                        )}
                    </div>

                    {hasChildren && (
                        <span className="node-count">
                            {node.children.length}
                        </span>
                    )}
                </div>

                {/* Language selection for file nodes */}
                {!isContainer && isSelected && (
                    <div
                        className="language-selector"
                        style={{ paddingLeft: `${(depth + 1) * 1.5}rem` }}
                    >
                        <span className="language-label">Create file in:</span>
                        <div className="language-buttons">
                            <button
                                className="language-btn"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleCreateFile(node, "en");
                                }}
                            >
                                🇬🇧 English
                            </button>
                            <button
                                className="language-btn"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleCreateFile(node, "ml");
                                }}
                            >
                                🇮🇳 Malayalam
                            </button>
                            <button
                                className="language-btn"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleCreateFile(node, "mn");
                                }}
                            >
                                📝 Manglish
                            </button>
                            <button
                                className="language-btn"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleCreateFile(node, "indic");
                                }}
                            >
                                🔤 Indic
                            </button>
                        </div>
                    </div>
                )}

                {hasChildren && isExpanded && (
                    <div className="tree-children">
                        {visibleChildren.map((child) =>
                            renderTreeNode(child, depth + 1),
                        )}
                    </div>
                )}
            </div>
        );
    };

    if (!tree) {
        return (
            <div className="tree-navigator loading">
                <p>Loading tree...</p>
            </div>
        );
    }

    return (
        <div className="tree-navigator">
            <header className="tree-header">
                <button className="back-button" onClick={() => navigate("/")}>
                    ← Back to Home
                </button>
                <h1>Prayer Tree Navigator</h1>
                <p className="tree-subtitle">
                    Browse the complete prayer structure
                </p>
            </header>

            <div className="tree-controls">
                <div className="search-box">
                    <input
                        type="text"
                        placeholder="Search routes or filenames..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="search-input"
                    />
                    {searchQuery && (
                        <button
                            className="clear-search"
                            onClick={() => setSearchQuery("")}
                        >
                            ✕
                        </button>
                    )}
                </div>

                <div className="action-buttons">
                    <button onClick={expandAll} className="control-button">
                        Expand All
                    </button>
                    <button onClick={collapseAll} className="control-button">
                        Collapse All
                    </button>
                </div>
            </div>

            <div className="tree-stats">
                <span>Root: {tree.route}</span>
                <span>•</span>
                <span>Children: {tree.children.length}</span>
            </div>

            <div className="tree-content">{renderTreeNode(tree)}</div>
        </div>
    );
}
