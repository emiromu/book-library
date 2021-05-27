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

let myLibrary=[];
let loadedLibrary=[];

if (storageAvailable('localStorage')) {
    if(localStorage.getItem('library')!==null){
        loadedLibrary=JSON.parse(localStorage.getItem('library'));
    }else{
        loadedLibrary=myLibrary;
    };
  }
  else {
    loadedLibrary=myLibrary;
  };

for(let i=0; i<loadedLibrary.length; i++){
    myLibrary[i]=new book(loadedLibrary[i].title, loadedLibrary[i].author, loadedLibrary[i].pages, loadedLibrary[i].isRead);
    myLibrary[i].index = loadedLibrary[i].index;
}


const catalog = document.querySelector("#catalog");
const inputTitle = document.querySelector('#inputTitle');
const inputAuhtor = document.querySelector('#inputAuthor');
const inputPages = document.querySelector('#inputPages');
const inputIsRead = document.querySelector('#inputIsRead');
const newBookBtn = document.querySelector('#newBookBtn');
const saveBtn = document.querySelector('#saveBtn');

function book(title, author, pages, isRead){
    this.title=title;
    this.author=author;
    this.pages=pages;
    this.isRead=isRead;
     
    this.verboseIsRead = function(){
        return this.isRead ? 'Read already' : 'Not read yet';
    };

    this.info = function(){
        return(`${this.title} by ${this.author}, ${this.pages} pages, ${this.verboseIsRead()}`);
    }
};

function addToLibrary(library,book){
    if(library.length<=0){
    book.index=0;
    }else{
    let maxIndexBook = library.reduce((accumulator, currentValue) =>
        (accumulator.index > currentValue.index) ? accumulator: currentValue);
    book.index=maxIndexBook.index+1;
    }
    library.push(book);
};

function toggleRead(library,index){
    library[index].isRead = library[index].isRead ? false: true;
}

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
    for(let i=0; i<library.length; i++){
        dataRows[i] = bookTable.insertRow(i+1);
        dataRows[i].innerHTML = `<td>${library[i].title}</td>
                                <td>${library[i].author}</td>
                                <td>${library[i].pages}</td>
                                <td>${library[i].verboseIsRead()}<input id="inputRead${library[i].index}" type="checkbox" ${library[i].isRead ? "checked":""}></td>
                                <div class="ghostCol"><button id="btnRemove${library[i].index}">Remove</button></div>`;
        /* check and uncheck isRead */
        bookTable.querySelector(`#inputRead${library[i].index}`).addEventListener("change",function (){
            toggleRead(library,i);
            renderCatalog(library);
        });

        bookTable.querySelector(`#btnRemove${library[i].index}`).addEventListener("click",function(){
            if(confirm("Are you sure you want to remove that book?")){
                library.splice(i,1);
                renderCatalog(library);
            };
        });

     };
    catalog.appendChild(bookTable);
}

newBookBtn.addEventListener("click",function(){
    if(inputTitle.value==='' || inputAuhtor.value==='' || inputPages.value<=0){
        alert("Please enter all values before adding a book");
        return null;
    };
    addToLibrary(myLibrary,new book(inputTitle.value, inputAuhtor.value, inputPages.value, inputIsRead.checked));
    inputTitle.value='';
    inputAuhtor.value='';
    inputPages.value=null;
    inputIsRead.checked=false;
    renderCatalog(myLibrary);

});

saveBtn.addEventListener("click",function(){
    console.log('Library saved to local storage!');
    if (storageAvailable('localStorage')) {
        localStorage.setItem('library', JSON.stringify(myLibrary));
      }
      else {
        alert("No local storage available with this browser");
      }
});




/* default books for testing */
/*
const defaultbook1 = new book('The Sailor Who Fell from Grace with the Sea','Yukio Mishima',181,true);
const defaultbook2 = new book('Twilight','Stephenie Meyer',498,false);
const defaultbook3 = new book('Children of Dune','Frank Herbert',444,true);
addToLibrary(myLibrary,defaultbook1);
addToLibrary(myLibrary,defaultbook2);
addToLibrary(myLibrary,defaultbook3);*/
/* * */

/* render catalog on page first load */
renderCatalog(myLibrary);