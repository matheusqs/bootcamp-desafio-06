// import AppError from '../errors/AppError';

import { getRepository, getCustomRepository } from 'typeorm';
import Transaction from '../models/Transaction';
import Category from '../models/Category';
import TransactionsRepository from '../repositories/TransactionsRepository';
import AppError from '../errors/AppError';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const categoriesRepository = getRepository(Category);

    const catagoryFounded = await categoriesRepository.findOne({
      where: { title: category },
    });

    let categoryComplete;

    if (!catagoryFounded) {
      const newCategory = categoriesRepository.create({ title: category });

      await categoriesRepository.save(newCategory);

      categoryComplete = newCategory;
    } else {
      categoryComplete = catagoryFounded;
    }

    if (type === 'outcome') {
      const { total } = await transactionsRepository.getBalance();

      if (total < value) {
        throw new AppError(
          'There is not suficient balance to do this outcome.',
        );
      }
    }

    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category: categoryComplete,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
