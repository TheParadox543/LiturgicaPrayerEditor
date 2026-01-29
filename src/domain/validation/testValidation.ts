import { validatePrayer } from "./validatePrayer";
import { Prayer } from "../models/Prayer";

const prayer: Prayer = {
    schemaVersion: 1,
    id: "test",
    title: "Test Prayer",
    blocks: [{ type: "song", content: "" }],
};

console.log(validatePrayer(prayer));
