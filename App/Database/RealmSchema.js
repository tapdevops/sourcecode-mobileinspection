import Realm from 'realm';
import ModelTables from './ModelTables';

// Initialize a Realm with models
// var defaultPath = Realm.defaultPath;
// var newPath     = defaultPath.substring(0, defaultPath.lastIndexOf('/')) + '/default.realm';
let realmSchema = new Realm({
    // path: newPath,
    schema: [
        ModelTables.TR_BLOCK_INSPECTION_H, 
        ModelTables.TR_BLOCK_INSPECTION_D, 
        ModelTables.TR_LOGIN,
        ModelTables.TR_IMAGE, 
        ModelTables.TR_TRACK_INSPECTION,
        ModelTables.TR_BARIS_INSPECTION,
        ModelTables.TM_AFD,
        ModelTables.TR_CATEGORY,
        ModelTables.TR_CONTACT,
        ModelTables.TR_FINDING
    ]
});

// let realmSchemaTrack = new Realm({

// })
export default realmSchema;