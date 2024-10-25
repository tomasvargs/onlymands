var express = require("express");
var router = express.Router();
const adminHelpers = require("../helpers/product-helper");
const userHelpers = require("../helpers/user-helper");

const verifyLogin = (req, res, next) => {
  if (req.session.adminLoggedIn) {
    next();
  } else {
    res.redirect("/admin/login");
  }
};

/* GET users listing. */
router.get("/", function (req, res, next) {
  let admin = req.session.adminLoggedIn;
  if (admin) {
    adminHelpers.getAllProducts().then((products) => {
      res.render("admin/view-products", { products, adminUser: true, admin });
    });
  } else {
    res.render("admin/login", { adminUser: true });
  }
});

router.get("/login", (req, res) => {
  if (req.session.admin) {
    res.redirect("/");
  } else {
    res.render("admin/login", {
      loginErr: req.session.adminLoginErr,
      adminUser: true,
    });
    req.session.adminLoginErr = false;
  }
});
router.post("/login", (req, res) => {
  adminHelpers.doLogin(req.body).then((response) => {
    if (response.adminStatus) {
      //if password match
      req.session.admin = response.admin;
      req.session.adminLoggedIn = true;
      res.redirect("/admin");
    } else {
      req.session.adminLoginErr = true; //if password does not match
      res.redirect("/admin/login");
    }
  });
});
router.get("/logout", (req, res) => {
  req.session.admin = null;
  req.session.adminLoggedIn = false;
  res.redirect("/admin");
});

router.get("/add-product", function (req, res) {
  let admin = req.session.adminLoggedIn;
  res.render("admin/add-product", { adminUser: true, admin });
});

router.get("/all-orders", verifyLogin, async (req, res) => {
  let admin = req.session.adminLoggedIn;
  noOrderStatus = false;
  let orders = await adminHelpers.getAllOrders();
  if (orders[0] == null) {
    noOrderStatus = true;
  }

  res.render("admin/orders", { orders, noOrderStatus, adminUser: true, admin });
});

router.get("/view-order-products/:id", async (req, res) => {
  let admin = req.session.adminLoggedIn;
  let products = await userHelpers.getOrderProducts(req.params.id);
  res.render("admin/view-order-products", { products, adminUser: true, admin });
});

router.get("/all-users", verifyLogin, async (req, res) => {
  let admin = req.session.adminLoggedIn;
  let noUserStatus = false;
  let users = await adminHelpers.getAllUsers();
  if (users[0] == null) {
    noUserStatus = true;
  }

  res.render("admin/users", { users, noUserStatus, adminUser: true, admin });
});

router.post("/add-product", (req, res) => {
  if (!req.files || !req.files.Image) {
    return res.status(400).send("No image file uploaded.");
}
  adminHelpers.addproduct(req.body, (id) => {
    let image = req.files.Image;
    console.log('product entry')
    image.mv("./public/product-images/" + id + ".jpeg", (err) => {
      if (!err) {
        res.redirect("/admin");
      } else {
        console.log(err);
      }
    });
  });
});

router.get("/delete-product/:id", (req, res) => {
  let proId = req.params.id;

  adminHelpers.deleteProduct(proId).then((response) => {
    res.redirect("/admin/");
  });
});

router.get("/edit-product/:id", async (req, res) => {
  let admin = req.session.adminLoggedIn;
  let product = await adminHelpers.getProductDetails(req.params.id);

  res.render("admin/edit-product", { product, adminUser: true, admin });
});
router.post("/edit-product/:id", (req, res) => {
  adminHelpers.updateProduct(req.params.id, req.body).then(() => {
    res.redirect("/admin");
    if (req.files != null) {
      let image = req.files.Image;
      image.mv("./public/product-images/" + req.params.id + ".jpeg");
    }
  });
});
router.post("/change-shipment-status", (req, res) => {
  adminHelpers.changeShipmentStatus(req.body).then(async (response) => {
    res.json(response);
  });
});
module.exports = router;
