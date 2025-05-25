import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import SearchBar from '../components/SearchBar';

export default function HomePrivate() {
  return (
    <div className="flex flex-col min-h-screen">
      <NavBar />

      <main className="flex-1 bg-secondary flex items-center justify-center">
        <div className="text-center w-full max-w-4xl px-4 py-12">
          <h1 className="text-4xl font-bold text-primary mb-6">
            政大SOP整合系統&nbsp;NCCU SOP Center
          </h1>
          <SearchBar />
        </div>
      </main>

      <Footer />
    </div>
  );
}