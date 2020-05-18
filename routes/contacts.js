//express is the framework we're going to use to handle requests
const express = require('express')

//Access the connection to Heroku Database
let pool = require('../utilities/utils').pool

var router = express.Router()

//This allows parsing of the body of POST requests, that are encoded in JSON
router.use(require("body-parser").json())

/**
 * @apiDefine JSONError
 * @apiError (400: JSON Error) {String} message "malformed JSON in parameters"
 */

/**
 * @api {post} /contacts Request to add a contact to current user.
 * @apiName PostContacts
 * @apiGroup Contacts
 * 
 * @apiDescription Adds contact to user contacts
 * 
 * @apiHeader {String} authorization Valid JSON Web Token JWT
 * 
 * @apiParam {Number} memberId of the contact being added
 * 
 * @apiSuccess (Success 201) {boolean} success true when contact is added
 * 
 * @apiError (400: Unknown user) {String} message "unknown contact"
 * 
 * @apiError (400: Missing Parameters) {String} message "Missing required information"
 * 
 * @apiError (400: SQL Error) {String} message the reported SQL error details
 * 
 * @apiError (400: Unknow Member ID) {String} message "invalid member id"
 * 
 * @apiUse JSONError
 */
router.post("/", (request, response, next) => {
    // console.log("User token member id: " + request.decoded.memberid);
    // console.log("Contact memberId adding : " + request.body.memberId);

    //validate on empty parameters
    if (!request.body.memberId) {
        response.status(400).send({
            message: "Missing required information"
        })
    } else if (isNaN(request.body.memberId)) {
        response.status(400).send({
            message: "Malformed parameter. memberId must be a number"
        })
    } else {
        next()
    }
}, (request, response, next) => {
    //validate if member exists
    let query = 'SELECT * FROM Members WHERE MemberID=$1'
    let values = [request.body.memberId]

    pool.query(query, values)
        .then(result => {
            if (result.rowCount == 0) {
                response.status(404).send({
                    message: "Member trying to add does not exist"
                })
            } else {
                next()
            }
        }).catch(error => {
            response.status(400).send({
                message: "SQL Error on memberId check",
                error: error
            })
        })
}, (request, response) => {
    //add the contact
    let insert = `INSERT INTO Contacts(MemberID_A, MemberID_B) VALUES($1, $2)`
    let values = [request.decoded.memberid, request.body.memberId]
    pool.query(insert, values)
        .then(result => {
            if (result.rowCount == 1) {
                //insertion success. Attach the message to the Response obj
                response.send({
                    success: true
                })
            } else {
                response.status(400).send({
                    "message": "unknown error"
                })
            }

        }).catch(err => {
            response.status(400).send({
                message: "SQL Error on insert",
                error: err
            })
        })
})

/**
 * @api {get} /contacts/contact/:memberId? Request to get contact info specific contact
 * @apiName GetContact
 * @apiGroup Contacts
 * 
 * @apiDescription Request to get contact info on specific contact
 * 
 * @apiParam {Number} memberId the contact to get info for 
 * 
 * @apiSuccess {String} contacts.email The email of the contact
 * @apiSuccess {String} contacts.memberId The id of the contact
 * @apiSuccess {String} contacts.firstName The first name of the contact
 * @apiSuccess {String} contacts.lastName The last name of the contact
 * @apiSuccess {String} contacts.userName The user name of the contact
 * 
 * @apiError (404: memberId Not Found) {String} message "Contact not found"
 * @apiError (400: Invalid Parameter) {String} message "Malformed parameter. memberId must be a number" 
 * @apiError (400: Missing Parameters) {String} message "Missing required information"
 * 
 * @apiError (400: SQL Error) {String} message the reported SQL error details
 * 
 * @apiUse JSONError
 */
router.get("/contact/:memberId?", (request, response, next) => {
    console.log("/contacts/" + request.params.memberId);
    if (!request.params.memberId) {
        response.status(400).send({
            message: "Missing required information"
        })
    } else if (isNaN(request.params.memberId)) {
        response.status(400).send({
            message: "Bad token. memberId must be a number"
        })
    } else {
        next()
    }
}, (request, response) => {
    //Get contact info
    let query = 'SELECT * FROM Members WHERE MemberID=$1'
    let values = [request.params.memberId]

    pool.query(query, values)
        .then(result => {
            if (result.rowCount == 0) {
                response.status(404).send({
                    message: "Contact not found"
                })
            } else {
                response.send({
                    email: result.rows[0].email,
                    memberId: result.rows[0].memberid,
                    firstName: result.rows[0].firstname,
                    lastName: result.rows[0].lastname,
                    userName: result.rows[0].username
                })
            }
        }).catch(error => {
            response.status(400).send({
                message: "SQL Error",
                error: error
            })
        })
});

/**
 * @api {get} /contacts Request to get list of contacts 
 * @apiName GetContacts
 * @apiGroup Contacts
 * 
 * @apiDescription Request to get list of contacts
 * 
 * @apiSuccess {Object[]} contacts List of contacts
 * 
 * @apiError (404: memberId Not Found) {String} message "member ID Not Found"
 * 
 * @apiError (400: SQL Error) {String} message the reported SQL error details
 * 
 * @apiUse JSONError
 */
