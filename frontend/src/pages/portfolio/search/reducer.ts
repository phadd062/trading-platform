import {
	fetchDepartmentList,
	fetchProvinceList,
	fetchCityList,
} from "utils/searchLabelOptions";
import { searchFieldValue } from "utils/searchLabelTypes";

export const ACTIONS = {
	RESETINITIAL: "resetInitial",
	LOCATIONNAME: "locationName",
	BUILDINGNAME: "buildingName",
	ADDRESS: "address",
	POSTALCODE: "postalCode",
	CITY: "city",
	PROVINCE: "province",
	DEPARTMENT: "department",
	LOADQUERYPARAMS: "loadQueryParams",
};

const INITIALFETCHURL = "/api/orders";

export const reducerInitial = {
	fetchUrl: INITIALFETCHURL,
	values: {
		locationName: "",
		buildingName: "",
		address: "",
		postalCode: "",
		provinceValue: <searchFieldValue[]>[],
		cityValue: <searchFieldValue[]>[],
		departmentValue: <searchFieldValue[]>[],
	},
};

export const reducer = (state: any, action: any) => {
	switch (action.type) {
		case ACTIONS.RESETINITIAL:
			return reducerInitial;

		case ACTIONS.LOADQUERYPARAMS:
			const searchParamsGet = action.payload.locationSearch;
			const loadValues = structuredClone(reducerInitial);

			const paramLocationName = searchParamsGet.get("locationname");
			const paramBuildingname = searchParamsGet.get("buildingname");
			const paramAddress = searchParamsGet.get("address");
			const paramPostalcode = searchParamsGet.get("postalcode");
			const paramProvince = searchParamsGet.getAll("province");
			const paramCity = searchParamsGet.getAll("city");
			const paramDepartment = searchParamsGet.getAll("department");

			if (paramLocationName) loadValues.values.locationName = paramLocationName;
			if (paramBuildingname) loadValues.values.buildingName = paramBuildingname;
			if (paramBuildingname) loadValues.values.buildingName = paramBuildingname;
			if (paramAddress) loadValues.values.address = paramAddress;
			if (paramPostalcode) loadValues.values.postalCode = paramPostalcode;

			if (paramProvince.length !== 0) {
				loadValues.values.provinceValue = fetchProvinceList(
					action.payload.elementsOptions.province,
					action.payload.lang,
				);
			}

			if (paramCity.length !== 0) {
				loadValues.values.cityValue = fetchCityList(
					action.payload.elementsOptions.city,
					action.payload.lang,
				);
			}

			if (paramDepartment.length !== 0) {
				loadValues.values.departmentValue = fetchDepartmentList(
					action.payload.elementsOptions.department,
					action.payload.lang,
				);
			}

			return loadValues;

		case ACTIONS.LOCATIONNAME:
			return {
				...state,
				values: {
					...state.values,
					locationName: action.payload.locationName,
				},
			};

		case ACTIONS.BUILDINGNAME:
			return {
				...state,
				values: {
					...state.values,
					buildingName: action.payload.buildingName,
				},
			};

		case ACTIONS.ADDRESS:
			return {
				...state,
				values: {
					...state.values,
					address: action.payload.address,
				},
			};

		case ACTIONS.POSTALCODE:
			return {
				...state,
				values: {
					...state.values,
					postalCode: action.payload.postalCode,
				},
			};

		case ACTIONS.CITY:
			return {
				...state,
				values: {
					...state.values,
					cityValue: action.payload.cityValue,
				},
			};

		case ACTIONS.PROVINCE:
			return {
				...state,
				values: {
					...state.values,
					provinceValue: action.payload.provinceValue,
				},
			};

		case ACTIONS.DEPARTMENT:
			return {
				...state,
				values: {
					...state.values,
					departmentValue: action.payload.departmentValue,
				},
			};

		default:
			return state;
	}
};
