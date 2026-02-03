// Test file for tree builder
import {
    loadTreeConfig,
    buildTreeFromConfig,
    expandPattern,
} from "./treeBuilder";
import type { TreeNode } from "./treeBuilder";

async function testTreeBuilder() {
    console.log("Testing Tree Builder...\n");

    // Test 1: Load tree config
    console.log("1. Loading tree config...");
    try {
        const config = await loadTreeConfig("./tree.config.json");
        console.log("✓ Config loaded successfully");
        console.log(`  Root route: ${config.route}`);
        console.log(`  Children count: ${config.children?.length || 0}\n`);

        // Test 2: Build tree from config
        console.log("2. Building tree from config...");
        const tree = buildTreeFromConfig(config);
        console.log("✓ Tree built successfully");
        console.log(`  Root route: ${tree.route}`);
        console.log(`  Children count: ${tree.children.length}`);

        // Display some sample nodes
        console.log("\n3. Sample tree structure:");
        displayTreeSample(tree, 0, 3);

        // Test 3: Test pattern expansion
        console.log("\n4. Testing pattern expansion...");
        const hoursPattern = {
            type: "hours" as const,
            routeFormat: "test_{item}",
            exclude: ["none"],
        };
        const expandedHours = expandPattern(hoursPattern, "parent");
        console.log(`✓ Hours pattern expanded: ${expandedHours.length} items`);
        console.log(
            `  Sample routes: ${expandedHours
                .slice(0, 3)
                .map((c) => c.route)
                .join(", ")}`,
        );

        const listPattern = {
            type: "list" as const,
            items: ["item1", "item2", "item3"],
            routeFormat: "custom_{item}",
        };
        const expandedList = expandPattern(listPattern, "parent");
        console.log(`✓ List pattern expanded: ${expandedList.length} items`);
        console.log(`  Routes: ${expandedList.map((c) => c.route).join(", ")}`);

        console.log("\n✓ All tests passed!");
    } catch (error) {
        console.error("✗ Test failed:", error);
    }
}

function displayTreeSample(node: TreeNode, depth: number, maxDepth: number) {
    if (depth > maxDepth) return;

    const indent = "  ".repeat(depth);
    const nodeInfo = node.filename
        ? `${node.route} → ${node.filename}`
        : `${node.route} (container)`;
    console.log(`${indent}${nodeInfo}`);

    // Show first 3 children
    const childrenToShow = node.children.slice(0, 3);
    childrenToShow.forEach((child) =>
        displayTreeSample(child, depth + 1, maxDepth),
    );

    if (node.children.length > 3) {
        console.log(`${indent}  ... and ${node.children.length - 3} more`);
    }
}

// Run tests
testTreeBuilder();
