function storageAvailable(type) {
    var storage;
    try {
        storage = window[type];
        var x = '__storage_test__';
        storage.setItem(x, x);
        storage.removeItem(x);
        return true;
    }
    catch(e) {
        return e instanceof DOMException && (
            // everything except Firefox
            e.code === 22 ||
            // Firefox
            e.code === 1014 ||
            // test name field too, because code might not be present
            // everything except Firefox
            e.name === 'QuotaExceededError' ||
            // Firefox
            e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
            // acknowledge QuotaExceededError only if there's something already stored
            (storage && storage.length !== 0);
    }
}

class Library{

    constructor(){
        this.shelf=[];
    };

    getShelf(){
        return this.shelf;
    }

    setShelf(shelf){
        this.shelf=shelf;
    }

    addToLibrary(book){
        if(this.shelf.length<=0){
        book.setIndex(0);
        }else{
        let maxIndexBook = this.shelf.reduce((accumulator, currentValue) =>
            (accumulator.index > currentValue.index) ? accumulator: currentValue);
        book.setIndex(maxIndexBook.index+1);
        }
        this.shelf.push(book);
    };
    
    toggleRead(index){
        this.shelf[index].isRead = this.shelf[index].isRead ? false: true;
    }
}

class Book{
    
    constructor(title, author, pages, isRead){
    this.title=title;
    this.author=author;
    this.pages=pages;
    this.isRead=isRead;
    this.index=-1;
    };

    getIndex(){
        return this.index;
    };

    setIndex(index){
        this.index=index;
        return;
    };

    verboseIsRead(){
        return this.isRead ? 'Read already' : 'Not read yet';
    };

    info(){
        return(`${this.title} by ${this.author}, ${this.pages} pages, ${this.verboseIsRead()}`);
    }
};


let myLibrary=new Library();
let loadedLibrary=new Library();

/*Copy loadedLibrary into active myLibrary if available*/
if (storageAvailable('localStorage')) {
    if(localStorage.getItem('library')!==null){
        loadedLibrary.setShelf(JSON.parse(localStorage.getItem('library')));
    }else{
        loadedLibrary=myLibrary;
    };
  }
  else {
    loadedLibrary=myLibrary;
  };

for(let i=0; i<loadedLibrary.getShelf().length; i++){
    myLibrary.addToLibrary(new Book(loadedLibrary.getShelf()[i].title, loadedLibrary.getShelf()[i].author, loadedLibrary.getShelf()[i].pages, loadedLibrary.getShelf()[i].isRead, loadedLibrary.getShelf()[i].isRead));
}


const catalog = document.querySelector("#catalog");
const inputTitle = document.querySelector('#inputTitle');
const inputAuthor = document.querySelector('#inputAuthor');
const inputPages = document.querySelector('#inputPages');
const inputIsRead = document.querySelector('#inputIsRead');
const newBookBtn = document.querySelector('#newBookBtn');
const saveBtn = document.querySelector('#saveBtn');
const inputForm = document.querySelector("#topmenu");

inputTitle.addEventListener('input', () => {
    inputTitle.setCustomValidity('');
    inputTitle.checkValidity();
    });
inputTitle.addEventListener('invalid', () => {
        if(inputTitle.value === '') {
            inputTitle.setCustomValidity('The Title is required.');
        } else {
            inputTitle.setCustomValidity('The Title can only contain upper and lowercase letters.');
        }
    });

inputAuthor.addEventListener('input', () => {
    inputAuthor.setCustomValidity('');
    inputAuthor.checkValidity();
    });
inputAuthor.addEventListener('invalid', () => {
        if(inputAuthor.value === '') {
            inputAuthor.setCustomValidity('The Author is required.');
        } else {
            inputAuthor.setCustomValidity('The Author can only contain upper and lowercase letters.');
        }
    });



function renderCatalog(library){
    let bookTable = document.createElement("table");
    bookTable.classList.add("bookTable");
    bookTable.setAttribute("id","bookTable");

    if(document.querySelector("#bookTable") != null){
        document.querySelector("#bookTable").remove();
    };
    /*catalog table header*/
    let headerRow = bookTable.insertRow(0);
    headerRow.innerHTML = `<th width="42%;">Title</th>
                            <th width="17%;">Author</th>
                            <th width="5%;">Pages</th>
                            <th width="16%;">Status</th>
                            <div width="20%;" class"=ghostCol"></div>`;
    /*catalog table data rows*/
    let dataRows = [];
    for(let i=0; i<library.getShelf().length; i++){
        dataRows[i] = bookTable.insertRow(i+1);
        dataRows[i].innerHTML = `<td>${library.getShelf()[i].title}</td>
                                <td>${library.getShelf()[i].author}</td>
                                <td>${library.getShelf()[i].pages}</td>
                                <td>${library.getShelf()[i].verboseIsRead()}<input id="inputRead${library.getShelf()[i].index}" type="checkbox" ${library.getShelf()[i].isRead ? "checked":""}></td>
                                <div class="ghostCol"><button id="btnRemove${library.getShelf()[i].index}">Remove</button></div>`;
        /* check and uncheck isRead */
        bookTable.querySelector(`#inputRead${library.getShelf()[i].index}`).addEventListener("change",function (){
            library.toggleRead(i);
            renderCatalog(library);
        });

        bookTable.querySelector(`#btnRemove${library.getShelf()[i].index}`).addEventListener("click",function(){
            if(confirm("Are you sure you want to remove that book?")){
                library.getShelf().splice(i,1);
                renderCatalog(library);
            };
        });

     };
    catalog.appendChild(bookTable);
}

newBookBtn.addEventListener("click",function(){
    console.log(`inputAuthor.checkValidity()=${inputAuthor.checkValidity()}`);
    if (!inputAuthor.checkValidity()){
        inputAuthor.reportValidity();;
    };

    console.log(`inputTitle.checkValidity()=${inputTitle.checkValidity()}`);
    if (!inputTitle.checkValidity()){
        inputTitle.reportValidity();
    };

    console.log(`inputForm.checkValidity()=${inputForm.checkValidity()}`); 
    if (!inputForm.checkValidity()){
    return null;
    };
    myLibrary.addToLibrary(new Book(inputTitle.value, inputAuthor.value, inputPages.value, inputIsRead.checked));
    inputTitle.value='';
    inputAuthor.value='';
    inputPages.value=null;
    inputIsRead.checked=false;
    renderCatalog(myLibrary);

});

saveBtn.addEventListener("click",function(){
    console.log('Library saved to local storage!');
    if (storageAvailable('localStorage')) {
        localStorage.setItem('library', JSON.stringify(myLibrary.getShelf()));
      }
      else {
        alert("No local storage available with this browser");
      }
});


/* render catalog on page first load */
renderCatalog(myLibrary);