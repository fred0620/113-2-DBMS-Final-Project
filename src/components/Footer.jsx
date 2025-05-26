export default function Footer() {
  return (
    <footer className="bg-primary text-white">
      <div className="w-full px-8 py-8 flex flex-wrap justify-between gap-6">
        {/* 關於我們 */}
        <div className="min-w-[150px] text-left leading-6">
          <a href="#" className="hover:underline whitespace-nowrap">
            關於我們
          </a>
          <p>負責人: 吳彥勳</p>
          <p>email:110207317@g.nccu.edu.tw </p>
        </div>

        {/* 使用條款 */}
        <div className="min-w-[120px] text-left">
          <a href="https://www.nccu.edu.tw/p/426-1000-30.php?Lang=zh-tw" target="_blank"
            rel="noopener noreferrer" className="hover:underline whitespace-nowrap">
             尊重智慧財產權
          </a>
          <a> | </a>
          <a href="https://www.nccu.edu.tw/p/426-1000-25.php?Lang=zh-tw" target="_blank"
            rel="noopener noreferrer" className="hover:underline whitespace-nowrap">
             網路使用規範要點
          </a>
          <p>本網站著作權屬於國立政治大學</p>
        </div>

        {/* 政大首頁連結 */}
        <div className="min-w-[120px] text-left">
          <a
            href="https://www.nccu.edu.tw"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline whitespace-nowrap"
          >
            政治大學首頁連結
          </a>
        </div>

        {/* 聯絡資訊 */}
        <div className="min-w-[200px] text-left leading-6">
          <p>聯絡電話: 02-29393091</p>
          <p>傳真: 02-29379611</p>
          <p>地址: 台北市文山區指南路二段64號</p>
        </div>
      </div>
    </footer>
  );
}
