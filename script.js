"use strict";
window.addEventListener("DOMContentLoaded", init);

const apiBase = "https://frontend.natmus.dk/api/";
const HTML = {};

function init(){
    HTML.inputBoxes = document.querySelectorAll("input[type=search]");
    HTML.inputBoxes.forEach(inputBox => {
        inputBox.addEventListener("keyup", search);
    })
    // item list
    HTML.itemTemplate = document.querySelector(".templates");
    HTML.dataList = document.querySelector("#dataList");
    // modal
    HTML.modal = document.querySelector("#infoModal");
    HTML.title = HTML.modal.querySelector('.modal-title');
    HTML.collection = HTML.modal.querySelector('.collection');
    HTML.identification = HTML.modal.querySelector('.identification');
    HTML.imgTemplate = document.querySelector(".imgTemplate");
    HTML.imgContainer = HTML.modal.querySelector(".carousel-inner");
    HTML.listItemTemplate = document.querySelector(".listItemTemplate");
    HTML.descriptionContainer = HTML.modal.querySelector("div.modal-body > div:nth-child(2)");
    HTML.descriptionList = HTML.descriptionContainer.querySelector("ul");
    HTML.materialContainer = HTML.modal.querySelector("div.modal-body > div:nth-child(3)");
    HTML.materialList = HTML.materialContainer.querySelector("ul");
    HTML.measurementContainer = HTML.modal.querySelector("div.modal-body > div:nth-child(4)");
    HTML.measurementList = HTML.measurementContainer.querySelector("ul");
}

function escapeChars(word){
    if(typeof word === "string" && word.indexOf("/") !== -1){
        // replace all occurrences of '/' https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#Using_Special_Characters
        return word.replace(/[/]/g,'\\/');
    }else{
        return word;
    }
}

function buildUrl(input, query){
    // resgister on url whether the search is by title, collection, etc.
    let urlEnd = query;
    const aWords = input.split(" ");
    aWords.forEach(word => {
        // add colon before first search word, add AND before any extra words (excluding spaces)
        if(word === aWords[0]){
            urlEnd = `${urlEnd}:${word}`;
        }else if(word !== ""){
            urlEnd = `${urlEnd} AND ${word}`;
        }
    })
    return urlEnd;
}

function search(){
    const currentInputBox = this;
    if(currentInputBox.value){
        let requestUrl = `${apiBase}Search?query=`;
        HTML.inputBoxes.forEach(inputBox => {
            if(inputBox.value){
                const input = escapeChars(inputBox.value);
                const query = inputBox.dataset.search;
                if(inputBox === HTML.inputBoxes[0] || !HTML.inputBoxes[0].value){
                    requestUrl = requestUrl + buildUrl(input, query);
                }else{
                    requestUrl = requestUrl + " AND " + buildUrl(input, query);
                }
            }
        })
        getData(requestUrl);  
    }
}

async function getData(requestUrl){
    const response = await fetch(requestUrl);
    const jData = await response.json();
    showSearch(jData);
}

function showSearch(items){
    HTML.dataList.innerHTML = "";

    items.forEach(item => {
        const clone = HTML.itemTemplate.cloneNode(true).content;
        if(item.images && item.images.length !== 0){
            const img = clone.querySelector("img");
            img.src = `https://frontend.natmus.dk/api/Image?id=${item.images[0]}`;
            if(item.title){
                img.alt = item.title.toLowerCase();
            }
        }
        clone.querySelector(".card-title").textContent = item.title;
        clone.querySelector(".card-subtitle").textContent = item.identification;
        clone.querySelector(".collection").textContent = item.collection;
        if(item.descriptions && item.descriptions.length !==0 
        || item.materials && item.materials.length !== 0 
        || item.measurements && item.measurements.length !== 0){
            const btn = clone.querySelector(".btn");
            btn.dataset.id = item.id;
            btn.dataset.identification = item.identification;
            btn.classList.remove("d-none");
        }
        HTML.dataList.appendChild(clone);
    })
}

// ---------------------------------- Modal start ----------------------------------

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

$('#infoModal').on('hide.bs.modal', function() {
    // Remove modal images
    if(document.querySelector(".carousel-item")){
        while (HTML.imgContainer.hasChildNodes()) {  
            HTML.imgContainer.removeChild(HTML.imgContainer.firstChild);
        }
    }
    // Remove modal descriptions
    if(document.querySelector(".list-group-item")){
        HTML.descriptionContainer.classList.add("d-none");
        while (HTML.descriptionList.hasChildNodes()) {  
            HTML.descriptionList.removeChild(HTML.descriptionList.firstChild);
        }
    }
})

function setModalImgs(images, title){
    HTML.imgContainer.innerHTML = "";

    images.forEach(img => {
        const clone = HTML.imgTemplate.cloneNode(true).content;
        clone.querySelector("img").src =`https://frontend.natmus.dk/api/Image?id=${img}`;
        clone.querySelector("img").alt = title;
        if(img === images[0]){
            clone.querySelector(".carousel-item").classList.add("active");
        }
        HTML.imgContainer.appendChild(clone);
    })
}

function buildString(oData){
    let newString = "";
    if(oData.type){
        newString = newString + oData.type;
        if(oData.color || oData.processing || oData.value || oData.unit){
            newString = newString + ": ";
        }
    }
    if(oData.color){
        newString = newString + oData.color;
        if(oData.processing){
            newString = newString + ", ";
        }
    }
    if(oData.value){
        newString = newString + oData.value + " ";  
    }
    if(oData.processing){
        newString = newString + oData.processing;
    }
    if(oData.unit){
        newString = newString + oData.unit;
    }
    return newString;
}

  function setModalList(data, displayBox, innerBox){
    displayBox.classList.remove("d-none");
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

// ---------------------------------- Modal end ----------------------------------

//to do:
// load more results button
// document code
// add data types?
// clean up data?
// Search by identification