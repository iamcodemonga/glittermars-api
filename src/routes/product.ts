import express, { Router } from 'express';
import { addProduct, allProducts, latestProducts, similarProducts, groupedProduct, bestProducts, Product  } from "../controllers/product";

const router: Router = express.Router();

router.post( '/create', addProduct );

router.get( '/', allProducts );

router.get( '/new', latestProducts );

router.get( '/trending', bestProducts );

router.get( '/recommended/:productid', similarProducts );

router.get( '/category/:category', groupedProduct );

router.get( '/:id', Product );

// router.get( 'search/:match', searchedProduct );

export default router;