"use strict";
window.addEventListener("DOMContentLoaded", init);

const userInput = document.querySelector("input[type=search]");
const apiBase = "https://frontend.natmus.dk/api/";
//the prototypes for all items, measurements and materials
const Item = {
    id: null,
    collection: null,
    identification: null,
    title: null,
    descriptions: null,
    images: [],
    materials: [],
    measurements: []
};
const Measurement = {
    type: null,
    value: null,
    unit: null
};
const Material = {
    type: null,
    color: null,
    processing: null
};

function init(){
    userInput.addEventListener("keyup", search);
}

function search(){
    if(userInput.value){
        const requestUrl = `${apiBase}Search?query=${userInput.value}`;
        //console.log(requestUrl);
        getData(requestUrl);
    }
}

async function getData(api){
    const response = await fetch(api);
    const searchItems = await response.json();
    //console.log(searchItems);
    showSearch(searchItems);
}

function showSearch(items){
    const itemTemplate = document.querySelector(".templates");
    const dataList = document.querySelector("#dataList");

    dataList.innerHTML = "";

    items.forEach(item => {
        const clone = itemTemplate.cloneNode(true).content;
        if(item.images && item.images.length !== 0){
            const img = clone.querySelector("img");
            img.src = `https://frontend.natmus.dk/api/Image?id=${item.images[0]}`;
            img.alt = item.title.toLowerCase();
        }
        clone.querySelector(".card-title").textContent = item.title;
        clone.querySelector(".collection").textContent = item.collection;
        clone.querySelector(".identification").textContent = item.identification;
        //console.log(item.title, item.descriptions, item.materials, item.measurements);
        if(item.descriptions && item.descriptions.length !==0 
        || item.materials && item.materials.length !== 0 
        || item.measurements && item.measurements.length !== 0){
            const btn = clone.querySelector(".btn");
            btn.dataset.id = item.id;
            btn.classList.add("d-block");
            btn.addEventListener("click", openModal);
        }
        dataList.appendChild(clone);
    })
}

function openModal(){
    console.log(this.dataset.id);
}

//modal taken from https://getbootstrap.com/docs/4.4/components/modal/#varying-modal-content
$('#infoModal').on('show.bs.modal', function (event) {
    const button = $(event.relatedTarget) // Button that triggered the modal
    const itemId = button.data('id') // Extract info from data-* attributes
    // Update the modal's content with jQuery
    const modal = $(this)
    modal.find('.modal-title').text('Title of item ' + itemId)
    modal.find('.modal-body').text(itemId + ' content')
  })

//to do:
// modal content
// Search by name, image, collection, etc.
// show more search results button
// document code
// clean up data?