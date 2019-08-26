import RNFS from 'react-native-fs';
import TaskServices from "../../../Database/TaskServices";
import {convertTimestampToDate, getTodayDate} from "../../../Lib/Utils";
import {fetchPostForm} from "../../../Api/FetchingApi";

//Global Var
const user = TaskServices.getAllData('TR_LOGIN')[0];

export async function uploadImage() {
    let getImages = TaskServices.getAllData('TR_IMAGE').filtered(`STATUS_SYNC = 'N'`);
    console.log("ALL IMAGESSSSSSSSSSSSSSSSSSSS",getImages);

    //Upload labels
    let uploadLabels = {
        uploadCount: 0,
        totalCount: getImages.length,
        syncStatus: true
    };

    if (getImages.length > 0) {
        await Promise.all(
            getImages.map(async (imageModel)=>{
                let imagePath = 'file://'+imageModel.IMAGE_PATH_LOCAL;
                await RNFS.exists(imagePath)
                    .then(async (isExist)=>{
                        if(isExist){
                            let imageForm = new FormData();
                            imageForm.append('IMAGE_CODE', imageModel.IMAGE_CODE);
                            imageForm.append('IMAGE_PATH_LOCAL', imageModel.IMAGE_PATH_LOCAL);
                            imageForm.append('TR_CODE', imageModel.TR_CODE);
                            imageForm.append('STATUS_IMAGE', imageModel.STATUS_IMAGE);
                            imageForm.append('STATUS_SYNC', 'Y');
                            imageForm.append('SYNC_TIME', getTodayDate('YYYYMMDDkkmmss'));
                            imageForm.append('INSERT_TIME', convertTimestampToDate(imageModel.INSERT_TIME, 'YYYYMMDDkkmmss'));
                            imageForm.append('INSERT_USER', imageModel.INSERT_USER);
                            imageForm.append('FILENAME', {
                                uri: `file://${imageModel.IMAGE_PATH_LOCAL}`,
                                type: 'image/jpeg',
                                name: imageModel.IMAGE_NAME,
                            });
                            await postImage(imageForm, imageModel.IMAGE_CODE)
                                .then((response)=>{
                                    console.log("responseeeee1", response);
                                    if(response){
                                        uploadLabels = {
                                            ...uploadLabels,
                                            uploadCount: uploadLabels.uploadCount + 1
                                        }
                                    }
                                    else {
                                        uploadLabels = {
                                            ...uploadLabels,
                                            syncStatus: false
                                        }
                                    }
                                })
                        }
                    })
            })
        );
    }
    return {
        uploadCount: uploadLabels.uploadCount,
        totalCount: uploadLabels.totalCount,
        syncStatus: uploadLabels.syncStatus
    };
}

async function postImage(imageModel, imageID){
    let fetchStatus = true;

    await fetchPostForm("IMAGES-UPLOAD", imageModel, null)
        .then((response)=>{
            if (response !== undefined) {
                if (response.status) {
                    TaskServices.updateByPrimaryKey('TR_IMAGE', {
                        "IMAGE_CODE": imageID,
                        "STATUS_SYNC": "Y"
                    });
                    fetchStatus = true;
                }
                else {
                    fetchStatus = false;
                    console.log("postImage upload failed")
                }
            }
            else {
                fetchStatus = false;
                console.log("postImage Server Timeout")
            }
        });

    console.log("responseeeee2", fetchStatus);
    return fetchStatus
}
