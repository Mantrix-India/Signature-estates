import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
import { create, list, getOne, update, remove, geocode, setLocation, nearbyPlaces, compare, setPublished } from '../controllers/property.controller';
import { updateStatus, statusHistory } from '../controllers/inventory.controller';


const router = Router();

router.use(authMiddleware);

router.get('/', list);
router.get('/compare', compare);
router.get('/:id', getOne);
router.post('/', requireRole('ADMIN', 'MANAGER', 'AGENT'), create);
router.patch('/:id', requireRole('ADMIN', 'MANAGER', 'AGENT'), update);
router.delete('/:id', requireRole('ADMIN', 'MANAGER'), remove);
router.patch('/:id/publish', requireRole('ADMIN', 'MANAGER'), setPublished);
router.post('/:id/geocode', geocode);
router.patch('/:id/location', setLocation);
router.get('/:id/nearby-places', nearbyPlaces);
router.patch('/:id/status', updateStatus);
router.get('/:id/status-history', statusHistory);

export default router;