export function ProgressBar({ fraction }: { fraction: number }) {
    return (
        <div className="absolute bottom-0 w-full h-2 bg-blue-950/50">
            <div
                className={`h-full bg-blue-700 ${fraction > 0 ? "transition-all duration-100" : ""}`}
                style={{ width: `${fraction * 100}%` }}
            />
        </div>
    );
}
