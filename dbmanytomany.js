const fs = require('fs')
const { Pool} = require("pg");
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
const tableName = 'asia_data_commonphrases'
var writeRecords = fs.createWriteStream("AllErrors.txt");
var log = console.log;
let insertUnique = {}

function writelogsinfile(allRecords){
    
    writeRecords.write(allRecords);
}

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

//This function will return a json object with all the data-types;
function getDataTypes(){
    var datatypes_string = fs.readFileSync('DataTypesofFields.txt');
    var DataTypesObj = JSON.parse(datatypes_string)
    return DataTypesObj;
}

// Function returns all recrds in form of JSON object
function getAllRecords(){
    var records = fs.readFileSync('AllRecords.txt')
    var RecordsObj = JSON.parse(records);
    return RecordsObj;
}



function InsertRelationshipsIntotable(record,DataTypesObj){
        const all_keys = Object.keys(record.fields);
        
        
        all_keys.forEach(key=>{
            var sql_key = removeUnwantedChars(key);
            if(DataTypesObj[key]==='varchar(64) ARRAY'){
                var arr = record.fields[key]
                if((arr[0][0]==='r')&&(arr[0][1]==='e')&&(arr[0][2]==='c')){
                    arrTableName = tableName+'_'+sql_key;
                    let arrInsertTable = 'INSERT INTO '+arrTableName+' VALUES ('
                        if(!(insertUnique[arrInsertTable])){
                            insertUnique[arrInsertTable] = 0;
                        }
                        // log(arr)
                        // values+='\',\'{'
                    arr.forEach((x)=>{
                        var insertQuery = arrInsertTable
                        insertQuery+=insertUnique[arrInsertTable];
                        insertUnique[arrInsertTable]+=1;
                        insertQuery+=',\''
                        insertQuery+=record.id
                        insertQuery+='\',\''
                        insertQuery+=x
                        insertQuery+='\')'
                        pool.query(insertQuery,function(err,results,fields){
                            if(err){
                                // log(err.message)
                                // log(insertQuery)
                                writelogsinfile(err.message)
                                writelogsinfile(insertQuery)
                            }
                        })
                    })
                    // values+='}'
                }
            }
            else{
                // Nothing to do in else 
            }
        
        })  
}

async function dbwork() {
    var DataTypesObj = getDataTypes();
    var RecordsObj = getAllRecords();    
    
    RecordsObj.forEach((record)=>{
        InsertRelationshipsIntotable(record,DataTypesObj)
    });
}

res = dbwork();

module.exports = dbwork;