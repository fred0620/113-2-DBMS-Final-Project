import { useEffect, useState } from 'react';
import NavBar from '../components/NavBar';
import SearchBar from '../components/SearchBar';
import SOPCard from '../components/SOPCard';
import Footer from '../components/Footer';
import recent from '../data/demoData'; //改成demoData

export default function HomePrivate() {
  const [recentViews, setRecentViews] = useState([]);
  useEffect(() => setRecentViews(recent.slice(0, 8)), []);

  return (
    <>
      <NavBar />
      <header className="bg-secondary py-12 text-center">
        <h1 className="text-2xl font-bold text-primary mb-6">政大SOP整合系統 NCCU SOP Center</h1>
        <SearchBar />
      </header>
      <section className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-xl font-semibold text-center mb-8">SOP瀏覽紀錄</h2>
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {recentViews.map(sop => <SOPCard key={sop.id} sop={sop} />)}
        </div>
      </section>
      <Footer />
    </>
  );
}