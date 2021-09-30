import countChars from './count';

describe('countChars()', () => {
  it('should return count of content', async () => {
    expect(await countChars('test/assets/test1.txt')).toEqual(15);
  });
  it('should reject when file not found', async () => {
    await expect(countChars('test/assets/fail.txt')).rejects.toThrow('ENOENT:');
  });
});
