// Tree Builder Module
// Ported from generate_tree.py - Core tree configuration loading and building functions

// ============================================================================
// Type Definitions
// ============================================================================

export interface PatternConfig {
    type: "list" | "hours" | "days";
    items?: string[];
    exclude?: string[];
    routeFormat?: string;
}

export interface TreeNodeConfig {
    route: string;
    children?: TreeNodeConfig[];
    pattern?: PatternConfig;
    alwaysInclude?: boolean;
    fileExtension?: string;
    editorOnly?: boolean;
}

export interface TreeNode {
    route: string;
    parent: string | null;
    filename: string | null;
    lastModified: number | null;
    minVersionCode: number;
    children: TreeNode[];
    editorOnly: boolean;
}

// ============================================================================
// Constants
// ============================================================================

export const HOURS = [
    "vespers",
    "compline",
    "matins",
    "prime",
    "terce",
    "sext",
    "none",
] as const;

export const DAYS = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
] as const;

// ============================================================================
// Core Functions
// ============================================================================

/**
 * Load tree structure from JSON config file.
 * @param configPath - Path to the tree configuration JSON file
 * @returns Promise resolving to the tree configuration object
 * @throws Error if file not found or invalid JSON
 */
export async function loadTreeConfig(
    configPath: string,
): Promise<TreeNodeConfig> {
    try {
        const response = await fetch(configPath);
        if (!response.ok) {
            throw new Error(`Tree config file not found: ${configPath}`);
        }
        const config = await response.json();
        return config as TreeNodeConfig;
    } catch (error) {
        if (error instanceof SyntaxError) {
            throw new Error(`Invalid JSON in tree config: ${error.message}`);
        }
        throw error;
    }
}

/**
 * Generate child nodes from pattern configuration.
 * @param patternConfig - Pattern configuration object
 * @returns Array of child node configurations
 */
export function expandPattern(patternConfig: PatternConfig): TreeNodeConfig[] {
    const patternType = patternConfig.type;
    const routeFormat = patternConfig.routeFormat || "{item}";
    const exclude = patternConfig.exclude || [];

    // Determine items based on pattern type
    let items: readonly string[];
    if (patternType === "hours") {
        items = HOURS.filter((h) => !exclude.includes(h));
    } else if (patternType === "days") {
        items = DAYS.filter((d) => !exclude.includes(d));
    } else if (patternType === "list") {
        items = patternConfig.items || [];
    } else {
        throw new Error(`Unknown pattern type: ${patternType}`);
    }

    // Generate child nodes
    const children: TreeNodeConfig[] = items.map((item) => ({
        route: routeFormat.replace("{item}", item),
    }));

    return children;
}

/**
 * Recursively build TreeNode structure from config.
 * @param config - Node configuration object
 * @param parentRoute - Parent node's route (null for root)
 * @param ancestors - List of ancestor routes for path building
 * @returns TreeNode instance
 */
export function buildTreeFromConfig(
    config: TreeNodeConfig,
    parentRoute: string | null = null,
    ancestors: string[] = [],
    parentEditorOnly: boolean = false,
): TreeNode {
    const route = config.route;
    const fileExtension = config.fileExtension || ".json";
    // Inherit editorOnly from parent if not explicitly set
    const editorOnly =
        config.editorOnly !== undefined ? config.editorOnly : parentEditorOnly;

    // Check if node has pattern to expand
    let processedConfig = config;
    if (config.pattern) {
        const patternChildren = expandPattern(config.pattern);
        const existingChildren = config.children || [];

        // Inherit fileExtension to pattern children if specified
        if (fileExtension !== ".json") {
            patternChildren.forEach((child) => {
                child.fileExtension = fileExtension;
            });
        }

        processedConfig = {
            ...config,
            children: [...existingChildren, ...patternChildren],
        };
    }

    // Determine if this is a container or file node
    const hasChildren =
        processedConfig.children && processedConfig.children.length > 0;

    if (hasChildren) {
        // Container node - no filename
        const childrenNodes: TreeNode[] = [];

        for (const childConfig of processedConfig.children!) {
            // Inherit fileExtension to all children if not already set
            let childConfigWithExtension = childConfig;
            if (fileExtension !== ".json" && !childConfig.fileExtension) {
                childConfigWithExtension = { ...childConfig, fileExtension };
            }

            const childNode = buildTreeFromConfig(
                childConfigWithExtension,
                route,
                route !== "malankara" ? [...ancestors, route] : [],
                editorOnly, // Pass editorOnly to children
            );
            childrenNodes.push(childNode);
        }

        return {
            route,
            parent: parentRoute,
            filename: null,
            lastModified: null,
            minVersionCode: 34,
            children: childrenNodes,
            editorOnly,
        };
    } else {
        // File node - derive filename from ancestors
        // Build path from ancestors + current route
        const pathParts =
            route !== "malankara" ? [...ancestors, route] : [route];

        // Remove route prefixes for cleaner paths (e.g., "qurbana_preparation" -> "preparation")
        const cleanParts: string[] = [];
        for (let i = 0; i < pathParts.length; i++) {
            const part = pathParts[i];
            // Check if this part starts with parent prefix
            if (i > 0 && part.includes("_")) {
                const prefix = pathParts[i - 1] + "_";
                if (part.startsWith(prefix)) {
                    cleanParts.push(part.slice(prefix.length));
                } else {
                    cleanParts.push(part);
                }
            } else {
                cleanParts.push(part);
            }
        }

        // Special handling for qurbanaSongs: nest in folder with {feastName}Songs.json
        if (route.includes("qurbanaSongs_")) {
            // Extract feast name (e.g., "qurbanaSongs_yeldho" -> "yeldho")
            const feastName = route.split("qurbanaSongs_")[1];
            // Replace last part with nested structure: feastName/feastNameSongs.json
            cleanParts[cleanParts.length - 1] =
                `${feastName}/${feastName}Songs`;
        }

        const filename = cleanParts.join("/") + fileExtension;

        return {
            route,
            parent: parentRoute,
            filename,
            lastModified: null,
            minVersionCode: 34,
            children: [],
            editorOnly,
        };
    }
}
