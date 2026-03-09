import { FaNewspaper } from "react-icons/fa6";

export default function SplashScreen() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4">
            <div className="bg-[#102336] rounded-md shadow-md w-16 h-16 md:w-20 md:h-20 flex items-center justify-center">
                <FaNewspaper className="text-[#01a09d] h-10 w-10" />
            </div>

            <h1 className="text-3xl md:text-4xl font-semibold tracking-wide text-slate-200">
                Veritas
            </h1>
            <progress className="progress progress-color w-64 md:w-72" />
            <p className="text-lg md:text-xl">Unbiased. Unfiltered. Unmissable.</p>
        </div>
    );
}
