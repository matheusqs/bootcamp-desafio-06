import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transactions = await this.find();

    const outcome: number = transactions
      .filter(transaction => transaction.type === 'outcome')
      .reduce<number>((total, transaction) => {
        return total + transaction.value;
      }, 0);

    const income: number = transactions
      .filter(transaction => transaction.type === 'income')
      .reduce<number>((total, transaction) => {
        return total + transaction.value;
      }, 0);

    const total = income - outcome;

    return {
      income,
      outcome,
      total,
    };
  }
}

export default TransactionsRepository;
