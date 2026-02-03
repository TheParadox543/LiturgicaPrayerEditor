# TreeBuilder Output Structure

## What `buildTreeFromConfig` Returns

The `buildTreeFromConfig` function takes your `tree.config.json` and returns a `TreeNode` object with this structure:

```typescript
interface TreeNode {
    route: string; // The route identifier
    parent: string | null; // Parent route (null for root)
    filename: string | null; // File path (null for containers)
    lastModified: number | null; // Timestamp (always null in core builder)
    minVersionCode: number; // Minimum version (always 34)
    children: TreeNode[]; // Array of child nodes
}
```

## Example Output

Given this simple config:

```json
{
    "route": "malankara",
    "children": [
        {
            "route": "commonPrayers",
            "children": [{ "route": "lords" }, { "route": "mary" }]
        },
        {
            "route": "dailyPrayers",
            "children": [
                {
                    "route": "sleeba",
                    "pattern": {
                        "type": "hours",
                        "exclude": ["none"],
                        "routeFormat": "sleeba_{item}"
                    }
                }
            ]
        }
    ]
}
```

The output would be:

```json
{
    "route": "malankara",
    "parent": null,
    "filename": null,
    "lastModified": null,
    "minVersionCode": 34,
    "children": [
        {
            "route": "commonPrayers",
            "parent": "malankara",
            "filename": null,
            "lastModified": null,
            "minVersionCode": 34,
            "children": [
                {
                    "route": "lords",
                    "parent": "commonPrayers",
                    "filename": "commonPrayers/lords.json",
                    "lastModified": null,
                    "minVersionCode": 34,
                    "children": []
                },
                {
                    "route": "mary",
                    "parent": "commonPrayers",
                    "filename": "commonPrayers/mary.json",
                    "lastModified": null,
                    "minVersionCode": 34,
                    "children": []
                }
            ]
        },
        {
            "route": "dailyPrayers",
            "parent": "malankara",
            "filename": null,
            "lastModified": null,
            "minVersionCode": 34,
            "children": [
                {
                    "route": "sleeba",
                    "parent": "dailyPrayers",
                    "filename": null,
                    "lastModified": null,
                    "minVersionCode": 34,
                    "children": [
                        {
                            "route": "sleeba_vespers",
                            "parent": "sleeba",
                            "filename": "dailyPrayers/sleeba/vespers.json",
                            "lastModified": null,
                            "minVersionCode": 34,
                            "children": []
                        },
                        {
                            "route": "sleeba_compline",
                            "parent": "sleeba",
                            "filename": "dailyPrayers/sleeba/compline.json",
                            "lastModified": null,
                            "minVersionCode": 34,
                            "children": []
                        },
                        {
                            "route": "sleeba_matins",
                            "parent": "sleeba",
                            "filename": "dailyPrayers/sleeba/matins.json",
                            "lastModified": null,
                            "minVersionCode": 34,
                            "children": []
                        },
                        {
                            "route": "sleeba_prime",
                            "parent": "sleeba",
                            "filename": "dailyPrayers/sleeba/prime.json",
                            "lastModified": null,
                            "minVersionCode": 34,
                            "children": []
                        },
                        {
                            "route": "sleeba_terce",
                            "parent": "sleeba",
                            "filename": "dailyPrayers/sleeba/terce.json",
                            "lastModified": null,
                            "minVersionCode": 34,
                            "children": []
                        },
                        {
                            "route": "sleeba_sext",
                            "parent": "sleeba",
                            "filename": "dailyPrayers/sleeba/sext.json",
                            "lastModified": null,
                            "minVersionCode": 34,
                            "children": []
                        }
                    ]
                }
            ]
        }
    ]
}
```

## Key Behaviors

### 1. Pattern Expansion

The `sleeba` node with pattern `type: "hours"` expands into 6 children (excluding "none"):

- `sleeba_vespers`, `sleeba_compline`, `sleeba_matins`, `sleeba_prime`, `sleeba_terce`, `sleeba_sext`

### 2. Filename Generation

Leaf nodes (nodes without children) get filenames built from their ancestor path:

- `lords` → `commonPrayers/lords.json`
- `sleeba_vespers` → `dailyPrayers/sleeba/vespers.json` (prefix removed)

### 3. Prefix Cleaning

Route prefixes are removed from filenames:

- Route: `sleeba_vespers` → Filename part: `vespers` (not `sleeba_vespers`)

### 4. Container vs File Nodes

- **Container nodes**: Have children, `filename` is `null`
- **File nodes**: No children, `filename` is generated from path

### 5. Special Cases

#### qurbanaSongs Nesting

```json
{
    "route": "qurbanaSongs_yeldho"
}
```

Generates:

```json
{
    "route": "qurbanaSongs_yeldho",
    "filename": "qurbana/qurbanaSongs/yeldho/yeldhoSongs.json"
}
```

#### File Extension Inheritance

```json
{
    "route": "ekkaraSongs",
    "fileExtension": ".mp3",
    "children": [...]
}
```

All descendants inherit `.mp3` extension instead of `.json`.

## For Your Full Config

With your complete `tree.config.json` (611 lines), the output would be:

- **Root node**: `malankara` (container)
- **~8 top-level sections**: commonPrayers, dailyPrayers, sacraments, feasts, lent, contextual, specialPrayers, ekkaraSongs
- **Hundreds of leaf nodes**: Each with a generated filename path
- **Pattern-expanded nodes**: All hours/days/list patterns expanded into individual routes

The tree structure mirrors your config but with:
✅ All patterns expanded into actual nodes
✅ Filenames generated for all leaf nodes
✅ Parent-child relationships established
✅ File extensions inherited where specified
