export function ProgressBar({ currentTicks, totalTicks }: { currentTicks: number; totalTicks: number }) {
    return (
        <div className="absolute bottom-0 w-full h-2 bg-blue-950/50">
            <div
                className="h-full bg-blue-700"
                style={{
                    width: `${(currentTicks / totalTicks) * 100}%`, // Start from 0%
                }}
            />
        </div>
    );
}

export function ImageGrid({}) {
    return (
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
            <div className="w-full h-full grid grid-cols-3 grid-rows-3">
                {[...Array(9)].map((_, i) => (
                    <div key={i} className="border border-white/60" />
                ))}
            </div>
        </div>
    );
}
