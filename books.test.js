process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('./app');
const db = require('./db');

let book;
beforeEach(async() => {
    const result = await db.query(
    `INSERT INTO books (
        isbn,
        amazon_url,
        author,
        language,
        pages,
        publisher,
        title,
        year) 
        VALUES (
        '019283',
        'amazon@books.com',
        'Test-Author',
        'english',
        250,
        'Test-Publisher',
        'Test-Title',
        2000) 
        RETURNING 
        isbn, amazon_url, author, language, pages, publisher, title, year`);

    book = result.rows[0];
})

afterEach(async () => {
    await db.query(`DELETE FROM books`);
})

afterAll(async () => {
    await db.end();
})

describe('Book Routes', () => {

    test('Get all books', async() => {
        const result = await request(app).get('/books');
        expect(result.statusCode).toBe(200);
        expect(result.body).toEqual({books:[book]});
    })

    test('Get by isbn', async() => {
        const result = await request(app).get(`/books/${book.isbn}`);
        expect(result.statusCode).toBe(200);
        expect(result.body).toEqual({book: book});
    })

    test('Add a new book', async() => {
        const result = await request(app).post('/books').send({
            "isbn": "031590",
            "amazon_url": "march15@1990.year",
            "author": "Brenda",
            "language": "english",
            "pages": 11160,
            "publisher": "JRMC",
            "title": "Story Of Me",
            "year": 1990
        });
        expect(result.statusCode).toBe(201);
        expect(result.body).toBeInstanceOf(Object);

    })

    test('Add a invalid book(invalid schema)', async() => {
        const result = await request(app).post('/books').send({
            "isbn": "031590",
            "amazon_url": "march15@1990.year",
            "author": "Brenda",
            "language": "english",
            "pages": "11160",
            "publisher": "JRMC",
            "title": "Story Of Me",
            "year": 1990
        });
        expect(result.statusCode).toBe(400);
    })

    test('Add a invalid book(missing requirement)', async() => {
        const result = await request(app).post('/books').send({
            "isbn": "031590",
            "amazon_url": "march15@1990.year",
            "author": "Brenda",
            "language": "english",
            "publisher": "JRMC",
            "title": "Story Of Me",
            "year": 1990
        });
        expect(result.statusCode).toBe(400);
    })


    test('Update a book', async() => {
        const result = await request(app).put(`/books/${book.isbn}`).send({
            "amazon_url": "march15@1990.year",
            "author": "Brenda",
            "language": "english",
            "pages": 11160,
            "publisher": "Jefferson Regional Medical Center",
            "title": "Story Of Me",
            "year": 1990
        });
        expect(result.statusCode).toBe(200);
    })

    test('Update book(invalid schema)', async() => {
        const result = await request(app).put('/books').send({
            "amazon_url": "march15@1990.year",
            "author": "Brenda",
            "language": "english",
            "pages": 11160,
            "publisher": "JRMC",
            "title": 'Story Of Me',
            "year": '1990'
        });
        expect(result.statusCode).toBe(404);
    })

    test('Update book(missing requirement)', async() => {
        const result = await request(app).put('/books').send({
            "amazon_url": "march15@1990.year",
            "author": "Brenda",
            "language": "english",
            "pages": 11160,
            "publisher": "JRMC",
            "title": 'Story Of Me',
        });
        expect(result.statusCode).toBe(404);
    })

    test('Delete a book', async() => {
        const result = await request(app).delete(`/books/${book.isbn}`);
        expect(result.statusCode).toBe(200);
    })


})