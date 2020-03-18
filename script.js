"use strict";
window.addEventListener("DOMContentLoaded", init);

const apiBase = "https://frontend.natmus.dk/api/";
let searchSize = 12;
const HTML = {};

function init(){
    // search bar
    HTML.inputBoxes = document.querySelectorAll("input[type=search]");
    HTML.inputBoxes.forEach(inputBox => {
        inputBox.addEventListener("keyup", search);
    })
    // list of items
    HTML.itemTemplate = document.querySelector(".templates");
    HTML.dataList = document.querySelector("#dataList");
    // error and load more
    HTML.errorMsg = document.querySelector("body > div.container > div.text-danger");
    HTML.loadMoreBtn = document.querySelector("body > div.container > button");
    HTML.loadMoreBtn.addEventListener("click", loadMore);
    // modal
    HTML.modal = document.querySelector("#infoModal");
    HTML.title = HTML.modal.querySelector('.modal-title');
    HTML.collection = HTML.modal.querySelector('.collection');
    HTML.identification = HTML.modal.querySelector('.identification');
    HTML.imgTemplate = document.querySelector(".imgTemplate");
    HTML.imgContainer = HTML.modal.querySelector(".carousel-inner");
    HTML.listItemTemplate = document.querySelector(".listItemTemplate");
    HTML.descriptionContainer = HTML.modal.querySelector("div.modal-body > div:nth-child(3)");
    HTML.descriptionList = HTML.descriptionContainer.querySelector("ul");
    HTML.materialContainer = HTML.modal.querySelector("div.modal-body > div:nth-child(4)");
    HTML.materialList = HTML.materialContainer.querySelector("ul");
    HTML.measurementContainer = HTML.modal.querySelector("div.modal-body > div:nth-child(5)");
    HTML.measurementList = HTML.measurementContainer.querySelector("ul");
}

// helper function for search() and show modal function
function escapeChars(word){
    if(typeof word === "string" && word.indexOf("/") !== -1){
        // replace all occurrences of '/' https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#Using_Special_Characters
        return word.replace(/[/]/g,'\\/');
    }else{
        return word;
    }
}

// helper function for search()
function buildUrl(input, query){
    // resgister whether the search is by title, collection, etc.
    let queryUrl = query;
    const aWords = input.split(" ");
    aWords.forEach(word => {
        // add colon before first word, add AND before any extra words (excluding spaces)
        if(word === aWords[0]){
            queryUrl += `:${word}`;
        }else if(word !== ""){
            queryUrl += ` AND ${word}`;
        }
    })
    return queryUrl;
}

// generate request url for multiple search queries
function search(){
    if(HTML.inputBoxes[0].value || HTML.inputBoxes[1].value || HTML.inputBoxes[2].value){
        let queryUrl = `${apiBase}Search?query=`;
        HTML.inputBoxes.forEach(inputBox => {
            if(inputBox.value){
                const input = escapeChars(inputBox.value);
                const query = inputBox.dataset.search;
                // if statement builds the 1st part of the queryUrl:
                // for search by identification only
                // for search by collection only or collection + identification
                // for any search that contains title
                if((!HTML.inputBoxes[0].value && !HTML.inputBoxes[1].value) 
                || (!HTML.inputBoxes[0].value && inputBox === HTML.inputBoxes[1]) 
                || inputBox === HTML.inputBoxes[0]){
                    queryUrl += buildUrl(input, query);
                }else{
                    queryUrl += " AND " + buildUrl(input, query);
                }
            }
        })
        getData(`${queryUrl}&size=${searchSize}`);  
    }
}

// generate response and check if ok, otherwise display error message
async function getData(requestUrl){
    const response = await fetch(requestUrl);
    if(response.status === 200){
        const jData = await response.json();
        showSearch(jData);
    }else{
        HTML.errorMsg.classList.remove("d-none");
    }
}

// helper function for showSearch() and setModalImgs()
function buildAltTxt(title){
    if(title){
        return title.toLowerCase();
    }
}

