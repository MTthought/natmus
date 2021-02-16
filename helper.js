// helper function for search()
export function escapeChars(word){
    if(typeof word === "string" && word.indexOf("/") !== -1){
        // replace all occurrences of '/' with regular expression
        return word.replace(/[/]/g,'\\/');
    }else{
        return word;
    }
}

// helper function for search()
export function buildQuery(input, field){
    // resgister whether search is by title, collection or identification
    let sQuery = field;
    const aWords = input.split(" ");
    // quotation marks output result containing the exact words
    if(field === "identification"){
        aWords.forEach(function(word, i) {
            word = `"${word}"`;
            aWords.splice(i, 1, word);
        })
    }
    aWords.forEach(word => {
        // add colon before first word, add AND before any extra words (excluding spaces)
        if(word === aWords[0]){
            sQuery += `:${word}`;
        }else if(word){
            sQuery += `%20AND%20${word}`;
        }
    })
    return sQuery;
}

// helper function for loadImg()
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
