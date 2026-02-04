import { validatePrayer } from "./validatePrayer";
import type { Prayer } from "../models/Prayer";

const prayer: Prayer = {
    schemaVersion: 1,
    id: "test",
    title: "Test Prayer",
    blocks: [{ type: "stanza", content: "" }],
};

console.log(validatePrayer(prayer));
