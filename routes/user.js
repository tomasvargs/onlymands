var express = require('express');
var router = express.Router();
const userHelpers = require('../helpers/user-helper'); // Ensure this path is correct

const verifyLogin = (req, res, next) => {
    if (req.session && req.session.userLoggedIn) {
        next();
    } else {
        res.redirect("/user/login");
    }
};

/* GET home page. */
router.get('/', async (req, res, next) => {
  console.log('userrrrrrrrrrrrr')
  let user = req.session ? req.session.user : null; // Check if req.session exists
    let cartCount = null;
    if (user) {
        cartCount = await userHelpers.getCartCount(user._id);
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

/* GET login page. */
router.get('/login', (req, res) => {
    // Check if the session is defined
    if (req.session && req.session.user) {
        // If the user is already logged in, redirect to the user home page
        return res.redirect("/user");
    } else {
        // If not logged in, prepare to render the login page
        let loginErr = req.session.userLoginErr || null; // Use null if not defined
        req.session.userLoginErr = false; // Reset the error flag before rendering
        res.render("user/login", { loginErr });
    }
});


router.post("/login", (req, res) => {
    userHelpers.doLogin(req.body).then((response) => {
        if (response.passwordStatus) {
            req.session.user = response.user; // Store user information in session
            req.session.userLoggedIn = true; // Indicate user is logged in
            return res.redirect("/user"); // Redirect to user page
        } else {
            req.session.userLoginErr = true; // Set error flag
            return res.redirect("/user/login"); // Redirect to login page
        }
    });
});


/* GET logout */
router.get('/logout', (req, res) => {
    req.session.user = null;
    req.session.userLoggedIn = false;
    res.redirect("/user");
});

/* GET signup page. */
router.get('/signup', (req, res) => {
    res.render("user/signup");
});

/* POST signup page. */
router.post('/signup', (req, res) => {
    userHelpers.doSignup(req.body).then((response) => {
        req.session.user = response.user;
        req.session.userLoggedIn = true;
        res.redirect("/user/login");
    });
});

/* GET cart page. */
router.get('/cart', verifyLogin, async (req, res) => {
    let products = await userHelpers.getCartProducts(req.session.user._id);
    if (products[0] == null) {
        res.render("user/cart", { user: req.session.user, empty: true });
    } else {
        let totalValue = await userHelpers.getTotalAmount(req.session.user._id);
        res.render("user/cart", { products, user: req.session.user, totalValue });
    }
});

/* GET product details */
router.get('/go-to-product/:id', async (req, res) => {
    try {
        const productId = req.params.id;
        let product = await userHelpers.goToDetails(productId);
        res.render("user/ProDetails", { product });
    } catch (error) {
        console.error("Error fetching product details:", error);
        res.status(500).send("Something went wrong");
    }
});

/* POST change product quantity */
router.post('/change-product-quantity', (req, res, next) => {
    userHelpers.changeProductQuantity(req.body).then(async (response) => {
        response.total = await userHelpers.getTotalAmount(req.body.user);
        res.json(response);
    });
});

/* POST remove product */
router.post('/remove-product', (req, res, next) => {
    userHelpers.removeProduct(req.body).then((response) => {
        res.json(response);
    });
});

/* GET place order page */
router.get('/place-order', verifyLogin, async (req, res) => {
    let total = await userHelpers.getTotalAmount(req.session.user._id);
    res.render("user/place-order", { total, user: req.session.user });
});

/* POST place order */
router.post('/place-order', async (req, res) => {
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

/* GET order success page */
router.get('/order-success', (req, res) => {
    res.render("user/order-success", { user: req.session.user });
});

/* GET user orders */
router.get('/orders', verifyLogin, async (req, res) => {
    noOrderStatus = false;
    let orders = await userHelpers.getUserOrders(req.session.user._id);
    if (orders[0] == null) {
        noOrderStatus = true;
    }
    res.render("user/orders", { user: req.session.user, orders, noOrderStatus });
});

/* GET order products */
router.get('/view-order-products/:id', async (req, res) => {
    let products = await userHelpers.getOrderProducts(req.params.id);
    res.render("user/view-order-products", { user: req.session.user, products });
});

/* POST verify payment */
router.post('/verify-payment', (req, res) => {
    userHelpers.verifyPayment(req.body).then(() => {
        userHelpers.changePaymentStatus(req.body["order[receipt]"]).then(() => {
            res.json({ status: true });
        });
    }).catch((err) => {
        res.json({ status: false, errMsg: "" });
    });
});

module.exports = router;
