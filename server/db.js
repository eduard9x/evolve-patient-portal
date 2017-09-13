var mysql = require('mysql');
// call dotenv.config here aswell as index.js because some unit tests enter here directly without accessing index.js
var dotenv = require('dotenv').config();

const database = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.DATABASENAME
});

database.connect(function(err) {
    if (err) throw err;
});

database.getMedications = function(userID, callback) {
    database.query(
        "SELECT userID, medicationID, medicationName, medicationType, startDate, endDate, dosage, instructions, prescribedDate, repeated " + 
        "FROM User NATURAL JOIN MedicationUser NATURAL JOIN Medication NATURAL JOIN MedicationType " +
        "WHERE userID = ? AND endDate >= NOW();", 
        [userID],
        function(err, rows) {
            callback(err, rows);
        });
};

database.insertComment = function(medicationUserID, commentText, callback) {
    database.query(
        "INSERT INTO MedicationUserComment (medicationUserID, commentText, timeStamp) VALUES (?, ?, CURRENT_TIMESTAMP);", [medicationUserID, commentText],
        function(err) {
            callback(err);
        });
}

database.getMedicationUserComments = function(medicationUserID, callback) {
    database.query(
        "SELECT medicationUserCommentID, commentText, `timeStamp` " +
        "FROM MedicationUserComment " +
        "WHERE medicationUserID = ? AND deleted = false;", [medicationUserID],
        function(err, rows) {
            callback(err, rows);
        });
};

database.getRemovedMedicationUserComments = function(medicationUserID, callback) {
    database.query(
        "SELECT medicationUserCommentID, commentText, `timeStamp` " +
        "FROM MedicationUserComment " +
        "WHERE medicationUserID = ? AND deleted = true;", [medicationUserID],
        function(err, rows) {
            callback(err, rows);
        });
};

database.getUserSideEffects = function(userID, callback) {
    database.query(
        "SELECT userSideEffectID, userID, sideEffectText, `timeStamp`, deleted " +
        "FROM UserSideEffect " +
        "WHERE userID = ? order by `timestamp` desc;", [userID],
        function(err, rows) {
            callback(err, rows);
        });
};

database.removeComment = function(medicationUserCommentID, callback) {
    database.query(
        "UPDATE MedicationUserComment SET deleted = true WHERE medicationUserCommentID = ?;", [medicationUserCommentID],
        function(err) {
            callback(err);
        });
};

database.removeSideEffect = function(userSideEffectID, callback) {
    database.query(
        "UPDATE UserSideEffect SET deleted = true WHERE userSideEffectID = ?;", [userSideEffectID],
        function(err) {
            callback(err);
        }
    );
};

database.addSideEffect = function(userID, commentText, callback) {
    database.query(
        "INSERT INTO UserSideEffect (userID, sideEffectText, deleted) VALUES (?, ?, false);", [userID, commentText],
        function(err) {
            callback(err);
        });
}

database.getMedicationHistory = function(medicationID, userID, callback) {
    database.query(
        "SELECT * FROM MedicationUser " +
        "WHERE medicationID = ? " +
        "AND userID = ? " +
        "AND endDate < NOW();", [medicationID, userID],
        function(err, rows) {
            callback(err, rows);
        });
};

module.exports = database;