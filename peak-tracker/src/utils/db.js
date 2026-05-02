import localforage from 'localforage';

// 初始化数据库配置
localforage.config({
  name: 'PeakTrackerDB',
  storeName: 'peaks_store',
  description: 'Stores climbing records with large images'
});

export const db = {
  // 获取所有记录（按日期倒序排列）
  async getAllRecords() {
    try {
      const records = [];
      await localforage.iterate((value) => {
        records.push(value);
      });
      // 按照登山日期倒序排列
      return records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (err) {
      console.error('获取记录失败:', err);
      return [];
    }
  },

  // 添加新记录
  async addRecord(record) {
    try {
      // 生成唯一 ID
      const id = typeof crypto !== 'undefined' && crypto.randomUUID 
        ? crypto.randomUUID() 
        : Date.now().toString();
        
      const newRecord = {
        ...record,
        id,
        createdAt: Date.now()
      };
      await localforage.setItem(id, newRecord);
      return newRecord;
    } catch (err) {
      console.error('添加记录失败:', err);
      throw err;
    }
  },

  // 更新记录
  async updateRecord(id, updates) {
    try {
      const record = await localforage.getItem(id);
      if (!record) throw new Error('记录不存在');
      const updatedRecord = { ...record, ...updates, updatedAt: Date.now() };
      await localforage.setItem(id, updatedRecord);
      return updatedRecord;
    } catch (err) {
      console.error('更新记录失败:', err);
      throw err;
    }
  },

  // 删除记录
  async deleteRecord(id) {
    try {
      await localforage.removeItem(id);
      return true;
    } catch (err) {
      console.error('删除记录失败:', err);
      throw err;
    }
  },

  // 清空所有数据（用于调试）
  async clearAll() {
    try {
      await localforage.clear();
      return true;
    } catch (err) {
      console.error('清空数据失败:', err);
      throw err;
    }
  }
};
