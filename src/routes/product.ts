import express, { Router } from 'express';
import { addProduct, allProducts, latestProducts, similarProducts, groupedProduct, bestProducts, Product, getReviews, addReview  } from "../controllers/product";
import { isActive } from '../middleware/user';

const router: Router = express.Router();

router.post( '/create', addProduct );

router.get( '/', allProducts );

router.get( '/new', latestProducts );

router.get( '/trending', bestProducts );

router.get( '/recommended/:productid', similarProducts );

router.get( '/category/:category', groupedProduct );

router.get( '/:id', isActive, Product );

router.get( '/reviews/:id', getReviews )

router.post( '/review/:id', addReview )

// router.get( 'search/:match', searchedProduct );

export default router;