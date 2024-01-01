const fs = require("fs");
const mariadb = require("mariadb");
const mysql = require('mysql');

async function insertData(newObjects) {
    let con;
    let connection;
    let result;
    const dbMode = process.env.DB_Mode;
    try {
        if(dbMode === 'mariadb'){
            const pool = await mariadb.createPool({
                host: process.env.DB_Host,
                user: process.env.DB_User,
                password: process.env.DB_Password,
                port: process.env.DB_Port,
                database: process.env.DB_Name,
                connectionLimit: 5
            });
            con = await pool.getConnection();
        }else{
            connection = await mysql.createConnection({
                host: process.env.DB_Host,
                user: process.env.DB_User,
                password: process.env.DB_Password,
                database: process.env.DB_Name,
            });
            await connection.connect();
        }
        for (const item of newObjects) {
            const query = "INSERT INTO wpas_tbl_item (Title, UserID, PreCode, Province_ID, Category, Phone, Address,\n" +
                "Instagram, Whatsapp, Email, WebSite, Mobile, PostCode, Latitude, Longitude,\n" +
                "ExtraCommentHide, Tag, GenderID, Telegram, Aparat, businessID, searchKeys, IsUpdated) " +
                "VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
            const values =[item?.Title,item?.UserID,item?.PreCode,
                item?.Province_ID,item?.Category,item?.Phone,item?.Address,
                item?.Instagram,item?.Whatsapp,item?.Email,item?.WebSite,item?.Mobile,
                item?.PostCode,item?.Latitude,item?.Longitude,item?.ExtraCommentHide,item?.Tag,
                item?.GenderID,item?.Telegram,
                item?.Aparat,item?.businessID,item?.searchKeys, item?.IsUpdated];
            if(dbMode === 'mariadb'){
                result = await con.query(query, values);
            }else{
                result = await connection.query(query, values);
            }
        }
        console.log('result', result)
    } catch (error) {
        console.error('Error inserting data:', error);
    } finally {
        if(dbMode === 'mariadb'){
            await con.end();
        }else{
            await connection.end();
        }
    }
}
async function transferData(filePath) {
    //const filePath = 'balad-restaurant-tehran-1.json';
    let jsonObject = await fs.promises.readFile(filePath);
    const newObjects = []
    jsonObject = JSON.parse(jsonObject);
    //const jsonItem = jsonObject[0];
    for (const jsonItem of jsonObject) {
        const Title = jsonItem?.title;
        const UserID = 1;
        const PreCode = '021';
        const Province_ID = 1;
        const Category = 67;
        //const Phone = jsonItem?.seoDetails?.schemas[0]?.address?.telephone;
        let Phone = '';
        let Address = '';
        let Instagram = '';
        let Whatsapp = '';
        let Email = '';
        let WebSite = '';
        let Mobile = '';
        for (const item of jsonItem?.fields) {
            if (item?.icon === 'gps') {
                Address = item?.value?.replace(/،خ./g, ' خیابان ');
                Address = Address.replace(/،ب\./g, 'بلوار');
                Address = Address.replace(/تهران،/g, ' ');
            }
            if (item?.icon === 'phone') {
                if (item?.text?.startsWith('09')) {
                    Mobile = item?.text;
                } else {
                    Phone += item?.text?.replace('021', '') + '-';
                }
            }
            if (item?.icon === 'instagram') {
                Instagram = item?.value;
            }
            if (item?.icon === 'whatsapp') {
                Whatsapp = item?.value;
            }
            if (item?.icon === 'email') {
                Email = item?.value;
            }
            if (item?.icon === 'web') {
                WebSite = item?.value;
            }
        }
        if (Phone.endsWith("-")) {
            // Remove the last character
            Phone = Phone.slice(0, -1);
        }
        // console.log('data', Phone, Address, Instagram, Whatsapp, Email, WebSite);
        const PostCode = '';
        const Latitude = jsonItem?.seoDetails?.schemas[0]?.latitude;
        const Longitude = jsonItem?.seoDetails?.schemas[0]?.longitude;
        const ExtraCommentHide = '';
        const GenderID = 0;
        const Telegram = '';
        const Aparat = '';
        const businessID =jsonItem?.itemData?.token;
        //const businessID = jsonItem?.seoDetails?.schemas[0]?.identifier;
        // const Tag = 'balad-resturant-tehran';
        const Tag = businessID;
        const searchKeys = jsonItem?.categoryText;
        const IsUpdated = 0;
        //const businessID =jsonItem?.token;
        newObjects.push({Title, UserID, PreCode, Province_ID, Category, Phone, Address,
            Instagram, Whatsapp, Email, WebSite, Mobile, PostCode, Latitude, Longitude,
            ExtraCommentHide, Tag, GenderID, Telegram, Aparat, businessID, searchKeys, IsUpdated});
    }
    await insertData(newObjects);
    return true;
}
module.exports = transferData;