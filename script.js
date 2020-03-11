"use strict";
window.addEventListener("DOMContentLoaded", init);

let userInput = document.querySelector("body > input[type=text]");
//the prototype for all items, measurements and materials
const Item = {
    id: null,
    collection: null,
    identification: null,
    title: null,
    descriptions: [],
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
    const apiBase = "https://frontend.natmus.dk/api/Search";
    const requestUrl = apiBase + "?query=" + userInput.value;
    //console.log(requestUrl);
    getData(requestUrl);
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
        clone.querySelector(".title").textContent = item.title;
        clone.querySelector(".collection").textContent = item.collection;
        clone.querySelector(".listItem").dataset.id = item.id;
        dataList.appendChild(clone);
    })
}