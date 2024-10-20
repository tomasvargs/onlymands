var db = require("../config/connection");
var collection = require("../config/collections");
const { response } = require("../app");
const { log } = require("handlebars");

var objectId = require("mongodb").ObjectId;
module.exports = {
  doLogin: (adminData) => {
    return new Promise(async (resolve, reject) => {
      let adminStatus = false;
      let response = {};

      if (
        adminData.Email == collection.ADMIN_EMAIL &&
        adminData.Password == collection.ADMIN_PASS
      ) {
        response.adminStatus = true;
        response.admin = collection.ADMIN_NAME;
        resolve(response);
      } else {
        response.adminStatus = false;
        resolve(response);
      }
    });
  },
  addproduct: (product, callback) => {
    db.get()
      .collection("product")
      .insertOne(product)
      .then((data) => {
        callback(data.insertedId);
      });
  },
  getAllProducts: () => {
    return new Promise(async (resolve, reject) => {
      let products = await db
        .get()
        .collection(collection.PRODUCT_COLLECTION)
        .find()
        .toArray();
      resolve(products);
    });
  },
  deleteProduct: (proId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.PRODUCT_COLLECTION)
        .deleteOne({ _id: new objectId(proId) })
        .then((response) => {
          console.log(response);
          resolve(response);
        });
    });
  },
  getProductDetails: (proId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.PRODUCT_COLLECTION)
        .findOne({ _id: new objectId(proId) })
        .then((product) => {
          resolve(product);
        });
    });
  },
  updateProduct: (proId, proDetails) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.PRODUCT_COLLECTION)
        .updateOne(
          { _id: new objectId(proId) },
          {
            $set: {
              Name: proDetails.Name,
              Category: proDetails.Category,
              Price: proDetails.Price,
              Description: proDetails.Description,
            },
          }
        )
        .then(() => {
          resolve();
        });
    });
  },
  getAllOrders: () => {
    return new Promise(async (resolve, reject) => {
      let orders = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .find()
        .toArray();
      resolve(orders);
    });
  },
  getAllUsers: () => {
    return new Promise(async (resolve, reject) => {
      let users = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .find()
        .toArray();
      resolve(users);
    });
  },
  changeShipmentStatus: (details) => {
    return new Promise(async (resolve, reject) => {
      db.get()
        .collection(collection.ORDER_COLLECTION)
        .updateOne(
          { _id: new objectId(details.order) },
          {
            $set: {
              status: "Shipped",
              isShipped: true,
            },
          }
        )
        .then((response) => {
          resolve({ statusChange: true });
        });
    });
  },
};