// display data
function showSearch(items){
        // build items from HTML template
        HTML.dataList.innerHTML = "";
        items.forEach(item => {
            const clone = HTML.itemTemplate.cloneNode(true).content;
            if(item.images && item.images.length !== 0){
                const img = clone.querySelector("img");
                img.src = `https://frontend.natmus.dk/api/Image?id=${item.images[0]}`;
                img.alt = buildAltTxt(item.title);
            }
            clone.querySelector(".card-title").textContent = item.title;
            clone.querySelector(".card-subtitle").textContent = item.identification;
            clone.querySelector(".collection").textContent = item.collection;
            // show button if item has descriptions, materials, measurements or more than 1 image
            if(item.descriptions && item.descriptions.length !==0 
            || item.materials && item.materials.length !== 0 
            || item.measurements && item.measurements.length !== 0
            || item.images && item.images.length > 1){
                const btn = clone.querySelector(".btn");
                btn.dataset.id = item.id;
                btn.dataset.identification = item.identification;
                btn.classList.remove("d-none");
            }
            HTML.dataList.appendChild(clone);
        })
        // remove error message if new response is ok
        if(!HTML.errorMsg.classList.contains("d-none")){
            HTML.errorMsg.classList.add("d-none");
        }
        // show load more button if all search results are not on display
        if(items.length === searchSize){
            HTML.loadMoreBtn.classList.remove("d-none");
        }else{
            HTML.loadMoreBtn.classList.add("d-none");
        }
}

// add 12 to searchSize global variable
function loadMore(){
    searchSize += 12;
    search();
}

// ---------------------------------- Modal ----------------------------------

// jQuery taken from https://getbootstrap.com/docs/4.4/components/modal/#varying-modal-content
$('#infoModal').on('show.bs.modal', function (event) {
    const button = $(event.relatedTarget); // Button that triggered the modal
    const itemId = button.data('id'); // Extract info from data-* attributes
    const itemId2 = escapeChars(button.data('identification'));
    // Update the modal's content
    $.ajax({
        url: `${apiBase}Search`,
       data: {query:`id:${itemId} AND identification:${itemId2}`}
      }).done(function(jData){
        const item = jData[0];
        HTML.title.textContent = item.title;
        HTML.collection.textContent = item.collection;
        HTML.identification.textContent = item.identification;
        if(item.images && item.images.length !== 0){
            setModalImgs(item.images, item.title);
        }
        if(item.descriptions && item.descriptions.length !==0){
            setModalList(item.descriptions, HTML.descriptionContainer, HTML.descriptionList);
        }
        if(item.materials && item.materials.length !==0){
            setModalList(item.materials, HTML.materialContainer, HTML.materialList);
        }
        if(item.measurements && item.measurements.length !==0){
            setModalList(item.measurements, HTML.measurementContainer, HTML.measurementList);
        }
      })
  })

function setModalImgs(images, title){
    // build carousel items from HTML template
    HTML.imgContainer.innerHTML = "";
    images.forEach(img => {
        const clone = HTML.imgTemplate.cloneNode(true).content;
        clone.querySelector("img").src =`https://frontend.natmus.dk/api/Image?id=${img}`;
        clone.querySelector("img").alt = buildAltTxt(title);
        if(img === images[0]){
            clone.querySelector(".carousel-item").classList.add("active");
        }
        HTML.imgContainer.appendChild(clone);
    })
}

// helper function for setModalList()
function buildString(oData){
    let newString = "";
    if(oData.type){
        newString += oData.type;
        if(oData.color || oData.processing || oData.value || oData.unit){
            newString += ": ";
        }
    }
    if(oData.color){
        newString += oData.color;
        if(oData.processing){
            newString += ", ";
        }
    }
    if(oData.value){
        newString += oData.value + " ";  
    }
    if(oData.processing){
        newString += oData.processing;
    }
    if(oData.unit){
        newString += oData.unit;
    }
    return newString;
}

  function setModalList(data, displayBox, innerBox){
    displayBox.classList.remove("d-none");
    // build list items from HTML template
    innerBox.innerHTML = "";
    data.forEach(dataElement => {
        const clone = HTML.listItemTemplate.cloneNode(true).content;
        let text = dataElement;
        if(typeof text === "object"){
            text = buildString(dataElement);
        }
        clone.querySelector("li").textContent = text;
        innerBox.appendChild(clone);
    })
  }

// remove images and lists when closing modal
$('#infoModal').on('hide.bs.modal', function() {
    if(document.querySelector(".carousel-item")){
        while (HTML.imgContainer.hasChildNodes()) {  
            HTML.imgContainer.removeChild(HTML.imgContainer.firstChild);
        }
    }
    if(document.querySelector(".list-group-item")){
        HTML.descriptionContainer.classList.add("d-none");
        while (HTML.descriptionList.hasChildNodes()) {  
            HTML.descriptionList.removeChild(HTML.descriptionList.firstChild);
        }
    }
})