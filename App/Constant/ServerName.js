import DeviceInfo from 'react-native-device-info'

let verAPI = "v2.0";
let verAPK = DeviceInfo.getVersion();
// let verAPK = "2.9";

export default {
	verAPK,
	verAPI,
	1: {
		data: "http://apis.tap-agri.com/mobileinspection/ins-msa-auth/api/" + verAPI + "/",
		service: "http://apis.tap-agri.com/mobileinspection/ins-msa-auth/api/" + verAPI + "/server/service-list?v=" + verAPK
	},
	2: {
		data: "http://apisqa.tap-agri.com/mobileinspectionqa/ins-msa-qa-auth/api/" + verAPI + "/",
		service: "http://apisqa.tap-agri.com/mobileinspectionqa/ins-msa-qa-auth/api/" + verAPI + "/server/service-list?v=" + verAPK


		// data: "http://app.tap-agri.com/mobileinspectionqa/ins-msa-qa-auth/api/" + verAPI + "/",
		// service: "http://app.tap-agri.com/mobileinspectionqa/ins-msa-qa-auth/api/" + verAPI + "/server/service-list?v=" + verAPK
	},
	3: {
		// data: "http://apisdev.tap-agri.com/mobileinspectiondev/ins-msa-dev-auth/api/" + verAPI + "/",
		// service: "http://apisdev.tap-agri.com/mobileinspectiondev/ins-msa-dev-auth/api/" + verAPI + "/server/service-list?v=" + verAPK
		data: "http://apistest.tap-agri.com/mobileinspectiondev/ins-msa-dev-auth/api/" + verAPI + "/",
		service: "http://apistest.tap-agri.com/mobileinspectiondev/ins-msa-dev-auth/api/" + verAPI + "/server/service-list?v=" + verAPK
	},
	10000: {
		data: "http://app.tap-agri.com/mobileinspectiondev/ins-msa-dev-auth/api/v1.0/",
		service: "http://app.tap-agri.com/mobileinspectiondev/ins-msa-dev-auth/api/v1.0/server/service-list?v=" + verAPK
	}
};
