import {Router} from "express";

import { authenticate } from "../../middleware/auth.middleware";


import {
createNoteController,
getNotesController,
getNoteController,
updateNoteController,
deleteNoteController

} from "../../controllers/notes/note.controller";


const router = Router();



router.post(
"/",
authenticate,
createNoteController
);



router.get(
"/",
authenticate,
getNotesController
);



router.get(
"/:id",
authenticate,
getNoteController
);



router.patch(
"/:id",
authenticate,
updateNoteController
);



router.delete(
"/:id",
authenticate,
deleteNoteController
);



export default router;