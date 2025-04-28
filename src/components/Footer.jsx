export default function Footer() {
  return (
    <footer className="bg-primary text-white">
      <div className="w-full px-8 py-8 flex flex-wrap justify-between gap-6">
        {/* 關於我們 */}
        <div className="min-w-[150px] text-left">
          <a href="#" className="hover:underline whitespace-nowrap">
            關於我們
          </a>
        </div>

        {/* 使用條款 */}
        <div className="min-w-[150px] text-left">
          <a href="#" className="hover:underline whitespace-nowrap">
            使用條款
          </a>
        </div>

        {/* 政大首頁連結 */}
        <div className="min-w-[200px] text-left">
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
          <p>聯絡電話: 02-22222222</p>
          <p>傳真: 02-44444444</p>
          <p>地址: 台北市文山區指南路二段64號</p>
        </div>
      </div>
    </footer>
  );
}
