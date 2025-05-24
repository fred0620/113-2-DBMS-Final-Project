import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import SearchBar from '../components/SearchBar';
import Footer from '../components/Footer';

export default function HomePrivate() {
  return (
    <div className="flex flex-col min-h-screen">
      <NavBar />

      {/* 中間淺藍色滿版區塊 */}
      <main className="flex-grow bg-secondary flex items-center justify-center">
        <div className="text-center w-full max-w-4xl px-4 py-12">
          <h1 className="text-2xl font-bold text-primary mb-6">
            政大SOP整合系統 NCCU SOP Center
          </h1>
          <SearchBar />
        </div>
      </main>

      <Footer />
    </div>
  );
}
