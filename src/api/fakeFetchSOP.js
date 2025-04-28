/** 
// src/api/fakeFetchSOP.js
import demoData from '../data/demoData';

/**
 * 模擬 fetch 後端SOP資料
 * @param {Object} params - { keyword: string|null, dept: string|null, group: string|null, page: number, pageSize: number }
 * @returns {Promise<{ sops: array, total: number }>}
 
export function fakeFetchSOP({ keyword = null, dept = null, group = null, page = 1, pageSize = 6 }) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const filtered = demoData.filter(sop => {
        const matchKeyword = keyword ? sop.title.includes(keyword) : true;
        const matchDept = dept ? sop.department === dept : true;
        const matchGroup = group ? sop.group === group : true; // 小地方：原本你的 group 應該是對 group，不是 department！

        return matchKeyword && matchDept && matchGroup;
      });

      const total = filtered.length;

      const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

      resolve({ sops: paginated, total });
    }, 500);
  });
}
*/