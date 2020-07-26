var moment = require('moment');
const api = require('axios')
const fs = require('file-system')
require('dotenv').config();
const env = process.env;

// Insert Your URL here
const url = ''

//Insert your API Key Here
const api_key = env.api_key

const auth_key = 'Bearer ' + api_key;
const header = {
    headers: {
        Authorization: auth_key
    }
}
const log = console.log;

function isFloat(n) {
    return Number(n) === n && n % 1 !== 0;
}

function isDate(record) {
    var isdate = false;
    var formats = [
        moment.ISO_8601,
        "YYYY-MM-DD"
    ];
    isdate = moment(record, formats, true).isValid();
    return isdate;
}


async function getData(params) {
    full_url = url + '/?offset=' + params
    return await api.get(full_url, header)
        .then(response => response.data)
        .catch(error => console.log(error.data))
}

function writeStreamforRecords(allRecords) {
    var writeRecords = fs.createWriteStream("AllRecords.txt");
    writeRecords.write(JSON.stringify(allRecords));
    log(allRecords.length + " rows imported")
}

function writeStreamforMaxLength(maxLengthofFields) {
    var writeMaxLength = fs.createWriteStream("MaxlengthofFields.txt");
    writeMaxLength.write(JSON.stringify(maxLengthofFields));
}

function writeStreamfordataTypes(dataTypeofFields) {
    var writedataTypes = fs.createWriteStream("DataTypesofFields.txt");
    writedataTypes.write(JSON.stringify(dataTypeofFields))
}

function getDatatypeofField(recordField) {

    if (isFloat(recordField)) {
        var dataType = 'float(4)'
        return dataType

    } else if (typeof recordField === 'boolean') {
        var dataType = 'boolean'
        return dataType
    } else if (isFinite(recordField)) {
        if (typeof recordField === 'string' && recordField.length > 9) {
            var dataType = 'varchar'
            return dataType;
        } else {
            var dataType = 'int'
            return dataType
        }
    } else if (isDate(recordField)) {
        var dataType = 'Date'
        return dataType
    } else if (recordField instanceof Array) {
        var dataType = 'varchar(64) ARRAY'
        return dataType
    } else if (typeof recordField === 'string') {
        var dataType = 'varchar'
        return dataType;
    }

}

async function getDataDetails() {

    let morePages = true
    let params = "";
    let allRecords = [];
    let records
    var dataTypeofFields = {}
    var maxLengthofFields = {}

    while (morePages) {

        let data = await getData(params);
        records = await data.records;
        morePages = false;
        let offset = '';
        if (data["offset"]) {
            morePages = true
            offset = data["offset"]
        } else {
            morePages = false
        }
        params = offset;

        records.forEach(record => {
            const allFields = Object.keys(record.fields);
            const recordFields = record.fields;
            allFields.forEach(field => {
                if(dataTypeofFields[field]!='varchar'){
                    dataTypeofFields[field] = getDatatypeofField(recordFields[field]);
                }
                if (maxLengthofFields[field]) {
                    const prevLength = maxLengthofFields[field];
                    const currLength = recordFields[field].length;
                    if (currLength > prevLength) {
                        maxLengthofFields[field] = currLength;
                        if (maxLengthofFields[field] > 9 && dataTypeofFields[field] == 'int') {
                            dataTypeofFields[field] = 'varchar'
                        }
                    }
                } else {
                    const currLength = recordFields[field].length;
                    maxLengthofFields[field] = currLength;
                    dataTypeofFields[field] = getDatatypeofField(recordFields[field]);
                }
            })
        });
        allRecords = [...allRecords, ...records]
        if (morePages === false) {
            writeStreamforRecords(allRecords)
            writeStreamforMaxLength(maxLengthofFields)
            writeStreamfordataTypes(dataTypeofFields)
        }
    }
}

const g = getDataDetails();

module.exports = writeStreamfordataTypes;
