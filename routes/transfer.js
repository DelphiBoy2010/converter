const fs = require("fs");
const mariadb = require("mariadb");
const mysql = require('mysql');

async function insertData(newObjects) {
    let con;
    try {
        // const pool = await mariadb.createPool({
        //     host: process.env.DB_Host,
        //     user: process.env.DB_User,
        //     password: process.env.DB_Password,
        //     port: process.env.DB_Port,
        //     database: process.env.DB_Name,
        //     connectionLimit: 5
        // });
        // con = await pool.getConnection();

        const pool = await mysql.createPool({
            host: process.env.DB_Host,
            user: process.env.DB_User,
            password: process.env.DB_Password,
            database: process.env.DB_Name,
            connectionLimit: 5
        });
        con = await pool.getConnection();

        // const query = "INSERT INTO wpas_tbl_item (Title, Category, Province_ID, UserID, BusinessID, Code) " +
        //     "VALUES ('hi', 1, 2, 3, '123',222)";
        //const result = await con.query(query);

        for (const item of newObjects) {
            const query = "INSERT INTO wpas_tbl_item (Title, UserID, PreCode, Province_ID, Category, Phone, Address,\n" +
                "Instagram, Whatsapp, Email, WebSite, Mobile, PostCode, Latitude, Longitude,\n" +
                "ExtraCommentHide, Tag, GenderID, Telegram, Aparat, businessID, searchKeys) " +
                "VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
            const result = await con.query(query, [item?.Title,item?.UserID,item?.PreCode,
                item?.Province_ID,item?.Category,item?.Phone,item?.Address,
                item?.Instagram,item?.Whatsapp,item?.Email,item?.WebSite,item?.Mobile,
                item?.PostCode,item?.Latitude,item?.Longitude,item?.ExtraCommentHide,item?.Tag,
                item?.GenderID,item?.Telegram,
                item?.Aparat,item?.businessID,item?.searchKeys]);
            console.log('Inserted data successfully:', result);
        }
    } catch (error) {
        console.error('Error inserting data:', error);

    } finally {
        await con.end();
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
        const Tag = 'balad-resturant-tehran';
        const GenderID = 0;
        const Telegram = '';
        const Aparat = '';
        //const businessID =jsonItem?.itemData?.token;
        const businessID = jsonItem?.seoDetails?.schemas[0]?.identifier;
        const searchKeys = jsonItem?.categoryText;
        //const businessID =jsonItem?.token;
        newObjects.push({Title, UserID, PreCode, Province_ID, Category, Phone, Address,
            Instagram, Whatsapp, Email, WebSite, Mobile, PostCode, Latitude, Longitude,
            ExtraCommentHide, Tag, GenderID, Telegram, Aparat, businessID, searchKeys});
    }
    await insertData(newObjects);
}
module.exports = transferData;