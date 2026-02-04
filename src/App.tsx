import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PrayerEditor } from "./editor/PrayerEditor";
import { HomePage } from "./pages/HomePage";
import { TreeNavigator } from "./pages/TreeNavigator";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/editor" element={<PrayerEditor />} />
                <Route path="/tree" element={<TreeNavigator />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
