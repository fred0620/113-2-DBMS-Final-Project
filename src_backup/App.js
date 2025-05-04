import React, { useEffect, useState } from 'react';

function App() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('/api/sops')
      .then(res => res.json())
      .then(setData);
  }, []);

  return React.createElement(
    'div',
    { style: { padding: '2rem', fontFamily: 'Arial' } },
    React.createElement('h1', null, '🎉 前後端整合成功'),
    React.createElement('p', null, '從後端取得的資料：'),
    React.createElement('pre', null, data ? JSON.stringify(data, null, 2) : '載入中⋯')
  );
}

export default App;
