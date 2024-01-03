import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { execSync } from 'node:child_process'
import request from 'supertest'
import { app } from '../app'
import { knex } from '../infra/database'

describe('Transactions Routes', () => {
  beforeAll(async () => {
    await app.ready()
    execSync('npx knex migrate:latest')
  })

  afterAll(async () => {
    await app.close()
    execSync('npx knex migrate:rollback --all')
  })

  beforeEach(async () => {
    await knex('transactions').delete()
  })

  it('should be able to create a new transaction', async () => {
    await request(app.server)
      .post('/transactions')
      .send({
        title: 'any_title',
        amount: 3500,
        type: 'credit',
      })
      .expect(201)
  })

  it('should be able to list all transactions', async () => {
    const createTransactionResponse = await request(app.server)
      .post('/transactions')
      .send({
        title: 'any_title',
        amount: 3500,
        type: 'credit',
      })

    const cookie = createTransactionResponse.get('Set-Cookie')

    const listAllTransaction = await request(app.server)
      .get('/transactions')
      .set('Cookie', cookie)
      .expect(200)

    expect(listAllTransaction.body.transactions).toEqual([
      expect.objectContaining({
        id: expect.any(String),
        title: 'any_title',
        amount: '3500.00',
      }),
    ])
  })

  it('should be able to get specific transaction', async () => {
    const createTransactionResponse = await request(app.server)
      .post('/transactions')
      .send({
        title: 'any_title',
        amount: 3500,
        type: 'credit',
      })

    const cookie = createTransactionResponse.get('Set-Cookie')
    const getAllTransactions = await request(app.server)
      .get('/transactions')
      .set('Cookie', cookie)

    const transaction = getAllTransactions.body.transactions[0].id

    const getTransaction = await request(app.server)
      .get(`/transactions/${transaction}`)
      .set('Cookie', cookie)

    expect(getTransaction.body.transaction).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        title: 'any_title',
        amount: '3500.00',
      })
    )
  })

  it('should return the user summary', async () => {
    const createTransactionResponse = await request(app.server)
      .post('/transactions')
      .send({
        title: 'Credit Transaction',
        amount: 5000,
        type: 'credit',
      })

    const cookie = createTransactionResponse.get('Set-Cookie')

    await request(app.server).post('/transactions').set('Cookie', cookie).send({
      title: 'Debit Transaction',
      amount: 2000,
      type: 'debit',
    })

    const getSummaryResponse = await request(app.server)
      .get('/transactions/summary')
      .set('Cookie', cookie)

    expect(getSummaryResponse.body.summary).toEqual({
      amount: '3000.00',
    })
  })
})
