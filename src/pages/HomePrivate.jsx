import { useState } from 'react';
import NavBar from '../components/NavBar';
import SearchBar from '../components/SearchBar';
import SOPCard from '../components/SOPCard';
import Footer from '../components/Footer';

export default function HomePrivate() {
  const [recentViews] = useState([]); // 暫時無資料，可未來接後端

  return (
    <>
      <NavBar />
      <header className="bg-secondary py-12 text-center">
        <h1 className="text-2xl font-bold text-primary mb-6">政大SOP整合系統 NCCU SOP Center</h1>
        <SearchBar />
      </header>
      <section className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-xl font-semibold text-center mb-8">SOP瀏覽紀錄</h2>
        {recentViews.length === 0 ? (
          <p className="text-center text-gray-500">目前尚無瀏覽紀錄</p>
        ) : (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {recentViews.map((sop) => (
              <SOPCard key={sop.id} sop={sop} />
            ))}
          </div>
        )}
      </section>
      <Footer />
    </>
  );
}