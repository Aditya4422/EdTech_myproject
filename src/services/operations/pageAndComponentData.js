import {toast} from 'react-hot-toast';
import {apiConnector} from '../apiconnector';
import {catalogData} from '../apis';

export const getCatalogPageData = async(categoryId) => {
    const toastId = toast.loading("Loading...");
    let result = [];
    try{
        console.log("value of category id before hitting the api in pageand component.jsx ....", categoryId)
        const response = await apiConnector("POST", catalogData.CATALOGPAGEDATA_API, {categoryId: categoryId});
        console.log("printing response from pageandcomponent.jsx  ...", response)

        if(!response?.data?.success){
            throw new Error("Could not Fetch category page data");
        }
        
        result = response?.data;
    }
    catch(error){
        console.log("Catalog page data api error...", error);
        toast.error(error.message);
        result = error?.data;
    }

    toast.dismiss(toastId);
    return result;
}
