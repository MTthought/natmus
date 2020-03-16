"use strict";
window.addEventListener("DOMContentLoaded", init);

const userInput = document.querySelector("input[type=search]");
const apiBase = "https://frontend.natmus.dk/api/";
// the prototypes for all items, measurements and materials
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
        const requestUrl = `${apiBase}Search?query=title:${userInput.value}`;
        // console.log(requestUrl);
        getData(requestUrl);
    }
}

async function getData(requestUrl){
    const response = await fetch(requestUrl);
    const jData = await response.json();
    // console.log(jData);
    showSearch(jData);
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
        // console.log(item.title, item.descriptions, item.materials, item.measurements);
        if(item.descriptions && item.descriptions.length !==0 
        || item.materials && item.materials.length !== 0 
        || item.measurements && item.measurements.length !== 0){
            const btn = clone.querySelector(".btn");
            btn.dataset.id = item.id;
            btn.dataset.identification = item.identification;
            btn.classList.add("d-block");
        }
        dataList.appendChild(clone);
    })
}

function escapeChars(word){
    if(typeof word === "string" && word.indexOf("/") !== -1){
        return word.replace("/",'\\/');
    }else{
        return word;
    }
}

// Modal jQuery partly taken from https://getbootstrap.com/docs/4.4/components/modal/#varying-modal-content
$('#infoModal').on('show.bs.modal', function (event) {
    const button = $(event.relatedTarget); // Button that triggered the modal
    const itemId = button.data('id'); // Extract info from data-* attributes
    const itemId2 = escapeChars(button.data('identification'));
    const requestData = `id:${itemId} AND identification:${itemId2}`;
    // Update the modal's content
    $.ajax({
        url: `${apiBase}Search`,
       data: {query:requestData}
      }).done(function(jData){
        const modalItem = jData[0];
        const modal = $('#infoModal');
        modal.find('.modal-title').text(modalItem.title);
        modal.find('.collection').text(modalItem.collection);
        modal.find('.identification').text(modalItem.identification);
        if(modalItem.images && modalItem.images.length !== 0){
            setModalImgs(modalItem.images, modalItem.title);
        }
        if(modalItem.descriptions && modalItem.descriptions.length !==0){
            setModalDescriptions(modalItem.descriptions);
        }
      })
  })

// Remove modal images after closing
  $('#infoModal').on('hide.bs.modal', function() {
      if(document.querySelector(".carousel-item")){
        const imgContainer = document.querySelector(".carousel-inner");
        while (imgContainer.hasChildNodes()) {  
            imgContainer.removeChild(imgContainer.firstChild);
          }
    }
  })

  function setModalImgs(images, title){
    const imgTemplate = document.querySelector(".imgTemplate");
    const imgContainer = document.querySelector(".carousel-inner");
    imgContainer.innerHTML = "";

    images.forEach(img => {
        const cloneImg = imgTemplate.cloneNode(true).content;
        cloneImg.querySelector("img").src =`https://frontend.natmus.dk/api/Image?id=${img}`;
        cloneImg.querySelector("img").alt = title;
        if(img === images[0]){
            //console.log(images);
            cloneImg.querySelector(".carousel-item").classList.add("active");
        }
        imgContainer.appendChild(cloneImg);
    })
  }

  function setModalDescriptions(descriptions){
      console.log("descriptions: ", descriptions);
  }

//to do:
// modal descriptions, materials and measurements
// Search by name, image, collection, etc.
// load more results button
// document code
// add data types?
// clean up data?