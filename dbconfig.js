const fs = require('fs')
const { Pool} = require("pg");
const util = require('util');
require('dotenv').config();
const env = process.env;

// Enter Your DB user,database and passsword here
const pool = new Pool({
    user: env.DB_USER,
    host: env.DB_HOST,
    database: env.DATABASE,
    password: env.DB_PASSWORD,
    port: env.DB_PORT
});

//Enter your TableName here
const tableName = env.DB_TABLE_NAME

let log = console.log;

function removeExtraUnderScore(str){
    var len = str.length;
    var anstr = '';
    for(var i = 0;i<len;i++){
        if(i==0){
            if(str[i]==='_'){
          
            }
            else{
                anstr = anstr.concat(str[i]);
            }
        }
        else if(i==len-1){
            if(str[i]==='_'){
          
            }
            else{
                anstr = anstr.concat(str[i]);
            }
        }
        else{
            if(str[i+1]=='_'&&str[i]=='_'){
          
            }
            else{
                if(str[i]=='_'&&anstr.length==0){}
                else{
                anstr = anstr.concat(str[i]);}
            }
        }
    }
    return anstr;
}



//This function will remove spaces and '/' from keys
function removeUnwantedChars(x){
    var len = x.length;
    for(var i = 0;i<len;i++){
        if(x.charAt(i)===' '){
            x = x.replace(' ','_');
            
        }
        else if(x.charAt(i)==='/'){
            x = x.replace('/','_');
            
        }
        else if((x.charAt(i)==='(')||(x.charAt(i)===')')){
            x = x.replace('(','');
            x = x.replace(')','');
            
        }
        else if(x.charAt(i)==='\''){
            x = x.replace('\'','_');
        }
        else if(x.charAt(i)==='-'){
            x = x.replace('-','_')
        }
        else if(x.charAt(i)==='&'){
            x = x.replace('&','_')
        }
        else if(x.charAt(i)==='?'){
            x = x.replace('?','_')
        }
        else if(x.charAt(i)==='%'){
            x = x.replace('%','_')
        }
        else if(x.charAt(i)==='#'){
            x = x.replace('#','_')
        }
        else if(x.charAt(i)==='!'){
            x = x.replace('!','_')
        }
        else if(x.charAt(i)==='$'){
            x = x.replace('$','_')
        }
        else if(x.charAt(i)==='@'){
            x = x.replace('@','_')
        }
        else if(x.charAt(i)==='*'){
            x = x.replace('*','_')
        }
        else if(x.charAt(i)==='^'){
            x = x.replace('^','_')
        }
        else if(x.charAt(i)==='.'){
            x = x.replace('.','_');
            
        }
        else if(x.charAt(i)===':'){
            x = x.replace(':','_');
            
        }
        else if(x.charAt(i)===';'){
            x = x.replace(';','_');
            
        }
    }
    return removeExtraUnderScore(x);
}

// This will remove ' from fields
function removeUnwantedCharsfromfields(x){
    var len = x.length;
    var y = ''
    for(var i = 0;i<len;i++){
        if(x.charAt(i)==='\''){
            y = y.concat('\'\'');
        }
        else{
           y =  y.concat(x.charAt(i))
        }
    }
    return y;
}


//This function will return a json object with all the data-types;
function getDataTypes(){
    var datatypes_string = fs.readFileSync('DataTypesofFields.txt');
    var DataTypesObj = JSON.parse(datatypes_string)
    return DataTypesObj;
}

//This function will return max length of all fields in json
function getMaxLengthofFields(){
    var maxLength_string = fs.readFileSync('MaxlengthofFields.txt');
    var MaxLengthObj = JSON.parse(maxLength_string);
    return MaxLengthObj;
}

// Function returns all recrds in form of JSON object
function getAllRecords(){
    var records = fs.readFileSync('AllRecords.txt')
    var RecordsObj = JSON.parse(records);
    return RecordsObj;
}


function getInsertTableQuery(record,DataTypesObj){
    let insertTable = 'INSERT INTO '+tableName+' (id,createdtime'
        const all_keys = Object.keys(record.fields);
        let values = '(\''
        values+=record.id;
        values+='\',\''
        values+=record.createdTime
        
        all_keys.forEach(key=>{
            var sql_key = removeUnwantedChars(key);
            if(DataTypesObj[key]==='varchar(64) ARRAY'){
                var arr = record.fields[key]

                if((arr[0][0]==='r')&&(arr[0][1]==='e')&&(arr[0][2]==='c')){
                    // These cases will be handled in dbmanytomany.js file
                    // Since all the id's start with 'rec' and they all are manytomany relationships
                }
                else{
                    values+='\',\''
                    arr.forEach((x,index)=>{
                        if(index>0){values+=','}
                        var y = removeUnwantedCharsfromfields(x);
                        values+=y;
                    })
                    values+=''
                    insertTable+=', ' 
                    insertTable+=sql_key
                }

            // values+='}'
            }
            else{
                values+='\',\''
                var x = record.fields[key];
                var y = x;
                if(DataTypesObj[key]==='varchar'){
                    y = removeUnwantedCharsfromfields(x);
                }
                values+=y;

                insertTable+=', ' 
                insertTable+=sql_key
            }
        
        })  
        insertTable+=' ) '
        values+='\' );'

        insertTable+=' VALUES '+values

        // log(insertTable);
        return insertTable

}


async function dbwork() {
    var DataTypesObj = getDataTypes();
    var MaxLengthObj = getMaxLengthofFields();
    var RecordsObj = getAllRecords();
    
    
    var rowsNotInserted = 0;
    
    RecordsObj.forEach((record,index)=>{
        let insertTableQuery = getInsertTableQuery(record,DataTypesObj)
        pool.query(insertTableQuery,function(err,results,fields){
            if(err) {
                rowsNotInserted+=1;
                console.log(err.message)
                log(insertTableQuery);
                if(index==RecordsObj.length-1){
                    log("No. of rows not inserted to sql = "+rowsNotInserted)
                }
            }
            else{
                if(index==RecordsObj.length-1){
                    log("No. of rows not inserted to sql = "+rowsNotInserted)
                }
            }
        })
        
    });
}

res = dbwork();

module.exports = dbwork;