document.addEventListener('DOMContentLoaded', () => {
    const myBooksDiv = document.getElementById('myBooks');
    const pochListHeader = document.querySelector('#content h2');
    const contentDiv = document.getElementById('content');

    // Create and add the "Add a book" button
    const addButton = document.createElement('button');
    addButton.textContent = 'Ajouter un livre';
    addButton.className = 'roboto-medium';
    addButton.onclick = showSearchForm;
    myBooksDiv.insertBefore(addButton, myBooksDiv.querySelector('hr'));

    // Add event listener to "Ma poch'liste" header to show the poch'liste
    pochListHeader.style.cursor = 'pointer';
    pochListHeader.onclick = showPochList;

    function showSearchForm() {
        // Hide the addButton and the contentDiv
        addButton.style.display = 'none';
        const pochListContent = document.querySelector('#content .pochlist-content');
        if (pochListContent) {
            pochListContent.style.display = 'none'; // Hide the pochlist content
        }

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
        // Show the addButton and the contentDiv
        addButton.style.display = 'block';
        const pochListContent = document.querySelector('#content .pochlist-content');
        if (pochListContent) {
            pochListContent.style.display = 'none'; // Hide the pochlist content
        }
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
        searchResults.id = 'searchResults';
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
            const description = book.volumeInfo.description ?
                (book.volumeInfo.description.length > 200 ?
                    book.volumeInfo.description.substring(0, 200) + '...' :
                    book.volumeInfo.description
                ) : 'Information manquante';
            const image = book.volumeInfo.imageLinks ? book.volumeInfo.imageLinks.thumbnail : 'images/unavailable.png';

            bookElement.innerHTML = `
                <h3>${title}</h3>
                <p><strong>ID:</strong> ${id}</p>
                <p><strong>Auteur:</strong> ${author}</p>
                <p>${description}</p>
                <img src="${image}" alt="Couverture du livre" class="book-cover">
                <button class="bookmark-button">Bookmark</button>
            `;

            // Add event listener to bookmark button
            bookElement.querySelector('.bookmark-button').addEventListener('click', () => saveToPochList(id, title, author, description, image));

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
    }

    function showPochList() {
        // Hide the search form and search results
        hideSearchForm();
        displayPochList();
    }

    function hidePochList() {
        const pochListContent = document.querySelector('#content .pochlist-content');
        if (pochListContent) {
            pochListContent.style.display = 'none'; // Hide the pochlist content
        }
    }

    function displayPochList() {
        hidePochList();

        const pochListDiv = document.querySelector('#content');
        const pochListContent = document.createElement('div');
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
                <p><strong>ID:</strong> ${book.id}</p>
                <p><strong>Auteur:</strong> ${book.author}</p>
                <p>${book.description}</p>
                <img src="${book.image}" alt="Couverture du livre" class="book-cover">
            `;

            pochListContent.appendChild(bookElement);
        });
    }

    // Initial display of the poch'list on page load
    hidePochList();
});
