import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import SearchBar from '../components/SearchBar';

export default function HomePublic() {
  return (
    <div className="flex flex-col min-h-screen">
      <NavBar />

      {/* 滿版淺藍色背景區塊，撐滿中間空間 */}
      <main className="flex-grow bg-secondary flex items-center justify-center">
        <div className="text-center w-full max-w-4xl px-4 py-12">
          <h1 className="text-4xl font-bold text-primary mb-6">
            政大SOP整合系統 NCCU SOP Center
          </h1>
          <SearchBar />
        </div>
      </main>

      <Footer />
    </div>
  );
}