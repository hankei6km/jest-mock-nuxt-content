import * as fs from 'fs';

const countChars = async (fileName: string): Promise<number> => {
  return new Promise((resolve, reject) => {
    fs.readFile(fileName, (err, data) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(data.toString('utf-8').length);
    });
  });
};
export default countChars;
