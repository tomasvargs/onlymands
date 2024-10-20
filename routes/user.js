var express = require("express");
var router = express.Router();
const userHelpers = require("../helpers/user-helper");
const verifyLogin = (req, res, next) => {
  if (req.session.userLoggedIn) {
    next();
  } else {
    res.redirect("/user/login");
  }
};

/* GET home page. */
router.get("/", async function (req, res, next) {
  let user = req.session.user;
  let cartCount = null;
  if (req.session.user) {
    console.log(user);
    cartCount = await userHelpers.getCartCount(req.session.user._id);
  }
  userHelpers.getAllProducts().then((products) => {
    const { Tshirts, Shirts, Jeans } = products;

    res.render("user/view-products", {
      Tshirts,
      Shirts,
      Jeans,
      user,
      cartCount,
    });
  });
});

router.get("/login", (req, res) => {
  if (req.session.user) {
    res.redirect("/");
  } else {
    let loginErr = req.session.userLoginErr;
    req.session.userLoginErr = false; // Reset the error flag before rendering
    res.render("user/login", { loginErr });
  }
});

router.post("/login", (req, res) => {
  userHelpers.doLogin(req.body).then((response) => {
    if (response.passwordStatus) {
      //if password match
      req.session.user = response.user;
      req.session.userLoggedIn = true;
      res.redirect("/user");
    } else {
      req.session.userLoginErr = true; //if password does not match
      res.redirect("/user/login");
    }
  });
});

router.get("/logout", (req, res) => {
  req.session.user = null;
  req.session.userLoggedIn = false;

  res.redirect("/user");
});

router.get("/signup", (req, res) => {
  res.render("user/signup");
});
router.post("/signup", (req, res) => {
  userHelpers.doSignup(req.body).then((response) => {
    console.log(response);
    req.session.user = response.user;
    req.session.userLoggedIn = true;

    res.redirect("user/login");
  });
});

router.get("/cart", verifyLogin, async (req, res) => {
  let products = await userHelpers.getCartProducts(req.session.user._id);
  if (products[0] == null) {
    res.render("user/cart", { user: req.session.user, empty: true });
  } else {
    let totalValue = await userHelpers.getTotalAmount(req.session.user._id);
    console.log(totalValue);
    console.log(products);
    res.render("user/cart", { products, user: req.session.user, totalValue });
  }
});

router.get("/add-to-cart/:id", verifyLogin, (req, res) => {
  userHelpers.addToCart(req.params.id, req.session.user._id).then(() => {
    res.json({ status: true });
  });
});

router.get("/go-to-product/:id", async (req, res) => {
  try {
    const productId = req.params.id; // This should be a string

    let product = await userHelpers.goToDetails(productId);

    res.render("user/ProDetails", { product });
  } catch (error) {
    console.error("Error fetching product details:", error);
    res.status(500).send("Something went wrong");
  }
});

router.post("/change-product-quantity", (req, res, next) => {
  userHelpers.changeProductQuantity(req.body).then(async (response) => {
    response.total = await userHelpers.getTotalAmount(req.body.user);
    res.json(response);
  });
});
router.post("/remove-product", (req, res, next) => {
  userHelpers.removeProduct(req.body).then((response) => {
    res.json(response);
  });
});

router.get("/place-order", verifyLogin, async (req, res) => {
  let total = await userHelpers.getTotalAmount(req.session.user._id);
  res.render("user/place-order", { total, user: req.session.user });
});
router.post("/place-order", async (req, res) => {
  let cart = await userHelpers.getCartProductList(req.body.userId);
  if (cart == null) {
    res.render("user/cart", { empty: true });
  } else {
    products = cart.products;
    let totalPrice = await userHelpers.getTotalAmount(req.body.userId);
    userHelpers.placeOrder(req.body, products, totalPrice).then((orderId) => {
      if (req.body["payment-method"] === "COD") {
        res.json({ codSuccess: true });
      } else {
        userHelpers.generateRazorpay(orderId, totalPrice).then((response) => {
          res.json(response);
        });
      }
    });
  }
});

router.get("/order-success", (req, res) => {
  res.render("user/order-success", { user: req.session.user });
});

router.get("/orders", verifyLogin, async (req, res) => {
  noOrderStatus = false;
  let orders = await userHelpers.getUserOrders(req.session.user._id);
  if (orders[0] == null) {
    noOrderStatus = true;
  }
  console.log(orders);
  res.render("user/orders", { user: req.session.user, orders, noOrderStatus });
});
router.get("/view-order-products/:id", async (req, res) => {
  let products = await userHelpers.getOrderProducts(req.params.id);
  res.render("user/view-order-products", { user: req.session.user, products });
});
router.post("/verify-payment", (req, res) => {
  userHelpers
    .verifyPayment(req.body)
    .then(() => {
      userHelpers.changePaymentStatus(req.body["order[receipt]"]).then(() => {
        console.log("Payment Successful");
        res.json({ status: true });
      });
    })
    .catch((err) => {
      console.log(err);
      res.json({ status: false, errMsg: "" });
    });
});

module.exports = router;
