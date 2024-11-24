import { AppProvider } from "./contexts/AppContext";
import Settings from "./pages/Settings";
import Slideshow from "./pages/Slideshow";
import { useApp } from "./contexts/AppContext";

function AppContent() {
    const { runApp, selectedFolder } = useApp();

    if (runApp && selectedFolder) {
        return <Slideshow />;
    }
    return <Settings />;
}

export default function App() {
    return (
        <AppProvider>
            <div className="bg-custom-dark">
                <AppContent />
            </div>
        </AppProvider>
    );
}
