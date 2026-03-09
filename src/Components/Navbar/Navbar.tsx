import { Link } from "react-router-dom";

export default function Navbar() {
    return (
        <div className="navbar bg-[#0f1f26] border-b border-white/10 shadow-none text-white">
            <div className="navbar-start">
                <Link to="/" className="btn btn-ghost text-xl text-[#00a9a5] hover:bg-white/5">Veritas</Link>
            </div>
            <div className="navbar-end">
                <Link to="/search" className="btn btn-ghost btn-circle text-[#00a9a5] hover:bg-white/5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5"
                        fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </Link>
            </div>
        </div>
    )
}
