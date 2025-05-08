import * as XLSX from 'xlsx';

function flattenObject(obj, prefix = '') {
  let result = {};
  
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key];
      const newKey = prefix ? `${prefix}.${key}` : key;
      
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        // Recursively flatten nested objects
        const flattened = flattenObject(value, newKey);
        result = { ...result, ...flattened };
      } else {
        // Add primitive value
        result[newKey] = value;
      }
    }
  }
  
  return result;
}

function exportToExcel(data, filename = 'data.xlsx') {
  // Flatten each object in the array
  const flattenedData = data.map(item => flattenObject(item));
  
  const worksheet = XLSX.utils.json_to_sheet(flattenedData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

  // Save to file
  XLSX.writeFile(workbook, filename);
}

export default {
  exportToExcel,
}