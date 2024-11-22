export function GridIcon({ className = "", ...props }) {
    const [p1, p2, p3, p4] = [3, 9, 15, 21];
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className={className} {...props}>
            {/* Vertical lines */}
            <line x1={`${p1}`} y1="2" x2={`${p1}`} y2="22" />
            <line x1={`${p2}`} y1="2" x2={`${p2}`} y2="22" />
            <line x1={`${p3}`} y1="2" x2={`${p3}`} y2="22" />
            <line x1={`${p4}`} y1="2" x2={`${p4}`} y2="22" />

            {/* Horizontal lines */}
            <line x1="2" y1={`${p1}`} x2="22" y2={`${p1}`} />
            <line x1="2" y1={`${p2}`} x2="22" y2={`${p2}`} />
            <line x1="2" y1={`${p3}`} x2="22" y2={`${p3}`} />
            <line x1="2" y1={`${p4}`} x2="22" y2={`${p4}`} />
        </svg>
    );
}
