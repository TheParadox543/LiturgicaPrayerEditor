import { useNavigate } from "react-router-dom";
import "./HomePage.css";

export function HomePage() {
    const navigate = useNavigate();

    return (
        <div className="home-page">
            <header className="home-header">
                <h1>Liturgica Prayer Editor</h1>
                <p className="subtitle">
                    Malankara Orthodox Prayer Management System
                </p>
            </header>

            <div className="navigation-cards">
                <div className="nav-card" onClick={() => navigate("/editor")}>
                    <div className="card-icon">✏️</div>
                    <h2>Prayer Editor</h2>
                    <p>Create and edit prayer content with structured blocks</p>
                    <div className="card-arrow">→</div>
                </div>

                <div className="nav-card" onClick={() => navigate("/tree")}>
                    <div className="card-icon">🌳</div>
                    <h2>Tree Navigator</h2>
                    <p>
                        Browse the complete prayer structure and navigation tree
                    </p>
                    <div className="card-arrow">→</div>
                </div>
            </div>

            <footer className="home-footer">
                <p>Select an option above to get started</p>
            </footer>
        </div>
    );
}
