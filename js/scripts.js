document.addEventListener('DOMContentLoaded', () => {
    // Set the favicon (icon in the browser tab)
    const link = document.createElement('link');
    link.rel = 'icon';
    link.href = 'images/logo.png'; 
    document.head.appendChild(link);

    const myBooksDiv = document.getElementById('myBooks');
    const contentDiv = document.getElementById('content');

    // Create and add the "Add a book" button
    const addButton = document.createElement('button');
    addButton.textContent = 'Ajouter un livre';
    addButton.className = 'main-button';
    addButton.onclick = showSearchForm;
    myBooksDiv.insertBefore(addButton, myBooksDiv.querySelector('hr'));

    function showSearchForm() {
        // Hide the addButton
        addButton.style.display = 'none';

        // Create the search form
        const searchForm = document.createElement('form');
        searchForm.id = 'searchForm';
        searchForm.innerHTML = `
            <fieldset>
                <label for="bookTitle">Titre du livre</label>
                <input type="text" id="bookTitle">
                <label for="bookAuthor">Auteur</label>
                <input type="text" id="bookAuthor">
                <button type="submit">Rechercher</button>
                <button type="button" id="cancelButton">Annuler</button>
            </fieldset>
        `;

        // Add events to buttons
        searchForm.querySelector('#cancelButton').onclick = hideSearchForm;
        searchForm.onsubmit = (event) => {
            event.preventDefault();
            searchBooks();
        };

        // Add the form to the DOM
        myBooksDiv.insertBefore(searchForm, myBooksDiv.querySelector('hr'));
    }

    function hideSearchForm() {
        // Show the addButton
        addButton.style.display = 'block';

        const searchForm = document.getElementById('searchForm');
        if (searchForm) {
            searchForm.remove();
        }
        const searchResults = document.getElementById('searchResults');
        if (searchResults) {
            searchResults.remove();
        }
    }

    function searchBooks() {
        let title = document.getElementById('bookTitle').value.trim();
        let author = document.getElementById('bookAuthor').value.trim();

        if (title === '' && author === '') {
            alert('Veuillez entrer un titre ou un auteur.');
            return;
        }

        let query = '';
        if (title !== '') {
            query += `intitle:${title}`;
        }
        if (author !== '') {
            if (query !== '') {
                query += '+';
            }
            query += `inauthor:${author}`;
        }

        fetch(`https://www.googleapis.com/books/v1/volumes?q=${query}`)
            .then(response => response.json())
            .then(data => displaySearchResults(data.items))
            .catch(error => console.error('Erreur lors de la recherche des livres :', error));
    }

    function displaySearchResults(books) {
        // Remove previous search results if any
        let searchResults = document.getElementById('searchResults');
        if (searchResults) {
            searchResults.remove();
        }

        // Create a new container for search results
        searchResults = document.createElement('div');
        searchResults.id = 'searchResults';
        myBooksDiv.insertBefore(searchResults, myBooksDiv.querySelector('hr'));

        if (!books || books.length === 0) {
            searchResults.textContent = 'Aucun livre n’a été trouvé';
            return;
        }

        const pochList = JSON.parse(sessionStorage.getItem('pochList')) || [];

        books.forEach(book => {
            const bookElement = document.createElement('div');
            bookElement.className = 'book';

            // Extract book details
            const id = book.id;
            const title = book.volumeInfo.title;
            const author = book.volumeInfo.authors[0];
            let description;

            if (book.volumeInfo.description) {
                if (book.volumeInfo.description.length > 200) {
                    description = book.volumeInfo.description.substring(0, 200) + '...';
                } else {
                    description = book.volumeInfo.description;
                }
            } else {
                description = 'Information manquante';
            }
            const image = book.volumeInfo.imageLinks ? book.volumeInfo.imageLinks.thumbnail : 'images/unavailable.png';

            const isBookmarked = pochList.some(item => item.id === id);
            const bookmarkButtonHtml = `<button class="button-icon bookmark-button"><img src="images/save.png" alt="Save"></button>`;

            bookElement.innerHTML = `
                <h3>${title}</h3>
                <p><strong>ID:</strong> <strong>${id}</strong></p>
                <p><strong>Auteur:</strong> ${author}</p>
                <p>${description}</p>
                <img src="${image}" alt="Couverture du livre" class="book-cover">
                ${bookmarkButtonHtml}
            `;

            const bookmarkButton = bookElement.querySelector('.bookmark-button');

            // Add event listener to bookmark button
            bookmarkButton.addEventListener('click', () => {
                saveToPochList(id, title, author, description, image, bookmarkButton);
            });

            searchResults.appendChild(bookElement);
        });
    }

    function saveToPochList(id, title, author, description, image, buttonElement) {
        const pochList = JSON.parse(sessionStorage.getItem('pochList')) || [];

        // Check if the book is already in the poch'liste
        if (pochList.some(book => book.id === id)) {
            alert('Vous ne pouvez ajouter deux fois le même livre');
            return;
        }

        const newBook = { id, title, author, description, image };
        pochList.push(newBook);
        sessionStorage.setItem('pochList', JSON.stringify(pochList));

        // Update the poch'liste dynamically
        displayPochList();
    }

    function displayPochList() {
        const pochListDiv = document.querySelector('#content');
        let pochListContent = document.querySelector('.pochlist-content');
        if (pochListContent) {
            pochListContent.remove(); // Remove existing content
        }
        pochListContent = document.createElement('div');
        pochListContent.className = 'pochlist-content';
        pochListDiv.appendChild(pochListContent);

        const pochList = JSON.parse(sessionStorage.getItem('pochList')) || [];

        if (pochList.length === 0) {
            pochListContent.innerHTML = '<p>Aucun livre n’a été ajouté à votre poch\'liste.</p>';
            return;
        }

        pochList.forEach(book => {
            const bookElement = document.createElement('div');
            bookElement.className = 'book';

            bookElement.innerHTML = `
                <h3>${book.title}</h3>
                <p><strong>ID:</strong> <strong>${book.id}</strong></p>
                <p><strong>Auteur:</strong> ${book.author}</p>
                <p>${book.description}</p>
                <img src="${book.image}" alt="Couverture du livre" class="book-cover">
                <button class="button-icon delete-button"><img src="images/trash.png" alt="Supprimer"></button>
            `;

            // Add event listener to delete button
            bookElement.querySelector('.delete-button').addEventListener('click', () => removeFromPochList(book.id));

            pochListContent.appendChild(bookElement);
        });
    }

    function removeFromPochList(bookId) {
        let pochList = JSON.parse(sessionStorage.getItem('pochList')) || [];
        pochList = pochList.filter(book => book.id !== bookId);
        sessionStorage.setItem('pochList', JSON.stringify(pochList));
        displayPochList();
    }

    // Initial display of the poch'list on page load
    displayPochList();
});
