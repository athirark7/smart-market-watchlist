import { Router } from 'express';
import { getWatchlist, addSymbol, removeSymbol, markAsSeen } from '../controllers/watchlist';

const router = Router();

router.get('/', getWatchlist);
router.post('/symbols', addSymbol);
router.delete('/symbols/:symbol', removeSymbol);
router.post('/mark-seen', markAsSeen);

export default router;
