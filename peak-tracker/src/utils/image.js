/**
 * 将图片 File 对象转换为 Base64 字符串，便于存入 IndexedDB
 * @param {File} file 
 * @returns {Promise<string>} Base64 字符串
 */
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};