router.get("/", (request, response, next) => {
    console.log("/contacts");
    // console.log("User token member id: " + request.decoded.memberid);
    if (!request.decoded.memberid) {
        response.status(400).send({
            message: "Missing required information"
        })
    } else if (isNaN(request.decoded.memberid)) {
        response.status(400).send({
            message: "Malformed parameter. memberId must be a number"
        })
    } else {
        next()
    }
}, (request, response) => {
    //Get contact info
    let query = 'SELECT MemberID_B, Members.FirstName, Members.LastName, Members.email, Members.Username FROM Contacts INNER JOIN Members ON Contacts.MemberID_B = Members.MemberID where Contacts.MemberID_A = $1'
    let values = [request.decoded.memberid]

    pool.query(query, values)
        .then(result => {
            if (result.rowCount == 0) {
                response.status(404).send({
                    message: "Contact not found"
                })
            } else {
                let listContacts = [];
                result.rows.forEach(entry =>
                    listContacts.push(
                        {
                            "email": entry.email,
                            "firstName": entry.firstname,
                            "lastName": entry.lastname,
                            "userName": entry.username,
                            "memberId": entry.memberid_b
                        }
                    )
                )
                response.send({
                    success: true,
                    contacts: listContacts
                })
            }
        }).catch(error => {
            response.status(400).send({
                message: "SQL Error",
                error: error
            })
        })
});

/**
 * @api {get} /contacts/contact/:memberId? Request to delete contact 
 * @apiName DeleteContact
 * @apiGroup Contacts
 * 
 * @apiDescription Request to delete contact 
 * 
 * @apiParam {Number} memberId deleting 
 * 
 * @apiSuccess {boolean} success true when the name is deleted
 * 
 * @apiError (404: memberId Not Found) {String} message "Contact not found"
 * @apiError (400: Invalid Parameter) {String} message "Malformed parameter. memberId must be a number" 
 * @apiError (400: Missing Parameters) {String} message "Missing required information"
 * 
 * @apiError (400: SQL Error) {String} message the reported SQL error details
 * 
 * @apiUse JSONError
 */
router.delete("/contact/:memberId?", (request, response, next) => {
    console.log("/contacts/" + request.params.memberId);
    if (!request.params.memberId) {
        response.status(400).send({
            message: "Missing required information"
        })
    } else if (isNaN(request.params.memberId)) {
        response.status(400).send({
            message: "Bad token. memberId must be a number"
        })
    } else {
        next()
    }
}, (request, response) => {
    // Delete contact
    let query = 'DELETE FROM Contacts WHERE MemberID_A=$1 and MemberID_B=$2'
    let values = [request.decoded.memberid, request.params.memberId]

    pool.query(query, values)
        .then(result => {
            response.send({
                success: true
            })
        }).catch(error => {
            response.status(400).send({
                message: "SQL Error",
                error: error
            })
        })
});




/**
 * @api {get} /contacts/chats Request to get list of recent chats from contacts 
 * @apiName GetContactChats
 * @apiGroup Contacts
 * 
 * @apiDescription Request to get list of chats for contacts
 * 
 * @apiSuccess {Object[]} List of chats with recent message
 * 
 * @apiError (404: memberId Not Found) {String} message "member ID Not Found"
 * 
 * @apiError (400: SQL Error) {String} message the reported SQL error details
 * 
 * @apiUse JSONError
 */
router.get("/chats", (request, response, next) => {
    console.log("/contacts/chats");
    console.log("User memberID: " + request.decoded.memberid);
    if (!request.decoded.memberid) {
        response.status(400).send({
            message: "Missing required information"
        })
    } else if (isNaN(request.decoded.memberid)) {
        response.status(400).send({
            message: "Malformed parameter. memberId must be a number"
        })
    } else {
        next()
    }
}, (request, response) => {
    //Get contact info
    // let query = 'SELECT MemberID_B, Members.FirstName, Members.LastName, Members.email, Members.Username FROM Contacts INNER JOIN Members ON Contacts.MemberID_B = Members.MemberID where Contacts.MemberID_A = $1'
    // let query = 'SELECT ChatID, MemberID FROM ChatMembers where MemberID=$1'
    // let query = 'SELECT ChatID, MemberID FROM ChatMembers where ChatID in (SELECT ChatID FROM ChatMembers where MemberID=$1) AND MemberID != $1'
    // let query = 'SELECT FirstName, LastName, Username, Email, MemberID FROM Members where MemberID in (SELECT MemberID FROM ChatMembers where ChatID in (SELECT ChatID FROM ChatMembers where MemberID=$1) AND MemberID != $1)'
    let query = 'SELECT FirstName, LastName, Username, Email, ChatID FROM Members INNER JOIN ChatMembers ON ChatMembers.MemberID = Members.MemberID  where ChatMembers.MemberID in (SELECT MemberID FROM ChatMembers where ChatID in (SELECT ChatID FROM ChatMembers where MemberID=$1) AND MemberID != $1)'
    let values = [request.decoded.memberid]

    pool.query(query, values)
        .then(result => {
            if (result.rowCount == 0) {
                response.status(404).send({
                    message: "No messages"
                })
            } else {
                let listContactChats = [];
                result.rows.forEach(entry =>
                    listContactChats.push(
                        {
                            "chat": entry.chatid,
                            "firstName": entry.firstname,
                            "lastName": entry.lastname,
                            "userName": entry.username,
                            "memberId": entry.memberid
                        }
                    )
                )
                response.send({
                    success: true,
                    contacts: listContactChats
                })
            }
        }).catch(error => {
            console.log(error);
            response.status(400).send({
                message: "SQL Error",
                error: error
            })
        })
});

module.exports = router

