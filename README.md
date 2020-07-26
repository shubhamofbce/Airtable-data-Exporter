# Airtable-data-Exporter

##### This is a nodeJS application built to transfer all the data from an Airtable Database to your local Postgres or SQL database. In my project I have used postgres to save the data.  
##### Airtable is a paid databse and charges a handsome amount of money to store data into its server. So this app can help reducing cost by storing all those data in your local database.  
### Steps to start the Application:
1. Create a .env file inside the root directory.
2. Copy paste the variable name from env-example file and set their actual value in .env file.
3. Install all the dependencies using  `npm install`.
4. Get you **api key** from airtable and also the **URL** of your table to import the data.
5. Paste teh api key and the url in index.js file where mentioned.
6. Run the **index.js** file using command `node index.js`
7. This will import all the data from your table in airtable.
8. Now you need to save these files into your postgres database.
9. So you need to run **dbconfig.js** first to import all the datas that are not related to each other.
10. You will need to repeat step 6 to 9 for all the tables.
11. Then ALl your simple datas are stored already in your postgres db.
12. You only need to worry about the many to many relationships. We have a file dbmanytomany.js for this.
13. Now you need to run step 6 to import data from one table and then run ` node dbmanytomany.js ` for that table to load all its many to many data into your postgres.
14. You will need to repeat step 13 for all your tables.
15. Congrats! ALl your data is in your local database now.
### You saved a lots of dollars. Congrats!


#### TODO
1. Add Unit Tests for the classes.
2. Reduce the number of steps to make this process more easier.
3. Increase accuracy of loading data.