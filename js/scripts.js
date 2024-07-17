document.addEventListener('DOMContentLoaded', () => {
    const myBooksDiv = document.getElementById('myBooks');
    
    // Create and add the "Add a book" button
    const addButton = document.createElement('button');
    addButton.textContent = 'Ajouter un livre';
    addButton.className = 'roboto-medium';
    addButton.onclick = showSearchForm;
    myBooksDiv.insertBefore(addButton, myBooksDiv.querySelector('hr'));

    function showSearchForm() {
        // Hide the "Add a book" button
        addButton.style.display = 'none';

        // Create the search form
        const searchForm = document.createElement('form');
        searchForm.id = 'searchForm';
        searchForm.innerHTML = `
            <fieldset>
                <label for="bookTitle">Titre du livre</label>
                <input type="text" id="bookTitle" required>
                <label for="bookAuthor">Auteur</label>
                <input type="text" id="bookAuthor" required>
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
        // Remove the search form and search results
        const search = document.getElementById('searchForm');
        const searchResults = document.getElementById('searchResults');
        if (searchForm) {
            searchForm.remove();
        }
        if (searchResults) {
            searchResults.remove();
        }

        // Show the "Add a book" button
        addButton.style.display = 'block';
    }

    function searchBooks() {
        const title = document.getElementById('bookTitle').value;
        const author = document.getElementById('bookAuthor').value;

        fetch(`https://www.googleapis.com/books/v1/volumes?q=intitle:${title}+inauthor:${author}`)
            .then(response => response.json())
            .then(data => {
                displaySearchResults(data.items);
            });
    }

    function displaySearchResults(books) {
        // Remove previous search results if any
        let searchResults = document.getElementById('searchResults');
        if (searchResults) {
            searchResults.remove();
        }

        // Create a new container for search results
        searchResults = document.createElement('div');
        searchResults.id ='searchResults';
        myBooksDiv.insertBefore(searchResults, myBooksDiv.querySelector('hr'));

        if (!books || books.length === 0) {
            searchResults.textContent = 'Aucun livre n’a été trouvé';
            return;
        }

        books.forEach(book => {
            const bookElement = document.createElement('div');
            bookElement.className = 'book';

            // Extract book details
            const id = book.id;
            const title = book.volumeInfo.title;
            const author = book.volumeInfo.authors[0];
            const description = book.volumeInfo.description ? book.volumeInfo.description.substring(0, 200) + '...' : 'Information manquante';
            const image = book.volumeInfo.imageLinks ? book.volumeInfo.imageLinks.thumbnail : 'images/unavailable.png';

            bookElement.innerHTML = `
                <h3>${title}</h3>
                <p><strong>ID:</strong> ${id}</p>
                <p><strong>Auteur:</strong> ${author}</p>
                <p>${description}</p>
                <img src="${image}" alt="Couverture du livre">
                <button>Bookmark</button> <!-- Placeholder button for bookmark -->
            `;

            searchResults.appendChild(bookElement);
        });
    }
})