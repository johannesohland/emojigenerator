document.addEventListener("DOMContentLoaded", event => {
    
})


// Function for signing in with google authentication
function signIn(){
    const provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider).then(result => {
        const user = result.user;
        getSaved(user.email); // Runs function to get the user-specific emojis
        currentUser = user.email; // Sets the current user so the saveEmoji function can use it
        $("#nameTitle").html("Welcome " + user.displayName); // Sets welcome message
        $("#loginArea").fadeOut(400, function(){ // Fades out the login area and then shows the main area
            $("#mainTag").slideDown();
        });
        
    })
}

var currentUser = "";
var row = 8;
var col = 8;
var id = 0;
var secondID = 0;
var html = "";



// Creates an array where the grid pixel values will be stored
var pixels = new Array(64).fill(0);

// Sets all values in the pixels array to 0 and re-generates the grid
function clearPixels(){    
    pixels.fill(0);
    generateGrid(row, col);
}

// Function for generating the main drawing grid
// creates a table with entries that have one of two classes based on the [pixels] value
function generateGrid(r,c){
    html = "<table style='display:flex;justify-content:center'>";
    for(var i = 0; i<r;i++){
        html = html + "<tr>";
        for(var j = 0; j<c; j++){
            id = i * 8 + j;
            if(pixels[id] == 0){
                html = html + `<td class='square1' id='${id}' onclick='changeState(${id})'></td>`;
            } else {
                html = html + `<td class='square2' id='${id}' onclick='changeState(${id})'></td>`;
            }
        }
        html = html + "</tr>";
    }
    html = html + "</table>";
    $("#mainDiv").html(html);
}


// Generates the html for the smaller saved grids
function generateSmallGrid(r,c,obj){
    var savedHTML = "<table style='display:flex;justify-content:center'>";
    secondID = 0;
    // Checks if the object is actually an array since it will be one when the saveEmoji() generates a new grid
    if(Array.isArray(obj)){
        for(var i = 0; i<r;i++){
            savedHTML = savedHTML + "<tr>";
            for(var j = 0; j<c; j++){
                
                secondID = i * 8 + j;
                if(obj[secondID] == 0){
                    savedHTML = savedHTML + `<td class='smallSquare1'></td>`;
                } else {
                    savedHTML = savedHTML + `<td class='smallSquare2'></td>`;
                }
            }
            savedHTML = savedHTML + "</tr>";
        }
        savedHTML = savedHTML + "</table>";
        //console.log(savedHTML);
        return savedHTML;
    }
    for(var i = 0; i<r;i++){
        savedHTML = savedHTML + "<tr>";
        for(var j = 0; j<c; j++){
            
            secondID = i * 8 + j;
            if(obj.data[secondID] == 0){
                savedHTML = savedHTML + `<td class='smallSquare1'></td>`;
            } else {
                savedHTML = savedHTML + `<td class='smallSquare2'></td>`;
            }
        }
        savedHTML = savedHTML + "</tr>";
    }
    savedHTML = savedHTML + "</table>";
    //console.log(savedHTML);
    return savedHTML;
}

// Changes the state of a pixel, the value is either 1 or 0 which decides the color of the pixel
function changeState(id){
    if(pixels[id] == 1){
        pixels[id] = 0;
    } else {
        pixels[id] = 1;
    }
    $("#mainDiv").html();
    generateGrid(row,col);
}

// Checks if the array contains only 0s or 1s
function checkIfEmpty(arr){
    var copy = [...arr];
    var sorted = copy.sort();
    if(sorted[0] == sorted[sorted.length - 1]){
        return true;
    };
    return false;
}

// Takes the currently active pixels array and pushes it into the database collection
function saveEmoji(){
    // Checks if the array is only one value, if so there is an error
    if(checkIfEmpty(pixels)){
        alert("Error: You can not save an empty or full grid. Please draw something instead :)");
        return;
    } else {
        const db = firebase.firestore();
        db.collection(currentUser).add({
            data:pixels
        })
        $("#savedArea").html($("#savedArea").html() + generateSmallGrid(row,col,pixels));
        clearPixels();
    }
}


// Takes the data as a parameter and emits it into emojis using the displaySaved function
function showData(d){
    $(generateSmallGrid(row,col,d.data())).appendTo("#savedArea")
}

// Gets the saved emojis from the database and passes them to the showData function
function getSaved(userEmail){
    const db = firebase.firestore();
    db.collection(userEmail).get().then((snapshot) => {
        snapshot.docs.forEach(doc => {
            showData(doc)
        })
    });
}

// Generates the main grid to draw on
generateGrid(row,col);