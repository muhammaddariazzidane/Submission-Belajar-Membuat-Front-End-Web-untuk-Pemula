const bookShelfKey = 'books';

const getBooksFromLocalStorage = () => JSON.parse(localStorage.getItem(bookShelfKey)) ?? [];

const saveBooksToStorage = (books) => localStorage.setItem(bookShelfKey, JSON.stringify(books));

const findBookIndex = (bookId) => {
  const books = getBooksFromLocalStorage();
  const bookIndex = books.findIndex((book) => book.id === bookId);
  return { books, bookIndex };
};

const findBookById = (bookId) => {
  const books = getBooksFromLocalStorage();
  return books.find((book) => book.id === bookId);
};

const createBookElement = (book) => {
  const bookItem = document.createElement('article');
  bookItem.setAttribute('data-bookid', book.id);
  bookItem.setAttribute('data-testid', 'bookItem');

  const bookTitle = document.createElement('h3');
  bookTitle.textContent = book.title;
  bookTitle.setAttribute('data-testid', 'bookItemTitle');

  const bookAuthor = document.createElement('p');
  bookAuthor.textContent = `Penulis: ${book.author}`;
  bookAuthor.setAttribute('data-testid', 'bookItemAuthor');

  const bookYear = document.createElement('p');
  bookYear.textContent = `Tahun: ${book.year}`;
  bookYear.setAttribute('data-testid', 'bookItemYear');

  const bookAction = document.createElement('div');
  bookAction.className = 'action';

  const toggleButton = document.createElement('button');
  toggleButton.className = !book.isComplete ? 'green' : 'gray';
  toggleButton.textContent = book.isComplete ? 'Belum selesai di Baca' : 'Selesai dibaca';
  toggleButton.setAttribute('data-testid', 'bookItemIsCompleteButton');
  toggleButton.addEventListener('click', () => toggleBookCompletion(book.id));

  const editButton = document.createElement('button');
  editButton.className = 'blue';
  editButton.textContent = 'Edit';
  editButton.setAttribute('data-testid', 'bookItemEditButton');
  editButton.addEventListener('click', () => populateFormForEdit(book.id));

  const deleteButton = document.createElement('button');
  deleteButton.className = 'red';
  deleteButton.textContent = 'Hapus';
  deleteButton.setAttribute('data-testid', 'bookItemDeleteButton');
  deleteButton.addEventListener('click', () => deleteBook(book.id));

  bookAction.appendChild(toggleButton);
  bookAction.appendChild(editButton);
  bookAction.appendChild(deleteButton);

  bookItem.appendChild(bookTitle);
  bookItem.appendChild(bookAuthor);
  bookItem.appendChild(bookYear);
  bookItem.appendChild(bookAction);

  return bookItem;
};

const renderBookList = (books) => {
  books.forEach((book) => {
    const bookElement = createBookElement(book);
    book.isComplete ? completeBookList.appendChild(bookElement) : incompleteBookList.appendChild(bookElement);
  });
};

const sortBooksByIdDescending = (books) => books.sort((a, b) => b.id - a.id);

const updateBooksDisplay = (filteredBooks = null) => {
  incompleteBookList.innerHTML = '';
  completeBookList.innerHTML = '';

  const books = filteredBooks ?? getBooksFromLocalStorage();

  if (books.length === 0) {
    const existingNotFoundMessage = document.querySelector('.not-found');

    if (existingNotFoundMessage) existingNotFoundMessage.remove();

    const notFoundMessage = document.createElement('p');
    notFoundMessage.textContent = 'Buku tidak ditemukan';
    notFoundMessage.className = 'not-found';

    return document.getElementById('bookSearchSection').appendChild(notFoundMessage);
  }

  const sortedBooks = sortBooksByIdDescending(books);

  renderBookList(sortedBooks);
};

const filterBooksByTitle = (keyword, books) => books.filter((book) => book.title.toLowerCase().includes(keyword));

const searchForm = document.getElementById('searchBook');

searchForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const keyword = event.target.keyword.value.toLowerCase();
  const books = getBooksFromLocalStorage();

  const filteredBooks = filterBooksByTitle(keyword, books);

  updateBooksDisplay(filteredBooks);
});

const form = document.getElementById('bookForm');

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const title = form.title.value;
  const author = form.author.value;
  const year = Number(form.year.value);
  const isComplete = form.isComplete.checked;

  if (isNaN(year)) {
    alert('Tahun harus berupa angka.');
    return;
  }

  const editingBookId = form.getAttribute('data-editing');

  if (editingBookId) {
    updateBook(Number(editingBookId));
    form.removeAttribute('data-editing');
  } else {
    addBookToShelf(title, author, year, isComplete);
  }

  form.reset();
});

const addBookToShelf = (title, author, year, isComplete) => {
  const books = getBooksFromLocalStorage();
  books.unshift({
    id: +new Date(),
    title,
    author,
    year,
    isComplete,
  });
  saveBooksToStorage(books);

  updateBooksDisplay();
};

const deleteBook = (bookId) => {
  const { books, bookIndex } = findBookIndex(bookId);

  if (bookIndex !== -1) {
    books.splice(bookIndex, 1);
    saveBooksToStorage(books);
    updateBooksDisplay();

    if (form.getAttribute('data-editing')) form.reset();
  }
};

const toggleBookCompletion = (bookId) => {
  const { books, bookIndex } = findBookIndex(bookId);

  if (bookIndex !== -1) {
    books[bookIndex].isComplete = !books[bookIndex].isComplete;
    saveBooksToStorage(books);
    updateBooksDisplay();
  }
};

const populateFormForEdit = (bookId) => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  });

  const book = findBookById(bookId);

  if (book) {
    form.title.value = book.title;
    form.author.value = book.author;
    form.year.value = book.year;
    form.isComplete.checked = book.isComplete;
    form.setAttribute('data-editing', bookId);
  }
};

const updateBook = (bookId) => {
  const { books, bookIndex } = findBookIndex(bookId);

  if (bookIndex !== -1) {
    books[bookIndex].title = form.title.value;
    books[bookIndex].author = form.author.value;
    books[bookIndex].year = Number(form.year.value);
    books[bookIndex].isComplete = form.isComplete.checked;

    saveBooksToStorage(books);
    updateBooksDisplay();
  }
};

updateBooksDisplay();
