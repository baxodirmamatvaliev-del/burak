// console.log("Executed")




// # =========================================

// # You should create a function named confirmEnding that takes two parameters: the string to check and the string to check against.
// # The function should return true if the first string ends with the second string, and false otherwise.
// # You should not use the .endsWith() method
// # instead, use one of the JavaScript substring methods to achieve this.

// # confirmEnding("Congratulation", "on") should return true.
// # Waiting: 5. confirmEnding("Connor", "n") should return false.
// # Waiting: 6. confirmEnding("Walking on water and developing software from a specification are easy if both are frozen", "specification") should return false.
// # Waiting: 7. confirmEnding("He has to give me a new name", "name") should return true.


function confirmEnding(str1: string, str2: string) {
    const diff = str1.length - str2.length
    // console.log(diff)
    const slc = str1.slice(diff)
    // console.log(slc)

    if (slc == str2) {
        return true
    } else {
        return false
    }

}

console.log(confirmEnding("Congratulation", "on"))
console.log(confirmEnding("Walking on water and developing software from a specification are easy if both are frozen", "specification"))



// // You should have a function truncateString that accepts two arguments, the first one a string, the second one a number.
// // If the length of the string is more than the given number, the string should be truncated to reduce the length so that it is equal the given number, and ... should be appended at the end of the truncated string.
// // If the length of the string is equal to or lower than the given number, the string should be returned unchanged.


// //     truncateString("A-tisket a-tasket A green and yellow basket", 8) should return the string A - tisket....

// function truncateString(str: string, num: number) {
//     if (str.length > num) {
//         const sliced = str.slice(num, str.length)
//         // console.log(sliced)
//         const replaced = str.replace(sliced, "...")
//         return replaced
//     } else {
//         return str
//     }
// }


// console.log(truncateString("A-tisket a-tasket A green and yellow basket", 8))










// function booWho(bool: boolean | string | number) {
//     if (bool === true || bool === false) {
//         return true
//     } else {
//         return false
//     }
// }

// console.log(booWho(false))
// console.log(booWho(true))

// // dyncamic type tushunchasi bolganligi uchun call qilishda ham boshqa turdagi
// // qiymat beraolmaymiz aga tepada yoki bilan berilmagan bolsa
// console.log(booWho("HELLO"))
// console.log(booWho(1))

//================================================

// Build an Email Masker
// In this lab, you will mask the username part of an email address with asterisks.Masking is a term used to hide or replace sensitive information with asterisks or other characters.

// For example, if the email address was myEmail @email.com, then the masked email address will be m ***** l@email.com.

//     Objective: Fulfill the user stories below and get all the tests to pass to complete the lab.

// User Stories:

// Create a function named maskEmail that takes email as an argument.
// Inside the function, you should mask the email and append the domain name to it.Remember that you can use methods like slice, repeat, indexOf or even replace to help you.
// Outside the function, declare a variable named email to store the email address you want to mask.
// Call the maskEmail function with the email variable and output the result to the console.
//     maskEmail("apple.pie@example.com") should return "a*******e@example.com".
//         maskEmail("freecodecamp@example.com") should return "f**********p@example.com".
//             maskEmail("info@test.dev") should return "i**o@test.dev".
//                 maskEmail("user@domain.org") should return "u**r@domain.org".


// // const email: string = "azizbek00000@gmail.com"
// const email: string = "freecodecamp@example.com"

// function masker(email: string) {
//     let secondIndex: number = email.indexOf("@")
//     let sliced: string = email.slice(1, secondIndex)
//     // console.log(sliced)
//     return email.replace(sliced, "*")
// }

// console.log(masker(email))





// CLUSTER ==> DATABASE ==> COLLECTIONS ==> DOCUMENT




// console.log('====================================');
// console.log("Executed");
// console.log('====================================');

// // const person: string = "Kevin";
// // const age: number = 25;

// import moment from 'moment'

// const time = moment().format("YYYY MM DD")
// console.log(time)
// // interface setting type for objects

// interface Person {
//     name: string,
//     age: number
// }

// let person: Person = {
//     name: "Kevin",
//     age: 25
// };

// console.log(person.name)

// // person = {
// //     name: "Kevin",
// //     age: 25
// // }