document.addEventListener('DOMContentLoaded', () => {
    // Set the favicon (icon in the browser tab)
    const link = document.createElement('link');
    link.rel = 'icon';
    link.href = 'images/logo.png';
    document.head.appendChild(link);

    const myBooksDiv = document.getElementById('myBooks');
    const contentDiv = document.getElementById('content');
    const hrElement = myBooksDiv.querySelector('hr');

    // Create and add the "Add a book" button
    const addButton = document.createElement('button');
    addButton.textContent = 'Ajouter un livre';
    addButton.className = 'main-button';
    addButton.onclick = showSearchForm;
    myBooksDiv.insertBefore(addButton, hrElement);

    function showSearchForm() {
        // Hide the addButton
        addButton.style.display = 'none';

        // Remove existing search form if any
        const existingSearchForm = document.getElementById('searchForm');
        if (existingSearchForm) {
            existingSearchForm.remove();
        }

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

        searchForm.querySelector('#cancelButton').addEventListener('click', hideSearchForm);
        searchForm.addEventListener('submit', (event) => {
            event.preventDefault();
            searchBooks();
        });

        // Add the form to the DOM
        myBooksDiv.insertBefore(searchForm, hrElement);

        // Add the hidden search results title if it doesn't exist
        let searchResultsTitle = document.getElementById('searchResultsTitle');
        if (!searchResultsTitle) {
            searchResultsTitle = document.createElement('div');
            searchResultsTitle.id = 'searchResultsTitle';
            searchResultsTitle.classList.add('hidden');
            searchResultsTitle.innerHTML = `
                <hr>
                <h2>Résultats de recherche</h2>
            `;
            myBooksDiv.insertBefore(searchResultsTitle, hrElement);
        } else {
            // Reposition the existing searchResultsTitle
            myBooksDiv.insertBefore(searchResultsTitle, hrElement);
        }
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

        const searchResultsTitle = document.getElementById('searchResultsTitle');
        if (searchResultsTitle) {
            searchResultsTitle.classList.add('hidden');
        }
    }

    function searchBooks() {
        const title = document.getElementById('bookTitle').value.trim();
        const author = document.getElementById('bookAuthor').value.trim();

        if (!title && !author) {
            alert('Veuillez entrer un titre ou un auteur.');
            return;
        }

        let query = '';
        if (title) {
            query += `intitle:${title}`;
        }
        if (author) {
            if (query) {
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
    
        // Ensure searchResultsTitle is in the correct position
        let searchResultsTitle = document.getElementById('searchResultsTitle');
        if (!searchResultsTitle) {
            searchResultsTitle = document.createElement('div');
            searchResultsTitle.id = 'searchResultsTitle';
            searchResultsTitle.innerHTML = `
                <hr>
                <h2>Résultats de recherche</h2>
            `;
            myBooksDiv.insertBefore(searchResultsTitle, hrElement);
        } else {
            myBooksDiv.insertBefore(searchResultsTitle, hrElement);
        }
    
        myBooksDiv.insertBefore(searchResults, hrElement);
    
        searchResultsTitle.classList.remove('hidden');
    
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
            const author = book.volumeInfo.authors ? book.volumeInfo.authors[0] : 'Auteur inconnu';
            let description = book.volumeInfo.description
                ? (book.volumeInfo.description.length > 200
                    ? book.volumeInfo.description.substring(0, 200) + '...'
                    : book.volumeInfo.description)
                : 'Information manquante';
            const image = book.volumeInfo.imageLinks ? book.volumeInfo.imageLinks.thumbnail : 'images/unavailable.png';
    
            const isBookmarked = pochList.some(item => item.id === id);
            const bookmarkButtonHtml = `<button class="button-icon bookmark-button"><img src="images/save.png" alt="Save"></button>`;
    
            bookElement.innerHTML = `
                <div class="book-content">
                    <h3>${title}</h3>
                    <p><strong>ID:</strong> <strong>${id}</strong></p>
                    <p>Auteur: ${author}</p>
                    <p>${description}</p>
                </div>
                <img src="${image}" alt="Couverture du livre" class="book-cover">
                ${bookmarkButtonHtml}
            `;
    
            const bookmarkButton = bookElement.querySelector('.bookmark-button');
    
            // Add event listener to bookmark button
            if (bookmarkButton) {
                bookmarkButton.addEventListener('click', () => {
                    saveToPochList(id, title, author, description, image);
                });
            }
    
            searchResults.appendChild(bookElement);
        });
    }
    
    function saveToPochList(id, title, author, description, image) {
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

    function removeFromPochList(bookId) {
        let pochList = JSON.parse(sessionStorage.getItem('pochList')) || [];
        pochList = pochList.filter(book => book.id !== bookId);
        sessionStorage.setItem('pochList', JSON.stringify(pochList));
        displayPochList(); // This should only update the personal list, not the search results
    }

    function displayPochList() {
        // Remove previous poch'liste display if any
        const pochListContainer = document.getElementById('pochListContainer');
        if (pochListContainer) {
            pochListContainer.remove();
        }

        // Create a new container for poch'liste
        const newPochListContainer = document.createElement('div');
        newPochListContainer.id = 'pochListContainer';
        newPochListContainer.className = 'pochlist-content'; // Add the class for styling
        contentDiv.appendChild(newPochListContainer);

        const pochList = JSON.parse(sessionStorage.getItem('pochList')) || [];

        if (pochList.length === 0) {
            newPochListContainer.textContent = 'Aucune livre dans la poch\'liste';
            return;
        }

        pochList.forEach(book => {
            const bookElement = document.createElement('div');
            bookElement.className = 'book';

            bookElement.innerHTML = `
              <div class="book-content">
                  <h3>${book.title}</h3>
                  <p><strong>ID:</strong> <strong>${book.id}</strong></p>
                  <p>Auteur: ${book.author}</p>
                  <p>${book.description}</p>
              </div>
              <img src="${book.image}" alt="Couverture du livre" class="book-cover">
              <button class="button-icon remove-button"><img src="images/trash.png" alt="Supprimer"></button>
             `;

            const removeButton = bookElement.querySelector('.remove-button');
            if (removeButton) {
                removeButton.addEventListener('click', () => {
                    removeFromPochList(book.id);
                });
            }

            newPochListContainer.appendChild(bookElement);
        });
    }

    // Initial display of the poch'list on page load
    displayPochList();
});
