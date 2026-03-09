import { useState } from "react";
import NewsCard from "../../Components/NewsCard/NewsCard";
import Tabs from "../../Components/Tabs/Tabs";

export default function HomePage() {
  const [category, setCategory] = useState<string>("general");

  return (
    <>
      <h1 className="text-4xl font-bold mt-2 mb-6">Featured News</h1>
      <Tabs onCategoryChange={setCategory} initialCategory={category} />
      <NewsCard category={category} />
    </>
  )
}
