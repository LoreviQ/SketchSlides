export function Hero() {
    return (
        <div className="relative aspect-[3/1] max-h-48 overflow-hidden">
            <div className="absolute inset-0 flex items-start">
                <img src="/icons/framerate.png" alt="FrameRate Logo" className="w-full object-cover opacity-50" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-b from-custom-dark from-0% via-transparent to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-l from-custom-dark from-0% via-transparent to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-custom-dark from-0% via-transparent to-transparent" />
            <div className="absolute inset-0 flex items-center justify-center">
                <h1 className="pt-12 text-5xl sm:text-7xl font-bold text-center dark:text-white z-10 font-kalam text-stroke-1 text-stroke-black">
                    FrameRate
                </h1>
            </div>
        </div>
    );
}
