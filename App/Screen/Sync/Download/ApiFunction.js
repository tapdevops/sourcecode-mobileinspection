import { fetchGet } from "../../../Api/FetchingApi";

export async function getAPIFunction(apiName) {
    let dataAPI = null;
    await fetchGet(apiName, null)
        .then(((response) => {
            if (response !== undefined) {

                if (response.status) {
                    return dataAPI = response.data
                } else {
                    console.log(`Download ${apiName} Failed`);
                }
            } else {
                console.log(`Download ${apiName} Server Timeout`)
            }
        }));
    return dataAPI;
}
