// helper function for search() and show modal function
export function escapeChars(word){
    if(typeof word === "string" && word.indexOf("/") !== -1){
        // replace all occurrences of '/' with regular expression
        return word.replace(/[/]/g,'\\/');
    }else{
        return word;
    }
}

// helper function for search()
export function buildUrl(input, query){
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

// helper function for showSearch() and setModalImgs()
export function buildAltTxt(title){
    if(title){
        return title.toLowerCase();
    }
}

// helper function for setModalList()
export function buildString(oData){
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