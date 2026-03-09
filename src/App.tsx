import { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import Footer from "./Components/Footer/Footer";
import Navbar from "./Components/Navbar/Navbar";
import HomePage from "./Pages/Home/HomePage";
import NewsDetail from "./Pages/NewsDetail/NewsDetail";
import SearchPage from "./Pages/Search/SearchPage";
import SplashScreen from "./Pages/SplashScreen/SplashScreen";

export default function App() {
  const [showSplash, setShowSplash] = useState<boolean>(true);

  useEffect(() => {
    const timeout = setTimeout(() => setShowSplash(false), 2500);
    return () => clearTimeout(timeout);
  }, []);

  return showSplash ? (
    <SplashScreen />
  ) : (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route
          path="/"
          element={
            <div className="p-4">
              <HomePage />
            </div>
          }
        />
        <Route path="/search" element={<SearchPage />} />
        <Route
          path="/news/:articleUrl"
          element={
            <div className="p-4">
              <NewsDetail />
            </div>
          }
        />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}
