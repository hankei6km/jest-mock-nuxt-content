import { Writable } from 'stream';
import countChars from './count';

type Opts = {
  filenames: string[];
  stdout: Writable;
  stderr: Writable;
};
const cli = async ({ filenames, stdout, stderr }: Opts): Promise<number> => {
  try {
    const len = filenames.length;
    for (let i = 0; i < len; i++) {
      const filename = filenames[i];
      const count = await countChars(filename);
      stdout.write(`${filename}: ${count} chars\n`);
    }
  } catch (err) {
    stderr.write(err.toString());
    stderr.write('\n');
    return 1;
  }
  return 0;
};

export default cli;
