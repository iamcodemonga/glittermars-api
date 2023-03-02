import express, { Router } from 'express';
import { addProduct, allProducts, similarProducts, groupedProduct, bestProducts, Product  } from "../controllers/product";

const router: Router = express.Router();

router.post( '/create', addProduct );

router.get( '/', allProducts );

router.get( '/trending', bestProducts );

router.get( '/recommended', similarProducts );

router.get( '/category/:category', groupedProduct );

router.get( '/:id', Product );

// router.get( 'search/:match', searchedProduct );

export default router;