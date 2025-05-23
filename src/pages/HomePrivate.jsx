import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import SearchBar from '../components/SearchBar';

export default function HomePublic() {
  return (
    <div className="bg-secondary min-h-screen flex flex-col">
      <NavBar />
      <div className="flex-grow flex flex-col items-center justify-center">
        <header className="text-center">
          <h1 className="text-4xl font-bold text-primary mb-6">
            政大SOP整合系統 NCCU SOP Center
          </h1>
          {/* 不需要特別傳 onSearch，SearchBar 自己 navigate */}
          <SearchBar />
        </header>
      </div>
      <Footer />
    </div>
  );
}
