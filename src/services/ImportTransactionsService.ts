import csvParse from 'csv-parse';
import fs from 'fs';
import path from 'path';
import Transaction from '../models/Transaction';
import CreateTransactionService from './CreateTransactionService';

interface Request {
  filename: string;
}

class ImportTransactionsService {
  async execute({ filename }: Request): Promise<Transaction[]> {
    const createTransactionService = new CreateTransactionService();

    const csvFilePath = path.resolve(__dirname, '..', '..', 'tmp', filename);

    const data = await this.loadCSV(csvFilePath);

    const dataMapped = data.map(line => ({
      title: line[0],
      type: line[1],
      value: line[2],
      category: line[3],
    }));

    const transactions: Transaction[] = [];

    // eslint-disable-next-line no-restricted-syntax
    for (const transaction of dataMapped) {
      transactions.push(
        // eslint-disable-next-line no-await-in-loop
        await createTransactionService.execute({
          title: transaction.title,
          category: transaction.category,
          type: transaction.type,
          value: transaction.value,
        }),
      );
    }

    return transactions;
  }

  async loadCSV(filePath: string): Promise<any[]> {
    const readCSVStream = fs.createReadStream(filePath);

    const parseStream = csvParse({
      from_line: 2,
      ltrim: true,
      rtrim: true,
    });

    const parseCSV = readCSVStream.pipe(parseStream);

    const lines: any[] | PromiseLike<any[]> = [];

    parseCSV.on('data', line => {
      lines.push(line);
    });

    await new Promise(resolve => {
      parseCSV.on('end', resolve);
    });

    return lines;
  }
}

export default ImportTransactionsService;
