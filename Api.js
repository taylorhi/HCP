/**
 * Simple Program to transform user data from "https://jsonplaceholder.typicode.com/users"
 * into an acceptable manner for HCP
 */
const fetch = require("node-fetch");

const username = "taylorhisaacson@gmail.com";
const password = "Yivi9083#";
const usersEndpoint = "https://jsonplaceholder.typicode.com/users";
const homeCarePulseEndpoint = "https://dev.app.homecarepulse.com/Primary/?FlowId=7423bd80-cddb-11ea-9160-326dddd3e106&Action=api";

fetch(usersEndpoint)
    .then(response => response.json())
    .then(json => parseUsers(json))
    .then(users => sendUsers(users));


/**
 * parses the response from the users endpoint and transforms the users in a way that is
 * acceptable to the HCP endpoint
 * 
 * @param json the json response that comes from the users endpoint 
 * @returns array
 */
function parseUsers(json) {
    let users = [];
    json.forEach(function(user) {
        let firstName = parseName(user.name, true);
        let lastName = parseName(user.name, false);
        let companyName = user.company.name;
        let address = `${user.address.street}, ${user.address.city}, ${user.address.state}, ${user.address.zipcode}`;
        let website = user.website;
        let phone = sanitizePhone(user.phone);

        users.push( {first_Name:firstName, 
                    last_name:lastName,     
                    company_name: companyName, 
                    company_full_address: address,
                    website: website,
                    phone: phone});
    });

    return users;
}

/**
 * parses name and returns either first or last name
 * 
 * @param fullName full name of the user 
 * @param needFirst boolean used to determine if the first or last name is needed 
 * @returns string
 */
function parseName(fullName, needFirst) {
    fullName = fullName.split(' ');
    let abbreviatedFullName = [];
    fullName.forEach( function(name) {
        // if name is not a title or generational suffix don't include
        if (!name.includes('.') && !isRomanNumeral(name)) {
            abbreviatedFullName.push(name);
        }        
    });
    return needFirst ? abbreviatedFullName[0] : abbreviatedFullName[abbreviatedFullName.length - 1];
}

/**
 * checks if the string is a roman numeral
 * 
 * @param str a string 
 * @returns boolean
 */
function isRomanNumeral(str) {
    expression = /^(IX|IV|V?I{0,3})$/;
    return expression.test(str);
}

/**
 * used to sanitize a phone number to be a standard 10 digit number
 * 
 * @param phone phone number 
 * @returns string
 */
function sanitizePhone(phone) {
    // remove international code
    if (phone.substring(0, 2) == "1-") {
        phone = phone.substring(2, phone.length);
    }
    //strip anything that's not a number
    phone = phone.replace(/[^\d]/g, '');
    phone = phone.substring(0, 10);
    return phone;
}

/**
 * makes a request and sends users to the HCP endpoint
 * 
 * @param users an array of users
 */
function sendUsers(users) {
    const body = {
        userid: username,
        password: password,
        outputtype: "JSON",
        users: users
    };
    const options = {
        method: 'POST',
        body: JSON.stringify(body)
    };
    fetch(homeCarePulseEndpoint, options)
        .then(response => response.json())
        .then(json => {console.log(JSON.stringify(json))});
}